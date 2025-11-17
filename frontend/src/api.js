const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Replace this with an actual user id from your DB
const DEMO_USER_ID = 11111111-2222-3333-4444-555555555555;

export async function fetchUserBets(betType = "team_winner") {
  const url = `${API_BASE}/user_bets?user_id=${encodeURIComponent(
    DEMO_USER_ID
  )}&bet_type=${encodeURIComponent(betType)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json(); // { user_id, bet_type, bets: [...] }
}
