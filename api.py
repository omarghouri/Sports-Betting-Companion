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
