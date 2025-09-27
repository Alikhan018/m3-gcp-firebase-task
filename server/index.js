// index.js - Fixed CORS implementation
const dotenv = require('dotenv');
dotenv.config();

console.log('🚀 Starting server with CORS...');

const Fastify = require('fastify');
const counterRoutes = require('./src/routes/counter.js');
const { setupSockets } = require('./src/socket.js');

const fastify = Fastify({
    logger: { level: process.env.LOG_LEVEL || 'info' }
});

// Define allowed origins (handle both with and without trailing slash)
const getAllowedOrigins = () => {
    const origins = [process.env.ORIGIN_PATH];

    // Add version without trailing slash if it has one
    if (process.env.ORIGIN_PATH && process.env.ORIGIN_PATH.endsWith('/')) {
        origins.push(process.env.ORIGIN_PATH.slice(0, -1));
    }

    // Add localhost for development
    origins.push('http://localhost:3000', 'http://127.0.0.1:3000');

    return origins.filter(Boolean); // Remove any undefined values
};

const allowedOrigins = getAllowedOrigins();
console.log('📋 Allowed CORS origins:', allowedOrigins);

// CORS function to set headers
const setCorsHeaders = (reply, origin) => {
    if (allowedOrigins.includes(origin)) {
        reply.header('Access-Control-Allow-Origin', origin);
        console.log('✅ CORS origin allowed:', origin);
    } else {
        console.log('❌ CORS origin blocked:', origin);
        // Optionally set a default or reject
        // reply.header('Access-Control-Allow-Origin', allowedOrigins[0]);
    }

    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
};

// Manual CORS handling for all requests
fastify.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;
    console.log('🌍 Request from origin:', origin);

    setCorsHeaders(reply, origin);
});

// Handle preflight OPTIONS requests
fastify.options('*', async (request, reply) => {
    const origin = request.headers.origin;
    console.log('🔍 OPTIONS preflight from:', origin);

    setCorsHeaders(reply, origin);

    return reply.status(200).send();
});

// Test route
fastify.get('/', async (request, reply) => {
    return {
        message: 'Server is running with CORS!',
        firebase: 'Connected ✅',
        cors: 'Manual CORS enabled ✅',
        allowedOrigins: allowedOrigins,
        timestamp: new Date().toISOString()
    };
});

// Register routes
fastify.register(counterRoutes);

const start = async () => {
    try {
        if (setupSockets) {
            setupSockets(fastify.server);
        }

        const address = await fastify.listen({
            port: process.env.PORT || 8080,
            host: '0.0.0.0'
        });

        console.log(`🌐 Server running on ${address}`);
        console.log('🔗 CORS enabled for origins:', allowedOrigins);
        console.log('🚀 Ready to accept requests!');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();