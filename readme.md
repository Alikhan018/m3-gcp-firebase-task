# Mini Counter App — Full Stack Demo

This repository contains a tiny web app demonstrating integration of **React frontend, Firebase authentication, Fastify backend, Redis caching, and a GPU service**. Deployed on Firebase Hosting, Cloud Run, and GCE.

---

## Live URLs

* **Frontend**: [https://mini-counter-app.web.app/]
* **Backend API (Cloud Run)**: `https://mini-backend-900325120237.us-central1.run.app`
* **GPU Service (Compute Engine)**: Private IP, accessible by backend only

---

## Features

* **User Authentication**: Firebase Auth (email/password)
* **Per-user Counter**: Stored in **Redis** with TTL, synced to **Firestore**
* **Real-time Updates**: Socket.IO for live counter updates
* **Backend**: Fastify API deployed on Cloud Run
* **GPU Service**: FastAPI on GCE with token-protected compute endpoint

---

## Project Structure

```
repo-root/
├─ client/         # React frontend
├─ server/         # Node.js + Fastify backend
├─ gpu/            # Python FastAPI GPU service
├─ .gitignore
├─ README.md
```

---

## Setup Instructions

### Prerequisites

* Node.js >= 18
* Python >= 3.10 (GPU service)
* Firebase Project
* GCP Project (Cloud Run, Compute Engine, Redis)

### Frontend (React + Firebase)

1. Navigate to `client/` and install dependencies:

```bash
cd client
npm install
```

2. Create `.env` file:

```
VITE_FIREBASE_API_KEY=<your_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<your_project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your_project_id>
VITE_BACKEND_URL=https://<cloud-run-url>
```

3. Run locally:

```bash
npm run dev
```

4. Deploy to Firebase Hosting:

```bash
firebase deploy --only hosting
```

### Backend (Fastify + Redis + Firebase Admin)

1. Navigate to `server/` and install dependencies:

```bash
cd server
npm install
```

2. Set environment variables:

```
REDIS_HOST=<redis-ip>
REDIS_PORT=6379
ORIGIN_PATH=https://your-frontend.web.app
FIREBASE_SA=<service_account_json_content>
```

3. Deploy to Cloud Run:

```bash
gcloud run deploy mini-backend \
  --image gcr.io/<project-id>/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars REDIS_HOST=<ip>,REDIS_PORT=6379,ORIGIN_PATH=https://your-frontend.web.app \
  --update-secrets FIREBASE_SA=projects/<project-id>/secrets/firebase-sa:latest
```

### GPU Service (Python FastAPI)

1. SSH into VM:

```bash
gcloud compute ssh gpu-service --zone us-central1-a
```

2. Install dependencies:

```bash
sudo apt update
sudo apt install python3-pip -y
pip3 install fastapi uvicorn
```

3. Create `gpu_service.py`:

```python
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

app = FastAPI()
API_TOKEN = "supersecret"

class ComputeRequest(BaseModel):
    input: str

@app.post("/compute")
async def compute(req: ComputeRequest, x_api_token: str = Header(...)):
    if x_api_token != API_TOKEN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return {"result": f"Processed {req.input}"}
```

4. Run the service:

```bash
uvicorn gpu_service:app --host 0.0.0.0 --port 8000
```

* Backend calls this service using **`X-API-TOKEN`** for security.

---

## Security Notes

* **Firestore rules**: Users can read/write only their own document.
* **Backend API**: Verifies Firebase ID token for every request.
* **Redis**: Not exposed publicly, only accessible by backend.
* **GPU Service**: Private IP and token-protected, backend-only access.
