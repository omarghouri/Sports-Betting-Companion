from fastapi import FastAPI, HTTPException, Depends
from supabase import create_client
from dotenv import load_dotenv
import os
supabase_url="https://tbaahynetpwosthiqdzh.supabase.co"
Subabase_API_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiYWFoeW5ldHB3b3N0aGlxZHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjk5MjUsImV4cCI6MjA3NDg0NTkyNX0.ViWgf3oilQDVo5ZKljxp2xAh0331j7zYTQXlIwxc7Z8"

def get_user_bets(user: int, bet_type: str):
  user_bets = supabase.table("bets").select("user_id, result").execute()
  if user_bets.user_id not in user_bets:
    print("User is not in database")

def get_matches(stage: str):
  



