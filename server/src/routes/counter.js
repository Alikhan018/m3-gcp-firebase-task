// routes/counter.js - With debug logging
const { auth, firestore } = require('../firebase.js');
const { pub } = require('../redis.js');
const callGpuService = require('../gpu.service.js')


module.exports = async function counterRoutes(fastify, opts) {
    fastify.post('/increment', async (request, reply) => {
        try {

            const idToken = request.headers.authorization?.split(' ')[1];
            if (!idToken) {
                return reply.status(401).send({ error: 'Missing token' });
            }
            const decoded = await auth.verifyIdToken(idToken);

            const uid = decoded.uid;
            const userRef = firestore.collection('users').doc(uid);
            const doc = await userRef.get();

            let count = 0;
            if (doc.exists) {
                const currentData = doc.data();
                count = (currentData.count || 0) + 1;

            } else {
                count = 1;
            }
            const gpuResult = await callGpuService(count);
            await userRef.set({ count, updatedAt: new Date().toISOString() }, { merge: true });
            await pub.publish('counterUpdates', JSON.stringify({ userId: uid, count }));
            console.log(gpuResult)
            return { count };
        } catch (err) {
            if (err.code === 'auth/id-token-expired') {
                return reply.status(401).send({ error: 'Token expired' });
            } else if (err.code === 'auth/id-token-revoked') {
                return reply.status(401).send({ error: 'Token revoked' });
            } else if (typeof err.code === 'string' && err.code.startsWith('auth/')) {
                return reply.status(401).send({ error: 'Invalid token' });
            } else {
                return reply.status(500).send({ error: 'Internal server error', details: err.message });
            }
        }
    });
}