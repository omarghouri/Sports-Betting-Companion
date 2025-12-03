import React, { useState, useEffect, useRef } from "react";

// --- CONFIGURATION ---
const USE_MOCK_API = false;
const API_BASE_URL = "http://localhost:8000";

// --- INLINE ICONS ---
const Icons = {
  Trophy: ({ style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  Calendar: ({ style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  TrendingUp: ({ style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  Activity: ({ style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Send: ({ style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="22" x2="11" y1="2" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
};

function App() {
  return (
    <div style={styles.app}>
      <Header />
      
      {/* Top Section: Value Bets Table */}
      <section style={styles.topSection}>
         <ValueBetsPanel />
      </section>

      <main style={styles.main}>
        {/* Left Sidebar: Upcoming Matches List */}
        <UpcomingGamesSidebar />
        
        {/* Main Content: Chatbot */}
        <ChatbotWidget />
      </main>
    </div>
  );
}

/* ----------------------- Header ----------------------- */
function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.headerInner}>
        <div style={styles.brandContainer}>
          <Icons.Trophy style={{ color: '#34d399', marginRight: '8px' }} />
          <div style={styles.brandName}>Sports Betting Companion</div>
        </div>
        <nav style={styles.nav}>
          <a href="#" style={styles.navLink}>Log In</a>
          <a href="#" style={styles.navButton}>Sign Up</a>
        </nav>
      </div>
    </header>
  );
}

/* ------------------- Upcoming Games Sidebar ------------------- */
function UpcomingGamesSidebar() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
        if (USE_MOCK_API) {
            setMatches([
                { id: 1, team1: "USA", team2: "Mexico", venue: "Azteca", date: "2026-06-11T20:00:00", stage: "Group A" },
                { id: 2, team1: "France", team2: "Germany", venue: "SoFi Stadium", date: "2026-06-12T18:00:00", stage: "Group B" },
                { id: 3, team1: "Brazil", team2: "Spain", venue: "MetLife", date: "2026-06-12T21:00:00", stage: "Group C" },
                { id: 4, team1: "Japan", team2: "S. Korea", venue: "Seattle", date: "2026-06-13T16:00:00", stage: "Group D" },
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
    <aside style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <Icons.Calendar style={{ width: '16px', height: '16px', color: '#10b981', marginRight: '8px' }} />
        <h3 style={styles.sidebarTitle}>Upcoming Matches</h3>
      </div>
      
      <div style={styles.matchList}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '16px' }}>Loading schedule...</div>
        ) : (
          matches.map((match, i) => {
            const date = new Date(match.date || match.match_date);
            return (
              <div key={i} style={styles.matchCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={styles.matchTeams}>{match.team1} <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>vs</span> {match.team2}</span>
                </div>
                <div style={styles.matchMeta}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={styles.statusDot}></span>
                        {date.toLocaleDateString()} • {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span style={styles.matchVenue}>{match.venue}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

/* ----------------------- Value Bets Panel ----------------------- */
function ValueBetsPanel() {
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
              // Map database columns to frontend props
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
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.TrendingUp style={{ width: '20px', height: '20px', color: '#10b981' }} />
            <h3 style={styles.panelTitle}>Top Value Bets</h3>
        </div>
        <span style={styles.liveBadge}>Live Updates</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Match</th>
              <th style={styles.th}>Pick</th>
              <th style={styles.th}>Fair Odds</th>
              <th style={styles.th}>Book Odds</th>
              <th style={styles.th}>Edge</th>
              <th style={styles.th}>EV%</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((b, i) => (
              <tr key={i} style={styles.tr}>
                <td style={styles.td}>{b.match}</td>
                <td style={styles.td}>
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{b.pick}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{b.market}</div>
                </td>
                <td style={{ ...styles.td, fontFamily: 'monospace', color: '#64748b' }}>{b.fair}</td>
                <td style={styles.td}>
                    <span style={styles.bookOdds}>{b.book}</span>
                </td>
                <td style={{ ...styles.td, color: '#475569' }}>{b.edge}</td>
                <td style={{ ...styles.td, fontWeight: 'bold', color: '#059669' }}>{b.ev}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------- Chatbot Widget ----------------------- */
function ChatbotWidget() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I'm your betting assistant. Ask me about upcoming matches, team stats, or value bets." },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Helper to parse bold text (**text**) and newlines
  const renderFormattedText = (text) => {
    if (!text) return null;
    // Split by **bold** syntax
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isProcessing) return;

    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setIsProcessing(true);

    const thinkingId = Date.now();
    setMessages(prev => [...prev, { role: "bot", text: "Analyzing...", isThinking: true, id: thinkingId }]);

    try {
      let responseText = "";

      if (USE_MOCK_API) {
        await new Promise(r => setTimeout(r, 1200)); 
        if (text.toLowerCase().includes("team")) {
            responseText = "Based on our database, we have Team USA, Mexico, France, and Germany tracking for the 2026 cycle.";
        } else if (text.toLowerCase().includes("bet") || text.toLowerCase().includes("value")) {
            responseText = "Here are top value bets:\n* **England vs Italy**: Draw @ +350\n* **Brazil vs Spain**: Brazil -1 @ -120\n* **Canada vs Korea**: BTTS @ +125";
        } else {
            responseText = "I can help with match stats, team rosters, and value bets. Try asking 'What are the best bets today?'";
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text })
        });

        if (!res.ok) throw new Error("Backend error");
        const data = await res.json();
        responseText = data.response;
      }

      setMessages(prev => prev.map(m => 
        m.id === thinkingId ? { role: "bot", text: responseText } : m
      ));

    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(m => 
        m.id === thinkingId ? { role: "bot", text: "Error connecting to server." } : m
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section style={styles.chatSection}>
      <div style={styles.chatHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Activity style={{ width: '20px', height: '20px', color: '#34d399' }} />
            <span style={{ fontWeight: 'bold' }}>AI Assistant</span>
        </div>
        <div style={styles.modeBadge}>
            {USE_MOCK_API ? "Demo Mode" : "Live"}
        </div>
      </div>

      <div ref={scrollRef} style={styles.chatBody}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: '12px' }}>
            <div style={m.role === "user" ? styles.msgUser : styles.msgBot}>
              {m.isThinking ? <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Thinking...</span> : renderFormattedText(m.text)}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chatInputArea}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            style={styles.chatInput}
            placeholder="Ask about matches, odds, or teams..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            disabled={isProcessing}
          />
          <button 
            onClick={send}
            disabled={isProcessing}
            style={isProcessing ? { ...styles.sendBtn, ...styles.sendBtnDisabled } : styles.sendBtn}
          >
            <Icons.Send style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- STYLES OBJECT ----------------------- */
const styles = {
  app: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    color: '#0f172a',
  },
  header: {
    backgroundColor: '#0f172a',
    color: 'white',
    padding: '16px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  headerInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  brandName: {
    fontWeight: 'bold',
    fontSize: '18px',
    letterSpacing: '-0.025em',
  },
  nav: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 500,
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
  },
  navButton: {
    backgroundColor: '#059669',
    color: 'white',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  },
  topSection: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px 16px 0 16px',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    padding: '16px',
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  /* Sidebar */
  sidebar: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    height: 'fit-content',
    flex: '0 0 300px', // Fixed width for sidebar
    minWidth: '300px',
  },
  sidebarHeader: {
    padding: '16px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
  },
  sidebarTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
    fontSize: '16px',
  },
  matchList: {
    padding: '12px',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  matchCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    marginBottom: '12px',
    cursor: 'pointer',
  },
  matchTeams: {
    fontWeight: 'bold',
    color: '#1e293b',
    fontSize: '14px',
  },
  matchMeta: {
    fontSize: '12px',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#34d399',
    display: 'inline-block',
  },
  matchVenue: {
    fontWeight: 500,
    color: '#94a3b8',
  },
  /* Panel (Value Bets) */
  panel: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  panelHeader: {
    padding: '16px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    fontSize: '18px',
    margin: 0,
  },
  liveBadge: {
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '4px 8px',
    borderRadius: '9999px',
  },
  table: {
    width: '100%',
    fontSize: '14px',
    textAlign: 'left',
    borderCollapse: 'collapse',
  },
  thead: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: { padding: '12px 24px' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '16px 24px' },
  bookOdds: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#047857',
    backgroundColor: '#ecfdf5',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  /* Chatbot */
  chatSection: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    height: '600px',
    flex: 1, // Takes remaining space
    minWidth: '300px',
  },
  chatHeader: {
    padding: '16px',
    backgroundColor: '#0f172a',
    color: 'white',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeBadge: {
    fontSize: '12px',
    backgroundColor: '#1e293b',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#cbd5e1',
  },
  chatBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    backgroundColor: '#f8fafc',
  },
  msgUser: {
    backgroundColor: '#059669',
    color: 'white',
    padding: '12px',
    borderRadius: '16px',
    borderBottomRightRadius: '0',
    maxWidth: '85%',
    fontSize: '14px',
    lineHeight: '1.5',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    whiteSpace: 'pre-wrap', // Added to support multiline user messages
  },
  msgBot: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    color: '#334155',
    padding: '12px',
    borderRadius: '16px',
    borderBottomLeftRadius: '0',
    maxWidth: '85%',
    fontSize: '14px',
    lineHeight: '1.5',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    whiteSpace: 'pre-wrap', // Added to support multiline bot messages
  },
  chatInputArea: {
    padding: '16px',
    backgroundColor: 'white',
    borderTop: '1px solid #f1f5f9',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    padding: '12px',
    borderRadius: '8px',
    color: 'white',
    backgroundColor: '#059669',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
    cursor: 'not-allowed',
  },
};

export default App;