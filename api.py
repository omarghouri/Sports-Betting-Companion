from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from datetime import datetime, timezone

load_dotenv()
SUPABASE_URL=os.getenv("SUPABASE_URL","")
SUPABASE_ANON_KEY=os.getenv("SUPABASE_ANON_KEY","")

supabase:Client=create_client(SUPABASE_URL,SUPABASE_ANON_KEY)

app=FastAPI(title="Sports Betting Companion API")

@app.get("/teams")
def get_teams():
    """Get all teams."""
    try:
        result = supabase.table("teams").select("*").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, "Team not in Tournament Database")

@app.get("/matches")
def get_matches():
    """Get all matches."""
    try:
        result = supabase.table("matches").select("*").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400,"Unable to retrieve matches")
