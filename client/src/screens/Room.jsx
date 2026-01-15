import React, { useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useCallback } from "react";
import { useState } from "react";

const RoomPage = () => {
  const socket = useSocket();
const [remoteSocketId,setRemotesocketId]=useState(null);



  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`${email} joined the room`);
    setRemotesocketId(id)
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    return () => {
      socket.off("user:joined", handleUserJoined);
    };
  }, [socket, handleUserJoined]);

  return (
    <div>
      <h1>Roompage</h1>
      <h4>{remoteSocketId?'conneted':'No one is the room '}</h4>
      {remoteSocketId && <button>Call</button>}
    </div>
  );
};

export default RoomPage;
