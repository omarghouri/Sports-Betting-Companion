# Sports Betting Companion

## Database Design

### Overview
Sports Betting Companion is a data-driven tool that helps users find undervalued soccer bets using historical data and live sportsbook odds. With the 2026 World Cup coming to the US, many new bettors may not know much about the teams or players. Our goal is to make it easier for them to make smarter, data-backed bets. By connecting historical performance data with sportsbook odds, users can identify which teams are statistically undervalued compared to their betting lines.

### Entity Relationship Diagram
erDiagram
    qualifying_odds {
        team text
        odds float4
        comp_id int2
        season int2
    }

    team_performance {
        team text
        goals float4
        penalty_shootout_goals float4
        regulation_penalties_faced float4
        regulation_penalties_saved float4
        xg_non_pen float4
        shots_on_target_xg float4
        shots_total_ex_shots_on_target float4
        first_time_shots float4
        headers float4
        passes float4
        passes_completed float4
        pass_accuracy_pct float4
        long_passes_26m float4
        crosses float4
        through_balls float4
        switch_passes float4
        key_passes float4
        assists float4
        carries float4
        progressive_carries float4
        dribbles float4
        tackles float4
        interceptions float4
        pressures float4
        clearances float4
        blocks float4
        duels_won float4
        duel_lost float4
        aerial_duels float4
        fouls_committed float4
        fouls_won float4
        yellow_cards float4
        red_cards float4
        possession_pct float4
        ga float4
        pka float4
        fk float4
        ck float4
        og float4
        ps_g float4
        psxg_sot float4
        psxg_plus_minus float4
        gcp float4
        att float4
        comp_pct float4
        att_gk float4
        thr float4
        launch_pct float4
        avglen float4
        opp float4
        stp float4
        stp_pct float4
        opa float4
        opa_per_90 float4
        avgdist float4
        qualify float4
        att_1 float4
        launch_pct_1 float4
        avglen_1 float4
        ts_id int2
    }

    wc_2026_quals_standard_stats {
        squad text
        pl int8
        age float4
        poss float4
        mp int8
        starts int8
        min text
        gls int8
        ast int8
        g_a int8
        g_pk int8
        pkatt int8
        crdy int8
        crdr int8
        per90_gls float4
        per90_ast float4
        per90_g_a float4
        per90_g_pk float4
        per90_g_a_pk float4
    }

    wc_2026_quals_shooting_stats {
        squad text
        pl float4
        g90 float4
        gls float4
        sh float4
        sot float4
        sot_pct float4
        sh90 float4
        sot90 float4
        g_per_sh float4
        g_per_sot float4
        dist text
        pk int8
        pkatt int8
    }

    wc_2026_quals_goalkeeping_stats {
        squad text
        ga90 float4
        sota float4
        saves float4
        save_pct float4
        w float4
        d float4
        l float4
        cs float4
        cs_pct float4
        pkatt float4
        pka float4
        pksv float4
        pkm float4
        pk_save_pct float4
    }

    wc_2026_quals_passing_stats {
        team text
        pass_success_pct float4
        accurate_passes_per float4
        successful_long_ball float4
        successful_long_ball_pct float4
        cross_success_pct float4
        crosses_per_match float4
    }

    qualifying_odds ||--o{ team_performance : links
    qualifying_odds ||--o{ wc_2026_quals_standard_stats : links
    qualifying_odds ||--o{ wc_2026_quals_shooting_stats : links
    qualifying_odds ||--o{ wc_2026_quals_goalkeeping_stats : links
    qualifying_odds ||--o{ wc_2026_quals_passing_stats : links

    top_features {
        feature_name text
        ranking int2
    }

    erDiagram
    top_features ||--o{ team_performance : references
    top_features ||--o{ wc_2026_quals_standard_stats : references
    top_features ||--o{ wc_2026_quals_shooting_stats : references
    top_features ||--o{ wc_2026_quals_goalkeeping_stats : references
    top_features ||--o{ wc_2026_quals_passing_stats : references

    top_features {
        id int8
        match text
        market text
        pick text
        current_odds text
    }

    erDiagram
    top_features ||--o{ valuebets : informs




    




### Tables Description

**qualifying_odds**
Stores pre-tournament or pre-match betting odds for teams in World Cup qualification competitions.
This table acts as the central reference point for probabilistic expectations and is used to join all performance datasets by team, competition, and season. It is especially useful as a target or contextual feature source for predictive modeling.

**team_performance**
Contains a comprehensive, team-level performance profile covering attacking, defensive, possession, passing, dueling, and goalkeeping-adjacent metrics.
This table aggregates advanced match actions (xG, pressures, progressive carries, duels, passing types, GK distribution) and is designed to serve as a high-dimensional feature table for team strength evaluation and qualification modeling.

**wc_2026_quals_standard_stats**
Holds traditional team statistics from 2026 World Cup qualification matches, including appearances, minutes, goals, assists, cards, and per-90 rates.
This table provides a baseline statistical view of team output and discipline, making it useful for sanity checks, historical comparisons, and lower-complexity models.

**wc_2026_quals_shooting_stats**
Focuses specifically on shooting volume, efficiency, and shot quality at the team level.
Metrics such as shots, shots on target, shot distance, and conversion ratios allow deeper analysis of chance creation vs finishing efficiency, complementing xG-based features in other tables.

**wc_2026_quals_goalkeeping_stats**
Captures team-level goalkeeping outcomes, including goals allowed per 90, shots on target faced, saves, clean sheets, and penalty performance.
This table isolates the defensive end-state of matches, helping distinguish between poor defending and elite goalkeeping in conceded-goal outcomes.

**wc_2026_quals_passing_stats**
Provides passing efficiency and distribution metrics, including overall pass success, long-ball effectiveness, crossing accuracy, and volume per match.
This table is useful for identifying stylistic differences between teams (possession-based vs direct play) and for augmenting tactical or clustering analyses.

**top_features**
Stores the ranked feature outputs from a model or feature-selection process.
Each row represents a single feature used in analysis or modeling, along with its relative importance or ranking. This table acts as a bridge between raw performance data and decision-making layers, enabling transparency into which statistics most strongly influence predictions, odds evaluation, or betting logic.
Typical use cases
Feature importance tracking for ML models
Model explainability and auditability
Driving downstream logic (e.g., weighting bets or filtering metrics)
Versioning which features matter across seasons or competitions

**valuebets**
Contains identified betting opportunities where market odds differ from model-implied probabilities.
Each row represents a specific match, market, and pick, paired with the current available odds. This table operationalizes model outputs into actionable betting insights, making it the final consumer-facing or decision-support layer of the system.

Typical use cases
Surfacing high-value betting picks
Monitoring market movement vs model confidence
Powering dashboards or alerts
Backtesting betting strategies over time
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
- **Linus**: Created new endpoints on back end to connect to the UI
- **Omar Ghouri**: Organized repository structure / created api.js to manage requests from frontend to backend
- **Bouanani Idrissi Oumaima**:Contributed to backend feature implementation, including refining API logic for bets, value bets, and match validation, participated in end-to-end testing and worked on deployment using Docker and cloud run,and fixed the bugs of the failing frontend and backedn after deplying.
- **Mike D'Auria**: Remade API endpoints and Supbase Tables to reflect the information included in the frontend(valuebets and Team Tournament Performance)

## What It Does
SBC (Sports Betting Companion) analyzes World Cup 2026 matches to identify value betting opportunities by comparing fair odds against sportsbook lines. The platform displays upcoming fixtures, calculates expected value (EV) and edge percentages, and provides a chatbot interface for querying betting information. Users can quickly scan high-value bets across different markets including moneylines, handicaps, totals, and prop bets.

## Frontend Setup
- npm install
- npm run dev

## Mock Data
Our app uses mock data for World Cup 2026 fixtures, betting lines, and value calculations. The odds, edge percentages, and EV metrics are illustrative examples based on typical sports betting scenarios. Next week we'll connect it to our backend APIs for real-time odds feeds and live model predictions.
