# Sports Betting Companion

## Database Design

### Overview
Sports Betting Companion is a data-driven tool that helps users find undervalued soccer bets using historical data and live sportsbook odds. With the 2026 World Cup coming to the US, many new bettors may not know much about the teams or players. Our goal is to make it easier for them to make smarter, data-backed bets. By connecting historical performance data with sportsbook odds, users can identify which teams are statistically undervalued compared to their betting lines.

### Entity Relationship Diagram
```mermaid
erDiagram
    USERS {
        id uuid PK
        username text
        email text
        password_hash text
        balance numeric
        created_at timestamptz
    }

    TEAMS {
        id bigint PK
        PI float
        Age float
        Poss float
        PrgC float
        PrgP float
        Gls float
        Ast float
        G_A float
        G_PK float
        G_A_PK float
        xG float
        xAG float
        xG_plus_xAG float
        npxG float
        npxG_plus_xAG float
        Group_Stage_Opponent_1 text
        Group_Stage_Opponent_2 text
        Group_Stage_Opponent_3 text
        RO16_Opponent text
        Quarterfinal_Opponent text
        SemiFinal_Opponent text
        Final_Opponent text
    }

    PLAYERS {
        id bigint PK
        name text
        team_id bigint FK
        position text
    }

    MATCHES {
        id bigint PK
        team1_id bigint FK
        team2_id bigint FK
        match_date timestamptz
        score_team1 int
        score_team2 int
        status text
    }

    BETS {
        id bigint PK
        user_id uuid FK
        match_id bigint FK
        bet_type text
        bet_on text
        odds numeric
        amount numeric
        result text
        created_at timestamptz
    }

    USERS ||--o{ BETS : places
    MATCHES ||--o{ BETS : contains
    TEAMS ||--o{ PLAYERS : has
    TEAMS ||--o{ MATCHES : team1
    TEAMS ||--o{ MATCHES : team2
```

### Tables Description

#### 1) `users`
Stores user information and account balance.
- `id` (UUID, PK)  
- `username` (TEXT)  
- `email` (TEXT, unique)  
- `password_hash` (TEXT)  
- `balance` (NUMERIC) – user’s account balance  
- `created_at` (TIMESTAMPTZ, default now)

#### 2) `teams`
Represents each national team.
- `id` (BIGINT, PK)  
- '#Pl' float -Players Used
- Age, float -Average Age of players used
- Possession, float -Average Possession for team throughout tournament
- PrgC, float - Progressive Passes Completed
- ProP, float - Progressive Passes Attempted
- Goals, float - Goals Scored
- Ast, float- Assists
- G + A, float, Goals + Assists
- G + A - PK, float - Goals not including penalty kicks
- xG, float - Expected Goals
- xAG, float - Expected Goals Against
- xG - xAG, float - Difference between Expected Goals and Excepted Goals against
- Group_Stage_Opponent_1, text -Name of the first opponent the team faces during the group stage of a tournament.
- Group_Stage_Opponent_2, text -Name of the second opponent in the group stage.
- Group_Stage_Opponent_3, text -Name of the third opponent in the group stage.
- RO16_Opponent, text -The opponent team the club/nation plays in the Round of 16 (knockout phase).
- Quarterfinal_Opponent, text -The opposing team in the Quarter-Final round, if the team advances that far.
- Column	Data Type	Explanation
Group_Stage_Opponent_1	text	Name of the first opponent the team faces during the group stage of a tournament.
Group_Stage_Opponent_2	text	Name of the second opponent in the group stage.
Group_Stage_Opponent_3	text	Name of the third opponent in the group stage.
RO16_Opponent	text	The opponent team the club/nation plays in the Round of 16 (knockout phase).
Quarterfinal_Opponent	text -The opposing team in the Quarter-Final round, if the team advances that far.
SemiFinal_Opponent, text	-The opponent faced in the Semi-Final stage of the tournament.
Final_Opponent, text -The final match opponent if the team reaches the championship game.

#### 3) `players`
Links individual players to their team.
- `id` (BIGINT, PK)  
- `name` (TEXT)  
- `team_id` (BIGINT, FK → teams.id)  
- `position` (TEXT)

#### 4) `matches`
Stores match information and outcomes.
- `id` (BIGINT, PK)  
- `team1_id` (BIGINT, FK → teams.id)  
- `team2_id` (BIGINT, FK → teams.id)  
- `match_date` (TIMESTAMPTZ)  
- `score_team1` (INT)  
- `score_team2` (INT)  
- `status` (TEXT: scheduled, in_progress, finished)  
- `stage` (TEXT) – tournament stage (Group, R16, etc.)  
- `venue` (TEXT)  
- `api_ref` (TEXT) – optional external reference

#### 5) `bets`
Tracks bets users place on matches.
- `id` (BIGINT, PK)  
- `user_id` (UUID, FK → users.id)  
- `match_id` (BIGINT, FK → matches.id)  
- `bet_type` (TEXT) – e.g., moneyline, spread, total  
- `bet_on` (TEXT) – team or outcome bet on  
- `odds` (NUMERIC) – American odds  
- `amount` (NUMERIC) – wagered amount  
- `result` (TEXT: pending, won, lost, void)  
- `created_at` (TIMESTAMPTZ, default now)

### Security Model
We use **Row Level Security (RLS)** to ensure that users can only view and modify their own data.  
- Only authenticated users can add or view their personalized bet analyses.
- Furthermore, for data privacy reasons, we restrict the Bets and Users tables to respect the users who use our product.
- Code: alter policy "Enable read access for all users"
2
on "public"."matches"
5
to public
6
using (

# Sports Betting Companion API

## What it does
Our API connects to Supabase tables to implement business logic for a sports prediction platform. It allows users to view teams, players, matches, and record their predictions. 

## Setup
1. `pip install -r requirements.txt`
2. Add `.env` with Supabase credentials
3. `uvicorn api:app --reload`
4. Test at http://localhost:8000/docs

## Endpoints
- GET /teams – Retrieve all teams
- GET /matches – Retrieve all matches
- POST /matches – Add a new match
- GET /picks – Get all user predictions
- POST /picks – Add a new prediction
- GET /results – Retrieve match results
- POST /results – Add or update a match result
- GET /user_bets – Retrieve bets by user and type
- GET /valuebets - Retrieves valuebets from Supabase
- POST /valuebets - Posts the highest probability of success valuebets into frontend

## Key Business Rule
Endpoint 1: get_teams()
- Displays all teams stored in the teams table.
- Each team includes its name, country code, and group.

Endpoint 2: get_matches() / post_matches()
- Returns all matches in the matches table, including team names, match date, and stage.
- Adds a new match.
- Requires team1_id, team2_id, match_date, and venue.
- Ensures the date is in the future and teams are not the same.

Endpoint 3: get_picks() / post_picks()
- Retrieves all user predictions stored in the bets table.
- Creates a new prediction for a user.
- Prevents duplicate predictions for the same user and match.
- Only allows predictions for upcoming matches.

Endpoint 4: get_results() / post_results()
- Returns finalized match results with scores.
- Allows updating results (e.g., setting final scores and marking matches as complete).

Endpoint 5: get_user_bets()
- Retrieves all bets for a specific user and bet_type.
- Returns their past predictions and outcomes.

### Key Business Rules
- Users cannot create duplicate picks for the same match.
- Match date must be in the future for upcoming matches.
- team1_id and team2_id must be different.
- When results are posted, related bets are automatically marked as win, loss, or push.

### Setup Instructions
- pip install supabase
- python test_connection.py
- python db_tests.py

### Prerequisites
- Python 3.10+
- Supabase account


# Frontend Components

## Team & Contributions
- **Linus**: Remade connections from endpoints to frontend
- **Omar Ghouri**: Organized repository structure
- **Bouanani Idrissi Oumaima**: 
- **Mike D'Auria**: Remade API endpoints and Supbase Tables to reflect the information included in the frontend(valuebets and Team Tournament Performance)

## What It Does
SBC (Sports Betting Companion) analyzes World Cup 2026 matches to identify value betting opportunities by comparing fair odds against sportsbook lines. The platform displays upcoming fixtures, calculates expected value (EV) and edge percentages, and provides a chatbot interface for querying betting information. Users can quickly scan high-value bets across different markets including moneylines, handicaps, totals, and prop bets.

## Frontend Setup
- npm install
- npm run dev

## Mock Data
Our app uses mock data for World Cup 2026 fixtures, betting lines, and value calculations. The odds, edge percentages, and EV metrics are illustrative examples based on typical sports betting scenarios. Next week we'll connect it to our backend APIs for real-time odds feeds and live model predictions.
