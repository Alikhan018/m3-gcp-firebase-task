const fetch = require('node-fetch')

const GPU_SERVICE_URL = process.env.GPU_SERVICE_URL;
const GPU_API_TOKEN = process.env.GPU_API_TOKEN;

async function callGpuService(input) {
    const res = await fetch(`${GPU_SERVICE_URL}/compute`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-TOKEN": GPU_API_TOKEN,
        },
        body: JSON.stringify({ input }),
    });

    if (!res.ok) throw new Error("GPU service failed");
    return res.json();
}

module.exports = callGpuService;

