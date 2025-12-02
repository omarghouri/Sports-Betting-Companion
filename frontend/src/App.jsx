import React, { useState, useEffect } from "react";
import { 
  fetchValueBets, 
  fetchMatchCards, 
  fetchTeams,
  fetchMatches,
  fetchPicks,
  fetchResults,
  fetchUserBets 
} from "./api";


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
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatchCards()
      .then((data) => {
        // Filter for upcoming matches only
        const upcomingMatches = data.filter(m => m.status === "upcoming" || m.status === "finished");
        setMatches(upcomingMatches);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load matches.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section aria-label="Upcoming games" style={styles.gamesBar}>
        <h3 style={styles.sectionLabel}>Upcoming and Recent World Cup Matches</h3>
        <div style={styles.gamesScroller}>Loading matches...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Upcoming games" style={styles.gamesBar}>
        <h3 style={styles.sectionLabel}>Upcoming and Recent World Cup Matches</h3>
        <div style={styles.gamesScroller}>
          <div style={{ color: '#d00' }}>{error}</div>
        </div>
      </section>
    );
  }

  if (matches.length === 0) {
    return (
      <section aria-label="Upcoming games" style={styles.gamesBar}>
        <h3 style={styles.sectionLabel}>Upcoming and Recent World Cup Matches</h3>
        <div style={styles.gamesScroller}>No upcoming matches scheduled.</div>
      </section>
    );
  }

  return (
    <section aria-label="Upcoming games" style={styles.gamesBar}>
      <h3 style={styles.sectionLabel}>Upcoming and Recent World Cup Matches</h3>
      <div style={styles.gamesScroller}>
        {matches.map(match => {
          // Format the date
          const matchDate = new Date(match.match_date);
          const dateStr = matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const timeStr = matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          
          return (
            <div key={match.match_id} style={styles.gameChip}>
              <div style={styles.gameTeams}>{match.team1} vs {match.team2}</div>
              <div style={styles.gameMeta}>{match.venue || 'TBD'}</div>
              <div style={styles.gameMeta}>{dateStr} • {timeStr}</div>
              <div style={styles.gameMeta}>{match.stage || 'Group Stage'}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Omar added the Value Bets Panel
function ValueBetsPanel() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchValueBets()
      .then((rows) => {
        const mapped = rows.map((row) => ({
          id: row.id,
          match: row.match || row.Match,
          market: row.market || row.Market,
          pick: row.pick || row.Pick,
          fair: row.fair_odds || row["Fair Odds"],
          book: row.book || row.Book,
          edge: row.edge || row.Edge,
          ev: row.ev || row.EV,
        }));
        setBets(mapped);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load value bets.");
      })
      .finally(() => setLoading(false));
  }, []);

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
    { role: "bot", text: "Hey! I can help you with matches, teams, bets, results, and more. Try asking:\n• 'Show all teams'\n• 'Argentina matches'\n• 'Best value bets'\n• 'Show results'\n• 'Highest scoring games'" },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const chatBodyRef = React.useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const processQuery = async (query) => {
  try {
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: query })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error('API Error:', errorData);
      throw new Error(`API error: ${res.status}`);
    }
    
    const data = await res.json();
    return data.response;
  } catch (error) {
    console.error('Full error:', error);
    return "Sorry, I encountered an error. Please try again.";
  }
};
  const send = async () => {
  const trimmed = input.trim();
  if (!trimmed || isProcessing) return;

  setMessages(prev => [...prev, { role: "user", text: trimmed }]);
  setInput("");
  setIsProcessing(true);
  setMessages(prev => [...prev, { role: "bot", text: "Thinking..." }]);

  try {
    const response = await processQuery(trimmed);
    setMessages(prev => {
      const withoutThinking = prev.slice(0, -1);
      return [...withoutThinking, { role: "bot", text: response }];
    });
  } catch (error) {
    setMessages(prev => {
      const withoutThinking = prev.slice(0, -1);
      return [...withoutThinking, { role: "bot", text: "Sorry, something went wrong." }];
    });
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <section style={styles.chatbotSection} aria-label="Chatbot">
      <div style={styles.chatHeader}>SBC Chatbot</div>
      <div ref={chatBodyRef} style={styles.chatBody}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...styles.chatMsg, ...(m.role === "user" ? styles.msgUser : styles.msgBot) }}>
            {m.text.split('\n').map((line, j) => (
              <div key={j}>{line}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={styles.chatInputRow}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyUp={e => e.key === 'Enter' && send()}
          placeholder="Ask about a match, team, or bet…"
          style={styles.chatInput}
          disabled={isProcessing}
        />
        <button 
          onClick={send} 
          style={{
            ...styles.chatSend,
            opacity: isProcessing ? 0.6 : 1,
            cursor: isProcessing ? 'not-allowed' : 'pointer'
          }}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Send'}
        </button>
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
    height: "498px",  // Fixed height instead of fit-content
  },
  chatHeader: {
    background: "#0b1020",
    color: "white",
    padding: "12px 16px",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,  // Prevent header from shrinking
  },
  chatBody: {
    padding: 16,
    flex: 1,
    overflowY: "auto",  // Enable scrolling
    background: "#f7f8fc",
    display: "flex",
    flexDirection: "column",
  },
  chatMsg: {
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: "85%",
    lineHeight: 1.4,
    fontSize: 14,
    whiteSpace: "pre-line",
  },
  msgUser: { background: "#dff7ee", marginLeft: "auto" },
  msgBot: { background: "white", border: "1px solid #edf0f7" },
  chatInputRow: { 
    display: "flex", 
    gap: 10, 
    padding: 16, 
    borderTop: "1px solid #edf0f7",
    background: "white",
    flexShrink: 0,  // Prevent input row from shrinking
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