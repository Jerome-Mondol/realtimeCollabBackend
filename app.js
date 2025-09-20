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

io.on('connection', socket => {
    
    socket.on('join-room', data => {
        const { roomId, emailId } = data;
        console.log('user', emailId, "joined room", roomId);
        emailToSocketMapping.set(emailId, socket.id);
        socket.join(roomId);
        socket.emit('joined-room', {roomId, })
        socket.broadcast.to(roomId).emit('user-joined', { emailId });
    });
});

// Use the shared httpServer to listen on the port
// You can choose to have both listen on the same port (e.g., 8000)
// For this example, I'll put it on 8001 as per your client code.
httpServer.listen(8001, () => {
    console.log("Server started and listening on port 8001");
});
