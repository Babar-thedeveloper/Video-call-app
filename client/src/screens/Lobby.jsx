import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Input, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, InfoCard } from "../components";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback((data) => {
    const { email, room, users } = data;
    console.log(email, room);
    const remoteSocketId = Array.isArray(users) && users.length > 0 ? users[0] : null;
    navigate(`/room/${room}`, { state: { remoteSocketId } });
  }, [navigate]);

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);

    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <motion.div
          className="absolute -top-24 left-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,var(--glow-primary),transparent_60%)] blur-2xl"
          animate={{ x: [0, 30, 0], y: [0, -18, 0], opacity: [0.55, 0.75, 0.55] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-28 right-[-10%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,var(--glow-secondary),transparent_60%)] blur-2xl"
          animate={{ x: [0, -24, 0], y: [0, 20, 0], opacity: [0.5, 0.72, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[35%] left-[50%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--glow-tertiary),transparent_65%)] blur-3xl"
          animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(255,255,255,0.35),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_right,rgba(2,6,23,0.35),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--highlight),transparent_60%)] mix-blend-soft-light" />
        <div className="absolute inset-0 opacity-50 mix-blend-overlay bg-[repeating-linear-gradient(0deg,var(--grain)_0,var(--grain)_1px,transparent_2px,transparent_5px)]" />
        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[repeating-linear-gradient(90deg,var(--grain)_0,var(--grain)_1px,transparent_2px,transparent_6px)]" />
      </div>

      <motion.button
        onClick={toggleTheme}
        className="fixed right-4 top-4 z-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2.5 shadow-sm"
        aria-label="Toggle theme"
        whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "dark" ? (
          <svg className="h-5 w-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </motion.button>

      <motion.div
        className="mx-auto flex min-h-[100svh] w-full max-w-6xl items-center px-4 pt-20 pb-10 sm:px-6 sm:pt-16 sm:pb-14 lg:py-20"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12">
          <motion.div 
            className="order-1 lg:order-1"
            variants={item}
          >
            <motion.div 
              className="mt-4 flex items-center gap-3"
              variants={item}
            >
              <motion.div 
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] shadow-sm"
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg className="h-6 w-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <div className="text-sm font-semibold tracking-tight">Veeivs Meet</div>
            </motion.div>

            <motion.h1 
              className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
              variants={item}
            >
              Veeivs Video Calling.
              <motion.span 
                className="block text-[var(--accent-primary)]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Your secure meeting portal.
              </motion.span>
            </motion.h1>
            <motion.p 
              className="mt-4 max-w-xl text-sm text-[var(--text-secondary)] sm:text-base"
              variants={item}
            >
              Join meetings in seconds with HD video, reliable calling, and a premium experience built by Veeivs.
            </motion.p>

            <motion.div 
              className="mt-8 hidden grid-cols-1 gap-4 sm:grid-cols-3 lg:grid"
              variants={item}
            >
              <motion.div 
                className="group rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 p-5 shadow-sm"
                whileHover={{ y: -6, rotate: -0.2, boxShadow: "0 18px 60px rgba(0,0,0,0.12)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <svg className="h-5 w-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold">HD Video</div>
                </div>
                <div className="mt-2 text-xs text-[var(--text-secondary)]">Crisp camera preview and remote stream.</div>
              </motion.div>

              <motion.div 
                className="group rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 p-5 shadow-sm"
                whileHover={{ y: -6, rotate: 0.2, boxShadow: "0 18px 60px rgba(0,0,0,0.12)" }}
                transition={{ type: "spring", stiffness: 300, delay: 0.05 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <svg className="h-5 w-5 text-[var(--accent-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold">Controls</div>
                </div>
                <div className="mt-2 text-xs text-[var(--text-secondary)]">Mic/cam toggles and end call.</div>
              </motion.div>

              <motion.div 
                className="group rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 p-5 shadow-sm"
                whileHover={{ y: -6, rotate: -0.15, boxShadow: "0 18px 60px rgba(0,0,0,0.12)" }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <svg className="h-5 w-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold">Theme</div>
                </div>
                <div className="mt-2 text-xs text-[var(--text-secondary)]">Light/Dark mode with persistence.</div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div className="order-2 lg:order-2 lg:h-full" variants={item}>
            <motion.div
              className="h-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
            <Card className="mx-auto w-full max-w-lg shadow-md lg:h-full lg:flex lg:flex-col">
              <CardHeader>
                <CardTitle>Join a room</CardTitle>
                <CardDescription>
                  Enter your email and a room code to start.
                </CardDescription>
              </CardHeader>

              <CardContent className="lg:flex-1 lg:flex lg:flex-col lg:justify-between">
                <form onSubmit={handleSubmitForm} className="space-y-4 sm:space-y-5 lg:flex-1">
                  <Input
                    label="Email"
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />

                  <Input
                    label="Room code"
                    type="text"
                    id="room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. meeting-123"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!email || !room}
                    className="w-full"
                  >
                    Join room
                  </Button>
                </form>

                <div className="mt-5 mb-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/60 p-4 text-xs text-[var(--text-secondary)]">
                  <div className="text-[11px] font-semibold tracking-wide text-[var(--text-tertiary)]">Quick info</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-secondary)]" />
                      Encrypted
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                      Low latency
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-tertiary)]" />
                      No downloads
                    </span>
                  </div>
                  <div className="mt-3 leading-relaxed">
                    Share the room code with your participant and start your call when they join.
                  </div>
                </div>

                <InfoCard className="mt-6 lg:mt-auto">
                  <strong>Tip:</strong> Open this app in two tabs and join the same room to test video calling.
                </InfoCard>
              </CardContent>
            </Card>

            <motion.div
              className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:hidden"
              variants={item}
            >
              <motion.div
                className="group rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 p-5 shadow-sm"
                whileHover={{ y: -6, rotate: -0.2, boxShadow: "0 18px 60px rgba(0,0,0,0.12)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <svg className="h-5 w-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold">HD Video</div>
                </div>
                <div className="mt-2 text-xs text-[var(--text-secondary)]">Crisp camera preview and remote stream.</div>
              </motion.div>

              <motion.div
                className="group rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 p-5 shadow-sm"
                whileHover={{ y: -6, rotate: 0.2, boxShadow: "0 18px 60px rgba(0,0,0,0.12)" }}
                transition={{ type: "spring", stiffness: 300, delay: 0.05 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <svg className="h-5 w-5 text-[var(--accent-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold">Controls</div>
                </div>
                <div className="mt-2 text-xs text-[var(--text-secondary)]">Mic/cam toggles and end call.</div>
              </motion.div>

              <motion.div
                className="group rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 p-5 shadow-sm"
                whileHover={{ y: -6, rotate: -0.15, boxShadow: "0 18px 60px rgba(0,0,0,0.12)" }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <svg className="h-5 w-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold">Theme</div>
                </div>
                <div className="mt-2 text-xs text-[var(--text-secondary)]">Light/Dark mode with persistence.</div>
              </motion.div>
            </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
export default LobbyScreen;
