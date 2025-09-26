const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const userRoutes = require("./src/routes/UserRoutes");
const taskRoutes = require("./src/routes/TaskRoutes");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const sockets = new Map();
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("register", (userId) => {
    sockets.set(userId, socket.id);
  });
  socket.on("disconnect", () => {
    for (const [userId, sId] of sockets.entries()) {
      if (sId === socket.id) sockets.delete(userId);
    }
    console.log("Socket disconnected:", socket.id);
  });
});

app.set("io", io);
app.set("sockets", sockets);

app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/task", taskRoutes);

const MONGO_URI = "mongodb://127.0.0.1:27017/taskdb";
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = 4000;
    server.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => console.error(err));
