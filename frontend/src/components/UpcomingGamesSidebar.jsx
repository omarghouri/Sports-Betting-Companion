import React, { useState, useEffect } from "react";
import { Icons } from "./Icons";
import { USE_MOCK_API, API_BASE_URL } from "../config";

export default function UpcomingGamesSidebar() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
        if (USE_MOCK_API) {
            setMatches([
                { id: 1, team1: "USA", team2: "Mexico", venue: "Azteca", date: "2026-06-11T20:00:00", stage: "Group A" },
                { id: 2, team1: "France", team2: "Germany", venue: "SoFi Stadium", date: "2026-06-12T18:00:00", stage: "Group B" },
            ]);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/match_cards`);
            if(res.ok) {
                const data = await res.json();
                setMatches(data.filter(m => m.status === "upcoming" || m.status === "finished"));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    loadMatches();
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Icons.Calendar style={{ width: '16px', height: '16px', color: '#10b981', marginRight: '8px' }} />
        <h3 className="title">Upcoming Matches</h3>
      </div>
      
      <div className="match-list">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '16px' }}>Loading schedule...</div>
        ) : (
          matches.map((match, i) => {
            const date = new Date(match.date || match.match_date);
            return (
              <div key={i} className="match-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>{match.team1} <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>vs</span> {match.team2}</span>
                </div>
                <div className="match-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="status-dot"></span>
                        {date.toLocaleDateString()} • {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span style={{ fontWeight: 500, color: '#94a3b8' }}>{match.venue}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}