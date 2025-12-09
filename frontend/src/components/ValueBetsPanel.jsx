import React, { useState, useEffect } from "react";
import { Icons } from "./Icons";
import { USE_MOCK_API, API_BASE_URL } from "../config";

export default function ValueBetsPanel() {
  const [bets, setBets] = useState([]);

  useEffect(() => {
    const loadBets = async () => {
        if (USE_MOCK_API) {
            // Updated mock data to match the simpler structure
            setBets([
                { id: 1, match: "ENG vs ITA", market: "Draw", pick: "X", current: 345 },
                { id: 2, match: "ARG vs PER", market: "Spread", pick: "ARG -1.5", current: 100 },
                { id: 3, match: "BRA vs COL", market: "Total", pick: "Over 2.5", current: 110 },
                { id: 4, match: "FRA vs GER", market: "Moneyline", pick: "FRA", current: 155 },
            ]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/valuebets`);
            if (res.ok) {
              const rawData = await res.json();
              // Simplified mapping to match available data
              const mappedData = rawData.map(row => ({
                id: row.id,
                match: row.match || row.Match,
                market: row.market || row.Market,
                pick: row.pick || row.Pick,
                current: row["Current Odds"] || row.current_odds || row.current || "-", 
              }));
              setBets(mappedData);
            }
        } catch(e) { console.error(e); }
    };
    loadBets();
  }, []);

  return (
    <div className="panel">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.TrendingUp style={{ width: '20px', height: '20px', color: '#10b981' }} />
            <h3 className="title">Top Value Bets</h3>
        </div>
        <span className="live-badge">Live Updates</span>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Match</th>
              <th>Pick</th>
              <th>Current Odds</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((b, i) => (
              <tr key={i}>
                <td>{b.match}</td>
                <td>
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{b.pick}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{b.market}</div>
                </td>
                <td>
                    <span className="book-odds" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                        {b.current}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}