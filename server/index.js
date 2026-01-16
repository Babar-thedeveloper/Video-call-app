const { Server } = require("socket.io");


const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    socket.join(room);

    const roomMembers = Array.from(io.sockets.adapter.rooms.get(room) || []);
    const otherUsers = roomMembers.filter((id) => id !== socket.id);
    socket.emit("room:users", { users: otherUsers });

    socket.to(room).emit("user:joined", {
      email,
      id: socket.id,
    });

    socket.emit("room:join", { ...data, users: otherUsers });
    console.log(data);
  });

  socket.on("user:call", ({ to, offer }) => {
    const fromEmail = socketIdToEmailMap.get(socket.id);
    io.to(to).emit("incomingcall", { from: socket.id, fromEmail, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  })

  socket.on("call:rejected", ({ to }) => {
    io.to(to).emit("call:rejected", { from: socket.id });
  });

  socket.on("call:ended", ({ to }) => {
    io.to(to).emit("call:ended", { from: socket.id });
  });

  socket.on("peer:ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("peer:ice-candidate", { from: socket.id, candidate });
  });

});


io.listen(8000);
console.log("Socket server running on port 8000");