from fastapi import FastAPI, Depends, HTTPException, Header
import time

app = FastAPI()

# simple shared secret for auth between backend <-> gpu service
API_TOKEN = "super-secret-token"  # replace with env var in production

def verify_token(x_api_token: str = Header(...)):
    if x_api_token != API_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/compute")
def compute(data: dict, authorized: bool = Depends(verify_token)):
    """
    Simulates a GPU-heavy computation.
    In real life, you'd load a model (e.g. PyTorch/TensorFlow).
    """
    # simulate GPU compute time
    time.sleep(2)
    input_val = data.get("input", 0)
    result = input_val ** 2  # dummy "GPU" work
    return {"input": input_val, "output": result}
