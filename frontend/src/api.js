const API_BASE = "http://localhost:8000"; // FastAPI URL

export async function fetchValueBets() {
  const res = await fetch(`${API_BASE}/valuebets`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json(); // this should be the array from your /valuebets endpoint
}

export async function fetchMatchCards() {
  const res = await fetch(`${API_BASE}/match_cards`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}