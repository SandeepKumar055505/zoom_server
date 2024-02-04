// const express = require('express');
// const bodyParser = require('body-parser');
// const { Server } = require('socket.io');
// const cors = require('cors');

// const app = express();
// const io = new Server({
//   cors: true,
// });

// app.use(bodyParser.json());
// app.use(cors());

// const emailTOSocketMapping = new Map();
// const socketidToSocketMapping = new Map();

// io.on('connection', (socket) => {
//   socket.on('join-room', (data) => {
//     console.log('user joind', emailId, roomId);
//     const { roomId, emailId } = data;
//     emailToSocketMapping.set(emailId, socket.id);
//     socketidToSocketMapping.set(socket.io,emailId)
//     socket.join(roomId);
//     socket.broadcast.to(roomId).emit('user-joined', { emailId });
//   });
// });

// app.listen(8000, () => {
//   console.log('server is running at 8000');
// });

// app.listen(8001, () => {
//   console.log('socket is runnig at 8001');
// });

const { Server } = require('socket.io');
const cors = require('cors');
const express = require('express');

// const io = new Server(8000, {
//   cors: true,
// });

const io = new Server(process.env.PORT || 8000, {
  cors: true,
});

const app = express();
app.use(cors());

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on('connection', (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on('room:join', (data) => {
    console.log('listen');
    const { email, room } = data;
    console.log(email, room, 'room+++++++++');
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit('user:joined', { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit('room:join', data);
  });

  socket.on('user:call', ({ to, offer }) => {
    io.to(to).emit('incomming:call', { from: socket.id, offer });
  });

  socket.on('call:accepted', ({ to, ans }) => {
    io.to(to).emit('call:accepted', { from: socket.id, ans });
  });

  socket.on('peer:nego:needed', ({ to, offer }) => {
    console.log('peer:nego:needed', offer);
    io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
  });

  socket.on('peer:nego:done', ({ to, ans }) => {
    console.log('peer:nego:done', ans);
    io.to(to).emit('peer:nego:final', { from: socket.id, ans });
  });
});
