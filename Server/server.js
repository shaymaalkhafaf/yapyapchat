const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const authRoute = require("./app/routes/auth");

app.use(express.json());

// app.listen("8000", ()=> {
//     console.log("Backend is running")
// })

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    method: ["GET", "POST"],
  } 
});

app.use(cors());

app.use(express.urlencoded({ extended: true }));
  const db = require("./app/models");

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

  app.use("/api/auth", authRoute);

  app.get("/", (req, res) => {
    res.send('Server is running.')
  })

  io.on('connection', (socket) => {
    socket.emit('me', socket.id);

    socket.on('disconnect', () => {
      socket.broadcast.emit("callEnded");
    });

    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
      io.to(userToCall).emit("callUser", { signal: signalData, from, name})
    });

    socket.on("answerCall", (data) => {
      io.to(data.toString()).emit("callAccepted", data.signal)
    });
  })

  const PORT = process.env.PORT || 8000;

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });

