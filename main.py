from fastapi import FastAPI
from typing import Union
from fastapi.middleware.cors import CORSMiddleware
from logic import get_top_buddies
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in prod!
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the expected request body using Pydantic
class BuddyRequest(BaseModel):
    user_id: str  # Supabase user_id is a string

@app.post("/recommend-buddies")
async def recommend_buddies(body: BuddyRequest):
    user_id = body.user_id
    print("Received user_id:", user_id)
    if not user_id:
        return {"error": "Missing user_id"}
    user_ids = get_top_buddies(user_id)
    return {"user_ids": user_ids}
