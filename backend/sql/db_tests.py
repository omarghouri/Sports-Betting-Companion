import requests

# --- CONFIGURATION ---
API_KEY = "dea3f3d305c52a91d18c9760439a89ba"   # your API key
BASE_URL = "https://v3.football.api-sports.io"

headers = {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": "v3.football.api-sports.io"
}

def get_data(endpoint, params=None):
    """Fetch data from API-Football (no status checks)."""
    url = f"{BASE_URL}/{endpoint}"
    r = requests.get(url, headers=headers, params=params)
    return r.json()["response"]

# ---- Get fixtures for World Cup 2022 ----
league_id = 1       # FIFA World Cup
season = 2022

fixtures = get_data("fixtures", {"league": league_id, "season": season})

# ---- Print formatted fixtures ----
teams_2022_wc = {
    "Qatar": [],
    "Ecuador": [],
    "England": [],
    "Iran": [],
    "Senegal": [],
    "Netherlands": [],
    "USA": [],
    "Wales": [],
    "Argentina": [],
    "Saudi Arabia": [],
    "Denmark": [],
    "Tunisia": [],
    "Mexico": [],
    "Poland": [],
    "France": [],
    "Australia": [],
    "Morocco": [],
    "Croatia": [],
    "Germany": [],
    "Japan": [],
    "Spain": [],
    "Costa Rica": [],
    "Belgium": [],
    "Canada": [],
    "Switzerland": [],
    "Cameroon": [],
    "Uruguay": [],
    "South Korea": [],
    "Portugal": [],
    "Ghana": [],
    "Brazil": [],
    "Serbia": []
}


for f in fixtures:
    home = f["teams"]["home"]["name"]
    away = f["teams"]["away"]["name"]

    # Print match
    print(f"{home} vs {away}")

    # Add each opponent to the other's list
    if home in teams_2022_wc and away in teams_2022_wc:
        teams_2022_wc[home].append(away)
        teams_2022_wc[away].append(home)

# --- Optional: print summary ---
print("\nOpponents added per team:")
for team, opps in teams_2022_wc.items():
    print(f"{team}: {opps}")


import pandas as pd
from collections import defaultdict

# --- Stage classifier (based on API-Football league.round text) ---
def classify_stage(round_str: str):
    r = (round_str or "").lower()
    if "group" in r:
        return "Group"
    if "round of 16" in r:
        return "RO16"
    if "quarter" in r:   # matches "Quarter-finals" / "Quarterfinals"
        return "Quaterfinals"  # keep user's exact column spelling
    if "semi" in r:
        return "Semifinals"
    if "final" in r and "3rd" not in r and "third" not in r:
        return "Final"
    return None  # ignore 3rd place and others

# --- Collect opponents per team across stages ---
team_data = defaultdict(lambda: {
    "group": [],            # list of (date, opponent)
    "RO16": None,
    "Quaterfinals": None,
    "Semifinals": None,
    "Final": None,
})

for f in fixtures:
    fixture = f["fixture"]
    home = f["teams"]["home"]["name"]
    away = f["teams"]["away"]["name"]
    date = fixture["date"]
    round_name = f["league"]["round"]
    stage = classify_stage(round_name)

    if stage is None:
        continue

    if stage == "Group":
        team_data[home]["group"].append((date, away))
        team_data[away]["group"].append((date, home))
    elif stage == "RO16":
        team_data[home]["RO16"] = away
        team_data[away]["RO16"] = home
    elif stage == "Quaterfinals":
        team_data[home]["Quaterfinals"] = away
        team_data[away]["Quaterfinals"] = home
    elif stage == "Semifinals":
        team_data[home]["Semifinals"] = away
        team_data[away]["Semifinals"] = home
    elif stage == "Final":
        team_data[home]["Final"] = away
        team_data[away]["Final"] = home

# --- Build rows per team with your exact column names ---
rows = []
for team, info in team_data.items():
    # sort group opponents by match date and take up to 3
    group_sorted = sorted(info["group"], key=lambda x: x[0])
    group_opps = [opp for _, opp in group_sorted][:3]
    # pad to 3
    while len(group_opps) < 3:
        group_opps.append("")

    rows.append({
        "Team": team,
        "Oppenent_1_Group_Stage": group_opps[0],
        "Oppenent_2_Group_Stage": group_opps[1],
        "Oppenent_3_Group_Stage": group_opps[2],
        "Opponent_RO16": info["RO16"] or "",
        "Opponent_Quaterfinals": info["Quaterfinals"] or "",
        "Oppenent_Semifinals": info["Semifinals"] or "",
        "Oppenent_Final": info["Final"] or "",
    })

# --- Create DataFrame (named 'ad' per your preference) and save ---
ad = pd.DataFrame(rows).sort_values("Team").reset_index(drop=True)
print(ad.head(10))

# Optional: write to CSV for Google Sheets
ad.to_csv("wc2022_team_opponents_by_round.csv", index=False)
print("Saved: wc2022_team_opponents_by_round.csv")

print("Saved: wc2022_team_opponents_by_round.csv")
