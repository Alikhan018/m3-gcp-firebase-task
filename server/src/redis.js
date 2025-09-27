const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});
const pub = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});
const sub = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});


module.exports = { redis, pub, sub };