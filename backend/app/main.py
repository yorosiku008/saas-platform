from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, aws_connections, scans

app = FastAPI(title="FinOps JP SaaS API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(aws_connections.router, prefix="/api/v1")
app.include_router(scans.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
