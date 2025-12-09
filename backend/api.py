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
#stats endpointsto
@app.get("/stats", status_code=status.HTTP_200_OK)
def get_stats(category: str = "standard", team_id: Optional[int] = None):
    """
    Fetch raw stats from one of the 4 specific tables.
    Categories: 'standard', 'shooting', 'passing', 'goalkeeping'
    """
    # Map simple category names to your exact Supabase table names
    table_map = {
        "standard": "2026 WC Quals Standard Stats",
        "shooting": "2026 WC Quals Shooting Stats",
        "passing": "2026 WC Quals Passing Stats",
        "goalkeeping": "2026 WC Quals Goalkeeping Stats"
    }
    
    table_name = table_map.get(category.lower())
    
    if not table_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Invalid category. Available: {', '.join(table_map.keys())}"
        )

    try:
        query = supabase.table(table_name).select("*")
        if team_id:
            query = query.eq("team_id", team_id)
        
        result = query.execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"DB Error fetching {category} stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to fetch {category} stats"
        )


@app.get("/top_features", status_code=status.HTTP_200_OK)
def get_top_features():
    """
    Fetch the list of most important features determined by the ML model.
    """
    try:
        result = supabase.table("top_features").select("*").order("ranking", desc=False).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"DB Error fetching features: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch ML features"
        )

# --- GEMINI CHAT ENDPOINT ---
@app.post("/chat", status_code=status.HTTP_200_OK)
def chat(request: ChatRequest):
    try:
        query = request.query.strip().lower()
        if not query:
            raise HTTPException(status_code=400, detail="Query empty")
        
        context = "Role: Sports betting assistant. Use the provided DATA to answer.\n"
        
        # 1. Detect Teams
        mentioned_team_ids = []
        try:
            all_teams = supabase.table("teams").select("id, name").execute()
            if all_teams.data:
                for team in all_teams.data:
                    if team['name'].lower() in query:
                        mentioned_team_ids.append(team['id'])
                        context += f"Detected Team: {team['name']} (ID: {team['id']})\n"
        except Exception as e:
            print(f"Team lookup warning: {e}")

        # 2. General Keywords
        if any(w in query for w in ["match", "game", "vs", "play", "schedule"]):
            try:
                matches = supabase.table("matches").select("*").limit(5).execute()
                if matches.data: context += f"\nUpcoming Matches: {matches.data}\n"
            except: pass

        if any(w in query for w in ["bet", "value", "odds", "money", "wager"]):
            try:
                val_bets = supabase.table("valuebets").select("*").limit(3).execute()
                if val_bets.data: context += f"\nTop Value Bets: {val_bets.data}\n"
            except: pass

        # 3. Tournament/Winning/Qualifying Odds (RESTORED)
        # Triggers on: qualify, outright, winner, champion, cup, tournament
        odds_keywords = ["qualify", "outright", "winner", "champion", "tournament", "cup", "who will win"]
        if any(w in query for w in odds_keywords):
            try:
                # Fetch Outright Winning Odds
                outright = supabase.table("outright_winning_odds").select("*").limit(30).execute()
                if outright.data:
                    context += f"\nDATA - Outright Winning Odds: {outright.data}\n"
                
                # Fetch Qualifying Odds
                qualifying = supabase.table("qualifying_odds").select("*").limit(10).execute()
                if qualifying.data:
                    context += f"\nDATA - Qualifying Odds: {qualifying.data}\n"
            except Exception as e:
                print(f"Odds fetch error: {e}")

        # 4. Stats & Analysis
        stat_triggers = ["stat", "shoot", "goal", "xg", "perform", "analysis", "win", "chance", "predict", "who"]
        should_fetch_stats = any(w in query for w in stat_triggers) or len(mentioned_team_ids) > 0

        if should_fetch_stats:
            try:
                # Top Features
                top_feats = supabase.table("top_features").select("feature_name, ranking").order("ranking").limit(5).execute()
                if top_feats.data:
                    feats = [f"{f['feature_name']} (Rank #{f['ranking']})" for f in top_feats.data]
                    context += f"\nDATA - Model's Top Predictive Stats: {', '.join(feats)}\n"

                # Specific Team Stats
                if mentioned_team_ids:
                    for table in [
                        "2026 WC Quals Standard Stats",
                        "2026 WC Quals Shooting Stats",
                        "2026 WC Quals Passing Stats", 
                        "2026 WC Quals Goalkeeping Stats"
                    ]:
                        stats = supabase.table(table).select("*").in_("team_id", mentioned_team_ids).execute()
                        if stats.data:
                            context += f"\nDATA - {table} for mentioned teams: {stats.data}\n"
            except Exception as e:
                print(f"Stats fetch error: {e}")

        # 5. Generate Answer
        system_instruction = f"""
        {context}
        
        Answer based on the DATA provided.
        1. If 'Top Predictive Stats' are listed, prioritize them for match analysis.
        2. If specific stats for mentioned teams are found, compare them.
        3. If asking about tournament winners or qualification, use the Outright/Qualifying Odds data.
        """

        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"System: {system_instruction}\n\nUser: {request.query}"
            )
            return {"response": response.text}
        except Exception as e:
            print(f"Gemini Error: {e}")
            raise HTTPException(status_code=503, detail="AI Service Unavailable")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail="Processing failed")

    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)