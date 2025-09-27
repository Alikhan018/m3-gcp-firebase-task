// socket.js - Fixed version with proper CORS
const { Server } = require('socket.io');
const { sub } = require('./redis.js');

function setupSockets(server) {
    // Handle CORS origins - fix the trailing slash issue
    const getAllowedOrigins = () => {
        const origins = [process.env.ORIGIN_PATH];

        // Add version without trailing slash if it has one
        if (process.env.ORIGIN_PATH && process.env.ORIGIN_PATH.endsWith('/')) {
            origins.push(process.env.ORIGIN_PATH.slice(0, -1));
        }

        // Add localhost for development
        origins.push('http://localhost:3000', 'http://127.0.0.1:3000');
        return origins.filter(Boolean);
    };

    const allowedOrigins = getAllowedOrigins();
    console.log('🔌 Socket.io CORS origins:', allowedOrigins);

    const io = new Server(server, {
        cors: {
            origin: allowedOrigins, // This was the main fix!
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true
    });

    // Subscribe to Redis updates
    sub.subscribe('counterUpdates');
    sub.on('message', (channel, message) => {
        if (channel === 'counterUpdates') {
            try {
                const data = JSON.parse(message);
                io.to(data.userId).emit('countUpdated', data);
            } catch (err) {
                console.error('Error parsing Redis message:', err);
            }
        }
    });

    io.on('connection', (socket) => {
        console.log('✅ Client connected:', socket.id);

        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);
        });

        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id);
        });
    });

    return io;
}

module.exports = { setupSockets };