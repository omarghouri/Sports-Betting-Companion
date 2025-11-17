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

        {/* Center: Chatbot */}
        <ChatbotWidget />
      </main>
    </div>
  );
}

/* ----------------------- Header ----------------------- */
function Header() {
  return (
    <header style={styles.header} aria-label="Top navigation">
      <div style={styles.brand}>Sports Betting Companion </div>
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

// Omar added the Value Bets Panel
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

/* ----------------------- Chatbot Widget ----------------------- */
function ChatbotWidget() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hey! Ask me about value bets, odds, or fixtures for World Cup 2026." },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { role: "user", text: trimmed }, { role: "bot", text: "Got it — (demo): running query…" }]);
    setInput("");
  };

  return (
    <section style={styles.chatbotSection} aria-label="Chatbot">
      <div style={styles.chatHeader}>SBC Chatbot</div>
      <div style={styles.chatBody}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...styles.chatMsg, ...(m.role === "user" ? styles.msgUser : styles.msgBot) }}>
            {m.text}
          </div>
        ))}
      </div>
      <div style={styles.chatInputRow}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && send()}
          placeholder="Ask about a match, market, or line…"
          style={styles.chatInput}
        />
        <button onClick={send} style={styles.chatSend}>Send</button>
      </div>
    </section>
  );
}

//Mike added Styles to website
/* ----------------------- Styles ----------------------- */
const styles = {
  app: {
    fontFamily: "Inter, system-ui, Arial, sans-serif",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f6f7fb",
  },
  header: {
    backgroundColor: "#0b1020",
    color: "white",
    padding: "12px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  brand: { fontWeight: 700, letterSpacing: 0.4 },
  nav: { display: "flex", gap: 12, alignItems: "center" },
  link: { color: "white", textDecoration: "none", fontWeight: 600 },
  signup: { padding: "6px 10px", background: "#1ea97c", borderRadius: 6 },

  sectionLabel: { margin: "0 0 8px 0", fontSize: 14, color: "#222" },
  gamesBar: {
    background: "white",
    padding: "10px 16px",
    borderBottom: "1px solid #e6e7ee",
  },
  gamesScroller: {
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: "minmax(220px, 1fr)",
    gap: 12,
    overflowX: "auto",
    paddingBottom: 8,
  },
  gameChip: {
    border: "1px solid #e6e7ee",
    borderRadius: 10,
    padding: "10px 12px",
    background: "#fafbff",
  },
  gameTeams: { fontWeight: 700, marginBottom: 4 },
  gameMeta: { fontSize: 12, color: "#555" },

  main: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "380px 1fr",  // Wider sidebar
    gap: 16,
    padding: 16,
  },

  sidebar: {
    background: "white",
    border: "1px solid #e6e7ee",
    borderRadius: 12,
    padding: 12,
    height: "fit-content",
    overflowX: "auto",  // Scroll if still needed
  },
  sidebarTitle: { margin: "0 0 10px", fontSize: 16, fontWeight: 700,},
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: { textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #eee" },
  td: { padding: "8px 6px", borderBottom: "1px solid #f3f4f7" },
  row: { background: "white" },

  /* Chatbot - Now as main section */
  chatbotSection: {
    background: "white",
    border: "1px solid #e6e7ee",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "fit-content",
    minHeight: "500px",
  },
  chatHeader: {
    background: "#0b1020",
    color: "white",
    padding: "12px 16px",
    fontWeight: 700,
    fontSize: 16,
  },
  chatBody: {
    padding: 16,
    flex: 1,
    minHeight: "400px",
    overflowY: "auto",
    background: "#f7f8fc",
  },
  chatMsg: {
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: "85%",
    lineHeight: 1.4,
    fontSize: 14,
  },
  msgUser: { background: "#dff7ee", marginLeft: "auto" },
  msgBot: { background: "white", border: "1px solid #edf0f7" },
  chatInputRow: { 
    display: "flex", 
    gap: 10, 
    padding: 16, 
    borderTop: "1px solid #edf0f7",
    background: "white",
  },
  chatInput: {
    flex: 1,
    border: "1px solid #d9dce6",
    borderRadius: 8,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
  },
  chatSend: {
    border: "none",
    background: "#1ea97c",
    color: "white",
    fontWeight: 700,
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
  },

  /* Responsive */
  "@media (max-width: 900px)": {},
};

export default App;
