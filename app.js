const express = require('express');
const { createServer } = require('http'); // Import createServer
const { Server } = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const httpServer = createServer(app); // Create an HTTP server instance

// Attach Socket.IO to the shared HTTP server and configure CORS
const io = new Server(httpServer, {
    cors: {
        // This is the origin of your React development server
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"]
    }
});

app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on('connection', socket => {
    
    socket.on('join-room', data => {
        const { roomId, emailId } = data;
        console.log('user', emailId, "joined room", roomId);
        emailToSocketMapping.set(emailId, socket.id);
        socketToEmailMapping.set(socket.id, emailId)
        socket.join(roomId);
        socket.emit('joined-room', {roomId, })
        socket.broadcast.to(roomId).emit('user-joined', { emailId });
    });

    socket.on('call-user', data => {   
        const {emailId, offer} = data;
        const fromEmail = socketToEmailMapping.get(socket.id);
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit('incomming-call', { from: fromEmail, offer });
    });

    socket.on('call-accepted', data => {
        const { emailId, ans } = data;
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit('call-accepted', { ans })
    })
});


httpServer.listen(8001, () => {
    console.log("Server started and listening on port 8001");
});
