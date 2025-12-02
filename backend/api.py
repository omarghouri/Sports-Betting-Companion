from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from datetime import datetime, timezone
from google import genai
from pydantic import BaseModel
from typing import Optional, List

# Load environment variables
load_dotenv()

# --- Configuration ---
# Ensure these are set in your .env file
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# Initialize Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Initialize Gemini Client
# The client automatically looks for GOOGLE_API_KEY in env, or passes it explicitly
client = genai.Client(api_key=GOOGLE_API_KEY)

app = FastAPI(title="Sports Betting Companion API")

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class Match(BaseModel):
    team1_id: int
    team2_id: int
    match_date: str
    venue: str
    stage: str
    status: str = "upcoming"

class Bet(BaseModel):
    user_id: str
    match_id: int
    bet_type: str
    bet_on: str
    odds: int
    amount: float

class ResultUpdate(BaseModel):
    match_id: int
    score_team1: int
    score_team2: int

class ChatRequest(BaseModel):
    query: str

# --- Endpoints ---

@app.get("/")
def root():
    return {"status": "Sports Betting API is running"}

@app.get("/teams")
def get_teams():
    try:
        result = supabase.table("teams").select("*").execute()
        return result.data
    except Exception as e:
        # Return empty list or handle error gracefully
        print(f"Error fetching teams: {e}")
        return [] 

@app.get("/match_cards")
def get_match_cards():
    try:
        result = supabase.table("match_cards").select("*").execute()
        return result.data
    except Exception as e:
        print(f"Error fetching match cards: {e}")
        return []

@app.get("/matches")
def get_matches():
    try:
        result = supabase.table("matches").select("*").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, detail="Unable to retrieve matches")

@app.post("/matches")
def post_matches(match: Match):
    if match.team1_id == match.team2_id:
        raise HTTPException(status_code=400, detail="Teams cannot be the same.")

    try:
        if match.status == "upcoming":
            # Handle potential Z format issues
            clean_date = match.match_date.replace("Z", "+00:00")
            match_dt = datetime.fromisoformat(clean_date)
            if match_dt <= datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Match date must be in the future.")

        result = supabase.table("matches").insert(match.dict()).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/valuebets")
def get_value_bets():
    try:
        result = supabase.table("valuebets").select("*").execute()
        return result.data
    except Exception:
        # Fallback data for demo if table is empty
        return [
            {"id": 1, "match": "ARG vs BRA", "market": "Moneyline", "pick": "ARG", "fair_odds": 120, "book": 140, "edge": "4.5%", "ev": "6.2%"},
            {"id": 2, "match": "FRA vs GER", "market": "Over 2.5", "pick": "Over", "fair_odds": -110, "book": 105, "edge": "3.1%", "ev": "4.0%"},
        ]

# --- GEMINI CHAT ENDPOINT ---
@app.post("/chat")
def chat(request: ChatRequest):
    """
    Receives a JSON body: { "query": "Who is playing?" }
    """
    try:
        query = request.query
        context = "Role: You are a sharp sports betting assistant. Keep answers concise.\n"
        
        # 1. Simple Keyword Search for Context
        # (In production, use Vector Search/Embeddings for better RAG)
        if any(word in query.lower() for word in ["team", "play", "match", "game", "schedule"]):
            try:
                # Fetch only necessary columns to save tokens
                teams = supabase.table("teams").select("name, id").execute()
                matches = supabase.table("matches").select("*").limit(5).execute()
                
                team_names = [t['name'] for t in teams.data] if teams.data else []
                context += f"\nDATA - Available Teams: {', '.join(team_names)}\n"
                context += f"DATA - Recent/Upcoming Matches: {matches.data}\n"
            except Exception as e:
                print(f"Context fetch error: {e}")

        if any(word in query.lower() for word in ["bet", "value", "odds", "money"]):
            try:
                value_bets = supabase.table("valuebets").select("*").limit(3).execute()
                context += f"\nDATA - Current High Value Bets: {value_bets.data}\n"
            except:
                pass

        # 2. Call Gemini
        # We use client.models.generate_content
        
        system_instruction = f"""
        {context}
        
        Answer the user's question based on the DATA provided above. 
        If the data isn't there, say you don't have that specific info live.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"System: {system_instruction}\nUser: {query}"
        )
        
        return {"response": response.text}

    except Exception as e:
        print(f"Gemini Error: {e}")
        # Return a polite error message to the chat
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")