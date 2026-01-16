import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../context/SocketProvider";
import { useCallback } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Button, IconButton, Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalActions, Card } from "../components";
import peer from "../servise/peer";

const RoomPage = () => {
  const socket = useSocket();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [remoteSocketId, setRemotesocketId] = useState(() => location?.state?.remoteSocketId || null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState("idle");
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerCleanupRef = useRef(null);
  const myStreamRef = useRef(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`${email} joined the room`);
    setRemotesocketId(id)
  }, []);

  const handleRoomUsers = useCallback(({ users }) => {
    if (Array.isArray(users) && users.length > 0) {
      setRemotesocketId(users[0]);
    }
  }, []);

  const cleanupCall = useCallback(() => {
    if (peerCleanupRef.current) {
      peerCleanupRef.current();
      peerCleanupRef.current = null;
    }

    if (myStreamRef.current) {
      myStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    myStreamRef.current = null;
    setMyStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
    setCallState("idle");
    setIsMicOn(true);
    setIsCamOn(true);

    if (myVideoRef.current) myVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    peer.reset();
  }, []);

  const bindPeerListeners = useCallback(
    (targetSocketId) => {
      const onTrack = (ev) => {
        const [stream] = ev.streams;
        if (stream) setRemoteStream(stream);
      };

      const onIceCandidate = (ev) => {
        if (ev.candidate && targetSocketId) {
          socket.emit("peer:ice-candidate", {
            to: targetSocketId,
            candidate: ev.candidate.toJSON(),
          });
        }
      };

      peer.peer.addEventListener("track", onTrack);
      peer.peer.addEventListener("icecandidate", onIceCandidate);

      return () => {
        peer.peer.removeEventListener("track", onTrack);
        peer.peer.removeEventListener("icecandidate", onIceCandidate);
      };
    },
    [socket]
  );

  const handleIncomingCall = useCallback(({ from, fromEmail, offer }) => {
    console.log("Incoming call", from, fromEmail, offer);
    setIncomingCall({ from, fromEmail, offer });
    setRemotesocketId(from);
    setCallState("incoming");
  }, []);

  const handleCallAccepted = useCallback(
    async ({ from, ans }) => {
      try {
        await peer.setRemoteAnswer(ans);
        console.log("Call accepted", from, ans);
        setCallState("in_call");
      } catch (err) {
        console.error("Error setting remote answer:", err);
        cleanupCall();
      }
    },
    [cleanupCall]
  );

  const handleCallRejected = useCallback(
    ({ from }) => {
      console.log("Call rejected", from);
      cleanupCall();
      navigate("/");
    },
    [cleanupCall, navigate]
  );

  const handleCallEnded = useCallback(
    ({ from }) => {
      console.log("Call ended", from);
      cleanupCall();
      navigate("/");
    },
    [cleanupCall, navigate]
  );

  const handleIceCandidate = useCallback(async ({ from, candidate }) => {
    try {
      await peer.addIceCandidate(candidate);
    } catch (err) {
      console.error("Error adding received ICE candidate:", err);
    }
  }, []);

  const startCall = useCallback(async () => {
    if (!remoteSocketId) return;
    if (callState !== "idle") return;

    setCallState("calling");
    try {
      peer.reset();
      if (peerCleanupRef.current) peerCleanupRef.current();
      peerCleanupRef.current = bindPeerListeners(remoteSocketId);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      myStreamRef.current = stream;
      setMyStream(stream);
      const offer = await peer.getOffer(stream);
      socket.emit("user:call", { to: remoteSocketId, offer });
    } catch (err) {
      console.error("Error starting call:", err);
      cleanupCall();
    }
  }, [remoteSocketId, callState, socket, bindPeerListeners, cleanupCall]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    setCallState("calling");
    try {
      peer.reset();
      if (peerCleanupRef.current) peerCleanupRef.current();
      peerCleanupRef.current = bindPeerListeners(incomingCall.from);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      myStreamRef.current = stream;
      setMyStream(stream);
      const ans = await peer.getAnswer(incomingCall.offer, stream);
      socket.emit("call:accepted", { to: incomingCall.from, ans });
      setIncomingCall(null);
      setCallState("in_call");
    } catch (err) {
      console.error("Error accepting call:", err);
      cleanupCall();
    }
  }, [incomingCall, socket, bindPeerListeners, cleanupCall]);

  const rejectCall = useCallback(async () => {
    if (!incomingCall) return;
    socket.emit("call:rejected", { to: incomingCall.from });
    cleanupCall();
    navigate("/");
  }, [incomingCall, socket, cleanupCall, navigate]);

  const endCall = useCallback(async () => {
    if (remoteSocketId) {
      socket.emit("call:ended", { to: remoteSocketId });
    }
    cleanupCall();
    navigate("/");
  }, [remoteSocketId, socket, cleanupCall, navigate]);

  const joinAnotherRoom = useCallback(async () => {
    if (callState !== "idle" && remoteSocketId) {
      socket.emit("call:ended", { to: remoteSocketId });
    }
    cleanupCall();
    navigate("/");
  }, [callState, remoteSocketId, socket, cleanupCall, navigate]);

  const toggleMic = useCallback(() => {
    if (!myStream) return;
    const next = !isMicOn;
    myStream.getAudioTracks().forEach((t) => (t.enabled = next));
    setIsMicOn(next);
  }, [myStream, isMicOn]);

  const toggleCam = useCallback(() => {
    if (!myStream) return;
    const next = !isCamOn;
    myStream.getVideoTracks().forEach((t) => (t.enabled = next));
    setIsCamOn(next);
  }, [myStream, isCamOn]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("room:users", handleRoomUsers);
    socket.on("incomingcall", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:rejected", handleCallRejected);
    socket.on("call:ended", handleCallEnded);
    socket.on("peer:ice-candidate", handleIceCandidate);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("room:users", handleRoomUsers);
      socket.off("incomingcall", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("call:rejected", handleCallRejected);
      socket.off("call:ended", handleCallEnded);
      socket.off("peer:ice-candidate", handleIceCandidate);
    };
  }, [socket, handleUserJoined, handleRoomUsers, handleIncomingCall, handleCallAccepted, handleCallRejected, handleCallEnded, handleIceCandidate]);

  useEffect(() => {
    if (myVideoRef.current && myStream) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    myStreamRef.current = myStream;
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, []);

  const getStatusColor = () => {
    switch (callState) {
      case "in_call": return "bg-emerald-500 dark:bg-emerald-400";
      case "calling": return "bg-amber-500 dark:bg-amber-400";
      case "incoming": return "bg-sky-500 dark:bg-sky-400";
      default: return "bg-slate-400 dark:bg-slate-500";
    }
  };

  const getStatusText = () => {
    switch (callState) {
      case "in_call": return "In call";
      case "calling": return "Calling...";
      case "incoming": return "Incoming call";
      default: return "Ready";
    }
  };

  return (
    <div className="min-h-[100svh] bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--glow-primary),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,var(--glow-secondary),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,var(--glow-tertiary),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--highlight),transparent_60%)] mix-blend-soft-light" />
        <div className="absolute inset-0 opacity-45 mix-blend-overlay bg-[repeating-linear-gradient(0deg,var(--grain)_0,var(--grain)_1px,transparent_2px,transparent_5px)]" />
        <div className="absolute inset-0 opacity-35 mix-blend-overlay bg-[repeating-linear-gradient(90deg,var(--grain)_0,var(--grain)_1px,transparent_2px,transparent_6px)]" />
      </div>
      <motion.div
        className="mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 pb-[calc(1rem+env(safe-area-inset-bottom))] gap-4 sm:gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <motion.div
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 px-4 py-4 sm:px-6 shadow-lg backdrop-blur-xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--accent-primary),var(--accent-tertiary))] shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Video Room</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {remoteSocketId ? "Participant connected" : "Waiting for participant..."}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={joinAnotherRoom}
              className="rounded-full"
            >
              Join another room
            </Button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5">
              <div className={`h-2 w-2 rounded-full ${getStatusColor()} animate-pulse`} />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{getStatusText()}</span>
            </div>
            <button
              onClick={toggleTheme}
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </motion.div>

        <motion.div
          className="relative flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-2xl min-h-[68svh] sm:min-h-0"
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.25))]" />

          <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 h-24 w-32 sm:h-44 sm:w-60 overflow-hidden rounded-2xl border-2 border-white dark:border-slate-700 bg-slate-900 shadow-2xl">
            <video ref={myVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            {!myStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-700">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-400">You</p>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {!remoteStream && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg className="h-10 w-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </motion.div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {callState === "in_call" ? "Connecting..." : "No one here yet"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {callState === "in_call" ? "Establishing connection" : "Start a call to see remote video"}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 rounded-2xl sm:rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 px-3 py-2 shadow-lg backdrop-blur-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
        >
          <Button
            variant="success"
            size="sm"
            disabled={!remoteSocketId || callState !== "idle"}
            onClick={startCall}
            title="Start call"
            icon={
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            }
          >
            Call
          </Button>

          <Button
            variant="danger"
            size="sm"
            disabled={callState === "idle"}
            onClick={endCall}
            title="End call"
            icon={
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            }
          >
            End
          </Button>

          <div className="hidden sm:block mx-1 h-6 w-px bg-slate-300 dark:bg-slate-600" />

          <IconButton
            variant={isMicOn ? "ghost" : "ghostDanger"}
            disabled={!myStream}
            onClick={toggleMic}
            title={isMicOn ? "Mute microphone" : "Unmute microphone"}
          >
            {isMicOn ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            )}
          </IconButton>

          <IconButton
            variant={isCamOn ? "ghost" : "ghostDanger"}
            disabled={!myStream}
            onClick={toggleCam}
            title={isCamOn ? "Turn off camera" : "Turn on camera"}
          >
            {isCamOn ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            )}
          </IconButton>
        </motion.div>

        <Modal isOpen={callState === "incoming" && !!incomingCall}>
          <ModalContent>
            <ModalHeader
              icon={
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              }
            >
              <ModalTitle>Incoming call</ModalTitle>
              <ModalDescription>
                From: {incomingCall?.fromEmail || incomingCall?.from}
              </ModalDescription>
            </ModalHeader>
            <ModalActions>
              <Button
                variant="success"
                size="lg"
                onClick={acceptCall}
                className="flex-1 animate-pulse hover:animate-none"
                icon={
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                }
              >
                Accept
              </Button>
              <Button
                variant="danger"
                size="lg"
                onClick={rejectCall}
                className="flex-1"
                icon={
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                }
              >
                Reject
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      </motion.div>
    </div>
  );
};

export default RoomPage;
