app = FastAPI(title="Sports Betting Companion API")


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/teams")
#Gets all teams in database
def get_teams():
    try:
        result = supabase.table("teams").select("*").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, "Team not in Tournament Database")


@app.get("/matches")
def get_matches():
    #Get all matches
    try:
        result = supabase.table("matches").select("*").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400,"Unable to retrieve matches")


@app.post("/matches")
def post_matches(team1_id: int, team2_id: int, match_date: str, venue: str, stage: str, status: str = "upcoming"):
    #Add new match
    if team1_id == team2_id:
        raise HTTPException(status_code=400, detail="Teams cannot be the same.")

    try:
        if status == "upcoming":
            match_dt = datetime.fromisoformat(match_date.replace("Z", "+00:00"))
            if match_dt <= datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Match date must be in the future.")

        result = supabase.table("matches").insert({
            "team1_id": team1_id,
            "team2_id": team2_id,
            "match_date": match_date,
            "venue": venue,
            "stage": stage,
            "status": status
        }).execute()

        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, "Unable to post match")


@app.get("/picks")
#Get all picks
def get_picks():
    try:
        result = supabase.table("bets").select("*").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, "Unable to obtain picks from database")


@app.post("/picks")
#Post new picks in database
def post_picks(user_id: str, match_id: int, bet_type: str, bet_on: str, odds: int, amount: float):
    existing = supabase.table("bets").select("id").eq("user_id", user_id).eq("match_id", match_id).eq("bet_type", bet_type).execute()
    if existing.data and len(existing.data) > 0:
        raise HTTPException(status_code=400, detail="User already made a pick for the same bet type for this match.")

    if bet_type == "winner" and bet_on not in ["team1", "team2"]:
        raise HTTPException(status_code=400, detail="User did not bet on the eligible teams, must bet on team1 or team2")

    try:
        result = supabase.table("bets").insert({
            "user_id": user_id,
            "match_id": match_id,
            "bet_type": bet_type,
            "bet_on": bet_on,
            "odds": odds,
            "amount": amount
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, "Unable to insert post into database")


@app.get("/results")
#Get all results that are completed/finished
def get_results():
    try:
        result = supabase.table("matches").select("*").eq("status", "final").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, "Match has not been completed")


@app.post("/results")
def post_results(match_id: int, score_team1: int, score_team2: int):
#Post results after game is completed
    try:
        supabase.table("matches").update({
            "score_team1": score_team1,
            "score_team2": score_team2,
            "status": "final"
        }).eq("id", match_id).execute()

        if score_team1 != score_team2:
            winner = "team1" if score_team1 > score_team2 else "team2"
            loser = "team2" if winner == "team1" else "team1"

            supabase.table("bets").update({"result": "win"}).eq("match_id", match_id).eq("bet_on", winner).execute()
            supabase.table("bets").update({"result": "loss"}).eq("match_id", match_id).eq("bet_on", loser).execute()
        else:
            supabase.table("bets").update({"result": "push"}).eq("match_id", match_id).execute()

        return {"message": "Results updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, "Unable to add results")


@app.get("/user_bets")
def get_user_bets(user_id: str, bet_type: str):
  #Get all bets for a user filtered by bet type
    try:
        result = supabase.table("bets").select("*").eq("user_id", user_id).eq("bet_type", bet_type).execute()
        return {
            "user_id": user_id,
            "bet_type": bet_type,
            "bets": result.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, "Bet Type or user_id is invalid")
