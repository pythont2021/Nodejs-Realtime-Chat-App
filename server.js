import Express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import formatMessage from "./util/message.js";
import {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} from "./util/users.js";
import { info } from "console";

// config app
const app = Express();
app.use(Express.static("Public"));

const httpServer = new createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 4000;

const botName = "chatCord Bot";


app.get("/", (req, res) => {
  res.send("Hello");
});

// emit message
io.on("connection", (socket) => {
  // Get username and room
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    // Join room
    socket.join(user.room);

    // Greet new user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord... !!"));

    // Brodcast when new user joined
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //   Listen for chat messages
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Brodcast when user leave chat
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// Listen port
httpServer.listen(PORT, () =>
  console.log(`Server is running at  http://localhost:${PORT}`)
);
