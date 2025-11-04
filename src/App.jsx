import React, { useState } from "react";

function App() {
  return (
  
    <div style={styles.app}>
      <Header />

      {/* Top strip: Upcoming World Cup Matches */}
      <UpcomingGamesBar />

      <main style={styles.main}>
        {/* Left: High-Value Bets (World Cup) */}
        <ValueBetsPanel />

        {/* Center: News Articles */}
        <NewsFeed />
      </main>

      {/* Bottom-right: Chatbot */}
      <ChatbotWidget />
    </div>
  );
}

/* ----------------------- Header ----------------------- */
function Header() {
  return (
    <header style={styles.header} aria-label="Top navigation">
      <div style={styles.brand}>SBC • World Cup 2026</div>
      <nav style={styles.nav}>
        <a style={styles.link} href="#">Log In</a>
        <a style={{ ...styles.link, ...styles.signup }} href="#">Sign Up</a>
      </nav>
    </header>
  );
}

/* ------------------- Upcoming Games Bar ------------------- */
function UpcomingGamesBar() {
  // Placeholder fixtures for WC 2026 (dates approximate)
  const games = [
    { id: 1, when: "2026-06-11 20:00", city: "Mexico City", teams: "MEX vs NZL", line: "MEX -0.5", total: "2.5" },
    { id: 2, when: "2026-06-12 19:00", city: "Los Angeles", teams: "USA vs JAM", line: "USA -1.0", total: "2.75" },
    { id: 3, when: "2026-06-13 18:00", city: "Toronto", teams: "CAN vs KOR", line: "PK", total: "2.25" },
    { id: 4, when: "2026-06-14 17:00", city: "Dallas", teams: "BRA vs NOR", line: "BRA -1.25", total: "3.0" },
    { id: 5, when: "2026-06-15 16:00", city: "New York", teams: "ENG vs SEN", line: "ENG -0.75", total: "2.25" },
  ];

  return (
    <section aria-label="Upcoming games" style={styles.gamesBar}>
      <h3 style={styles.sectionLabel}>Upcoming World Cup Matches</h3>
      <div style={styles.gamesScroller}>
        {games.map(g => (
          <div key={g.id} style={styles.gameChip} title={`${g.teams} • ${g.city}`}>
            <div style={styles.gameTeams}>{g.teams}</div>
            <div style={styles.gameMeta}>{g.city}</div>
            <div style={styles.gameMeta}>{g.when}</div>
            <div style={styles.gameMeta}>{g.line} • o/u {g.total}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------- Value Bets Panel --------------------- */
function ValueBetsPanel() {
  // Example model output specifically for WC 2026; replace with your calc feed
  const bets = [
    // edge is model_prob - implied_prob; ev% is expected value summary
    { id: 1, match: "USA vs JAM", market: "Moneyline", pick: "USA", fair: "+105", book: "+130", edge: "+2.9%", ev: "+6.1%" },
    { id: 2, match: "BRA vs NOR", market: "Asian Handicap", pick: "BRA -1.0", fair: "-150", book: "-120", edge: "+3.4%", ev: "+4.8%" },
    { id: 3, match: "ENG vs SEN", market: "Under", pick: "U2.25", fair: "-115", book: "+100", edge: "+2.2%", ev: "+3.9%" },
    { id: 4, match: "CAN vs KOR", market: "Both Teams To Score", pick: "Yes", fair: "+105", book: "+125", edge: "+2.0%", ev: "+2.7%" },
  ];

  return (
    <aside style={styles.sidebar} aria-label="Top Value Bets">
      <h3 style={styles.sidebarTitle}>Top Value Bets — World Cup 2026</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Match</th>
            <th style={styles.th}>Market</th>
            <th style={styles.th}>Pick</th>
            <th style={styles.th}>Fair</th>
            <th style={styles.th}>Book</th>
            <th style={styles.th}>Edge</th>
            <th style={styles.th}>EV%</th>
          </tr>
        </thead>
        <tbody>
          {bets.map(b => (
            <tr key={b.id} style={styles.row}>
              <td style={styles.td}>{b.match}</td>
              <td style={styles.td}>{b.market}</td>
              <td style={styles.td}><strong>{b.pick}</strong></td>
              <td style={styles.td}>{b.fair}</td>
              <td style={styles.td}>{b.book}</td>
              <td style={{ ...styles.td, color: "#0a7" }}>{b.edge}</td>
              <td style={{ ...styles.td, color: "#0a7" }}>{b.ev}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <small style={{ color: "#666" }}>
        * Edges are illustrative. Always check limits, vig, and shop lines across books.
      </small>
    </aside>
  );
}

#Mike Added News Feed


function NewsFeed() {
  const articles = [
    {
      id: 1,
      title: "FIFA Finalizes 2026 Match Calendar Windows",
      blurb: "Key venues across the U.S., Canada, and Mexico outlined; group-stage density optimized for recovery.",
    },
    {
      id: 2,
      title: "Roster Watch: Young Forwards in Form",
      blurb: "USMNT and Brazil prospects surge ahead of camp selections; injuries could reshape depth charts.",
    },
    {
      id: 3,
      title: "Model Notes: Pace & Travel Adjustments",
      blurb: "Altitude, travel corridors, and rest-day gaps added to expected-goals baselines for 2026.",
    },
  ];

  return (
    <section style={styles.newsSection} aria-label="World Cup News">
      <h2 style={{ marginTop: 0 }}>News Articles</h2>
      {articles.map(a => (
        <article key={a.id} style={styles.newsCard}>
          <h4 style={{ margin: "0 0 6px" }}>{a.title}</h4>
          <p style={{ margin: 0, color: "#444" }}>{a.blurb}</p>
        </article>
      ))}
    </section>
  );
}

