from fastapi import FastAPI, HTTPException, Body, status
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from datetime import datetime, timezone
from google import genai
from pydantic import BaseModel, Field, validator
from typing import Optional, List

# Load environment variables
load_dotenv()

# --- Configuration ---
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if not all([SUPABASE_ANON_KEY, SUPABASE_URL, GEMINI_API_KEY]):
    raise ValueError("Missing required environment variables. Check your .env file.")

# Initialize Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="Sports Betting Companion API")

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models with Validation ---
class Match(BaseModel):
    team1_id: int = Field(..., gt=0, description="ID of team 1")
    team2_id: int = Field(..., gt=0, description="ID of team 2")
    match_date: str = Field(..., description="ISO format datetime string")
    venue: str = Field(..., min_length=1, max_length=200)
    stage: str = Field(..., min_length=1, max_length=100)
    status: str = Field(default="upcoming", pattern="^(upcoming|live|finished)$")

    @validator('team2_id')
    def teams_must_differ(cls, v, values):
        if 'team1_id' in values and v == values['team1_id']:
            raise ValueError('team1_id and team2_id must be different')
        return v

class Bet(BaseModel):
    user_id: str = Field(..., description="UUID of the user")
    match_id: int = Field(..., gt=0)
    bet_type: str = Field(..., pattern="^(team_winner|player_score|other)$")
    bet_on: str = Field(..., min_length=1, max_length=200)
    odds: float = Field(..., gt=0)
    amount: float = Field(..., gt=0, le=10000, description="Bet amount (max $10,000)")

class ResultUpdate(BaseModel):
    match_id: int = Field(..., gt=0)
    score_team1: int = Field(..., ge=0)
    score_team2: int = Field(..., ge=0)

class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500, description="User query")

# --- Endpoints ---

@app.get("/", status_code=status.HTTP_200_OK)
def root():
    return {"status": "Sports Betting API is running", "version": "1.0"}

@app.get("/teams", status_code=status.HTTP_200_OK)
def get_teams():
    try:
        result = supabase.table("teams").select("*").execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Database error fetching teams: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch teams from database"
        )

@app.get("/match_cards", status_code=status.HTTP_200_OK)
def get_match_cards():
    try:
        result = supabase.table("match_cards").select("*").execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Database error fetching match cards: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch match cards from database"
        )

@app.get("/matches", status_code=status.HTTP_200_OK)
def get_matches():
    try:
        result = supabase.table("matches").select("*").execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve matches from database"
        )

@app.post("/matches", status_code=status.HTTP_201_CREATED)
def post_matches(match: Match):
    try:
        if match.status == "upcoming":
            clean_date = match.match_date.replace("Z", "+00:00")
            try:
                match_dt = datetime.fromisoformat(clean_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date format. Use ISO 8601 format."
                )
            
            if match_dt <= datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Match date must be in the future for upcoming matches."
                )

        result = supabase.table("matches").insert(match.dict()).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create match"
            )
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error creating match: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}"
        )
    
# Odds Endpoints

@app.get("/qualifying_odds", status_code=status.HTTP_200_OK)
def get_qualifying_odds():
    """Fetch all qualifying odds data."""
    try:
        # Fetch data from the 'qualifying_odds' table
        result = supabase.table("qualifying_odds").select("*").execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Database error fetching qualifying odds: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch qualifying odds from database"
        )

@app.get("/outright_winning_odds", status_code=status.HTTP_200_OK)
def get_outright_winning_odds():
    """Fetch outright winning odds (e.g., tournament winners)."""
    try:
        # Fetch data from the 'outright_winning_odds' table
        result = supabase.table("outright_winning_odds").select("*").execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Database error fetching outright odds: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch outright winning odds from database"
        )

@app.get("/valuebets", status_code=status.HTTP_200_OK)
def get_value_bets():
    try:
        result = supabase.table("valuebets").select("*").execute()
        
        # Return actual data or demo fallback
        if result.data and len(result.data) > 0:
            return result.data
        else:
            # Demo data for testing
            return [
                {
                    "id": 1,
                    "match": "ARG vs BRA",
                    "market": "Moneyline",
                    "pick": "ARG",
                    "fair_odds": 120,
                    "book": 140,
                    "edge": "4.5%",
                    "ev": "6.2%"
                },
                {
                    "id": 2,
                    "match": "FRA vs GER",
                    "market": "Over 2.5",
                    "pick": "Over",
                    "fair_odds": -110,
                    "book": 105,
                    "edge": "3.1%",
                    "ev": "4.0%"
                },
            ]
    except Exception as e:
        print(f"Database error fetching value bets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch value bets"
        )

# --- GEMINI CHAT ENDPOINT ---
@app.post("/chat", status_code=status.HTTP_200_OK)
def chat(request: ChatRequest):
    """
    AI-powered chat endpoint that uses Gemini to answer betting questions.
    Receives JSON: { "query": "Who is playing today?" }
    Returns: { "response": "AI response text" }
    """
    try:
        query = request.query.strip()
        
        if not query:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query cannot be empty"
            )
        
        context = "Role: You are a sharp sports betting assistant. Keep answers concise and helpful.\n"
        
        # 1. Keyword-based context retrieval
        
        
        if any(word in query.lower() for word in ["team", "play", "match", "game", "schedule"]):
            try:
                teams = supabase.table("teams").select("name, id").limit(20).execute()
                matches = supabase.table("matches").select("*").limit(5).execute()
                
                if teams.data:
                    team_names = [t['name'] for t in teams.data]
                    context += f"\nDATA - Available Teams: {', '.join(team_names)}\n"
                
                if matches.data:
                    context += f"DATA - Recent/Upcoming Matches: {matches.data}\n"
            except Exception as db_error:
                print(f"Context fetch error (matches): {db_error}")

        # keywords for value bets
        if any(word in query.lower() for word in ["bet", "value", "ev", "edge"]):
            try:
                value_bets = supabase.table("valuebets").select("*").limit(3).execute()
                if value_bets.data:
                    context += f"\nDATA - Current High Value Bets: {value_bets.data}\n"
            except Exception as db_error:
                print(f"Value bets fetch error: {db_error}")

       # odds contexts 
        if any(word in query.lower() for word in ["qualify", "outright", "win", "champion", "odds"]):
            try:
                # --- A. OUTRIGHT WINNER ODDS ---
                all_win_odds = supabase.table("outright_winning_odds").select("*").limit(50).execute()
                win_data = []
                if all_win_odds.data:
                    # Filter for specific team mentioned in query
                    relevant_win = [
                        row for row in all_win_odds.data 
                        if str(row.get('team', '')).lower() in query.lower() 
                        or str(row.get('country', '')).lower() in query.lower()
                    ]
                    # Use specific matches if found, else default to top 5
                    win_data = relevant_win if relevant_win else all_win_odds.data[:5]

                if win_data:
                    context += f"\nDATA - Outright Winner Odds: {win_data}\n"

                #  B. QUALIFYING ODDS 
                all_qual_odds = supabase.table("qualifying_odds").select("*").limit(50).execute()
                qual_data = []
                if all_qual_odds.data:
                    # Filter for specific team mentioned in query
                    relevant_qual = [
                        row for row in all_qual_odds.data
                        if str(row.get('team', '')).lower() in query.lower()
                        or str(row.get('country', '')).lower() in query.lower()
                    ]
                    # Use specific matches if found, else default to top 5
                    qual_data = relevant_qual if relevant_qual else all_qual_odds.data[:5]

                if qual_data:
                    context += f"\nDATA - Qualification Odds: {qual_data}\n"

            except Exception as db_error:
                print(f"Odds fetch error: {db_error}")

        # 2. Call Gemini API
        system_instruction = f"""
        {context}
        
        Answer the user's question based on the DATA provided above. 
        If specific data isn't available, provide general betting advice or explain what you'd need.
        Be concise but helpful.
        """

        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"System: {system_instruction}\n\nUser: {query}"
            )
            
            # Extract text from response
            response_text = response.text if hasattr(response, 'text') else str(response)
            
            return {"response": response_text}
        
        except Exception as gemini_error:
            print(f"Gemini API Error: {gemini_error}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable"
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred processing your request"
        )
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)