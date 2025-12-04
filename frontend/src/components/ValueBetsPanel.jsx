import React, { useState, useEffect } from "react";
import { Icons } from "./Icons";
import { USE_MOCK_API, API_BASE_URL } from "../config";

export default function ValueBetsPanel() {
  const [bets, setBets] = useState([]);

  useEffect(() => {
    const loadBets = async () => {
        if (USE_MOCK_API) {
            setBets([
                { id: 1, match: "ENG vs ITA", market: "Draw", pick: "X", fair: 310, book: 350, edge: "5.2%", ev: "8.1%" },
                { id: 2, match: "ARG vs PER", market: "Spread", pick: "ARG -1.5", fair: -120, book: 105, edge: "3.8%", ev: "4.5%" },
                { id: 3, match: "BRA vs COL", market: "Total", pick: "Over 2.5", fair: -105, book: 115, edge: "4.1%", ev: "5.0%" },
                { id: 4, match: "FRA vs GER", market: "Moneyline", pick: "FRA", fair: 140, book: 160, edge: "2.9%", ev: "3.5%" },
            ]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/valuebets`);
            if (res.ok) {
              const rawData = await res.json();
              const mappedData = rawData.map(row => ({
                id: row.id,
                match: row.match || row.Match,
                market: row.market || row.Market,
                pick: row.pick || row.Pick,
                fair: row.fair_odds || row.fair || row["Fair Odds"],
                book: row.book || row.Book,
                edge: row.edge || row.Edge,
                ev: row.ev || row.EV,
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
              <th>Fair Odds</th>
              <th>Book Odds</th>
              <th>Edge</th>
              <th>EV%</th>
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
                <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{b.fair}</td>
                <td>
                    <span className="book-odds">{b.book}</span>
                </td>
                <td style={{ color: '#475569' }}>{b.edge}</td>
                <td style={{ fontWeight: 'bold', color: '#059669' }}>{b.ev}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}