from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import json
import os

app = FastAPI()

class MT5Credentials(BaseModel):
    login: int
    password: str
    server: str
    days_back: int = 30

@app.post("/api/sync")
async def sync_trades(creds: MT5Credentials):
    # Call the mt5_sync script using subprocess
    env = os.environ.copy()
    env["MT5_LOGIN"] = str(creds.login)
    env["MT5_PASSWORD"] = creds.password
    env["MT5_SERVER"] = creds.server
    env["DAYS_BACK"] = str(creds.days_back)

    try:
        result = subprocess.run(
            ["python3", "mt5_sync.py"],
            capture_output=True,
            text=True,
            env=env
        )
        data = json.loads(result.stdout)
        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error"])
        return {"trades": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
