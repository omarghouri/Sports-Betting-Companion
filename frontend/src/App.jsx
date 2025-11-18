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
    const lowerQuery = query.toLowerCase();
    
    // Pattern 1: Show all teams (MUST come before team matches pattern!)
    if (lowerQuery.includes("all teams") || lowerQuery.includes("list teams") || lowerQuery.includes("show teams") || lowerQuery === "teams") {
      try {
        console.log("Attempting to fetch teams...");
        const teams = await fetchTeams();
        console.log("Teams received:", teams);
        
        if (!teams || teams.length === 0) {
          return "No teams found in the database.";
        }

        let response = `Here are all ${teams.length} teams:\n\n`;
        teams.forEach((team, idx) => {
          // Handle different possible field names from your schema
          const teamName = team.name || team.team_name || `Team ${team.id}`;
          const groupInfo = team.group_name ? ` (Group ${team.group_name})` : '';
          const countryCode = team.country_code ? ` [${team.country_code}]` : '';
          response += `${idx + 1}. ${teamName}${countryCode}${groupInfo}\n`;
        });

        return response;
      } catch (error) {
        console.error("Error fetching teams:", error);
        return `Sorry, I had trouble fetching teams: ${error.message}`;
      }
    }
    
    // Pattern 2: High-scoring matches (MUST come before team matches pattern!)
    if (lowerQuery.includes("high scoring") || lowerQuery.includes("most goals") || lowerQuery.includes("highest score")) {
      try {
        const matches = await fetchMatchCards();
        const finishedMatches = matches.filter(m => m.status === "finished" && m.score_team1 !== null);
        
        if (finishedMatches.length === 0) {
          return "No finished matches with scores found.";
        }

        const sortedByGoals = finishedMatches
          .map(m => ({ ...m, totalGoals: m.score_team1 + m.score_team2 }))
          .sort((a, b) => b.totalGoals - a.totalGoals)
          .slice(0, 5);

        let response = "Here are the highest-scoring matches:\n\n";
        sortedByGoals.forEach((match, idx) => {
          const date = new Date(match.match_date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          });
          response += `${idx + 1}. ${match.team1} ${match.score_team1}-${match.score_team2} ${match.team2} (${match.totalGoals} goals) - ${date}\n`;
        });

        return response;
      } catch (error) {
        return "Sorry, I had trouble fetching match data. Please try again.";
      }
    }
    
    // Pattern 3: Matches with a specific team
    if (lowerQuery.includes("matches") || lowerQuery.includes("games") || lowerQuery.includes("fixtures")) {
      // Extract team name - look for common patterns
      let teamName = null;
      
      // Pattern: "matches with [team]" or "games with [team]"
      const withMatch = lowerQuery.match(/(?:matches|games|fixtures).*?(?:with|for|of)\s+([a-z]+)/);
      if (withMatch) {
        teamName = withMatch[1];
      }
      
      // Pattern: "[team] matches" or "[team] games"
      const teamFirstMatch = lowerQuery.match(/([a-z]+)\s+(?:matches|games|fixtures)/);
      if (!teamName && teamFirstMatch) {
        teamName = teamFirstMatch[1];
      }

      if (teamName) {
        try {
          const matches = await fetchMatchCards();
          const teamMatches = matches.filter(m => 
            m.team1.toLowerCase().includes(teamName) || 
            m.team2.toLowerCase().includes(teamName)
          );

          if (teamMatches.length === 0) {
            return `I couldn't find any matches for "${teamName}". Available teams include: Argentina, France, Brazil, England, Germany, and more.`;
          }

          let response = `Found ${teamMatches.length} match(es) involving ${teamName}:\n\n`;
          teamMatches.forEach(match => {
            const date = new Date(match.match_date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            });
            const score = match.score_team1 !== null 
              ? ` (${match.score_team1}-${match.score_team2})`
              : '';
            response += `• ${match.team1} vs ${match.team2}${score} - ${date} at ${match.venue} (${match.stage})\n`;
          });

          return response;
        } catch (error) {
          return "Sorry, I had trouble fetching match data. Please try again.";
        }
      }
    }

    // Pattern 4: Value bets query
    if (lowerQuery.includes("value bet") || lowerQuery.includes("best bet") || lowerQuery.includes("edge")) {
      try {
        const valueBets = await fetchValueBets();
        
        if (valueBets.length === 0) {
          return "No value bets available at the moment.";
        }

        // Get top 3 bets by edge
        const topBets = valueBets
          .sort((a, b) => parseFloat(b.edge || b.Edge || 0) - parseFloat(a.edge || a.Edge || 0))
          .slice(0, 3);

        let response = "Here are the top value bets right now:\n\n";
        topBets.forEach((bet, idx) => {
          const match = bet.match || bet.Match;
          const market = bet.market || bet.Market;
          const pick = bet.pick || bet.Pick;
          const edge = bet.edge || bet.Edge;
          response += `${idx + 1}. ${match} - ${market}: ${pick} (Edge: ${edge})\n`;
        });

        return response;
      } catch (error) {
        return "Sorry, I had trouble fetching value bets. Please try again.";
      }
    }

    // Pattern 5: Upcoming matches
    if (lowerQuery.includes("upcoming") || lowerQuery.includes("next") || lowerQuery.includes("schedule")) {
      try {
        const matches = await fetchMatchCards();
        const upcoming = matches
          .filter(m => m.status === "upcoming")
          .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
          .slice(0, 5);

        if (upcoming.length === 0) {
          return "No upcoming matches scheduled at the moment.";
        }

        let response = "Here are the next upcoming matches:\n\n";
        upcoming.forEach(match => {
          const date = new Date(match.match_date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          response += `• ${match.team1} vs ${match.team2} - ${date} at ${match.venue}\n`;
        });

        return response;
      } catch (error) {
        return "Sorry, I had trouble fetching upcoming matches. Please try again.";
      }
    }

    // Pattern 6: Team record/history
    if (lowerQuery.includes("record") || lowerQuery.includes("history") || lowerQuery.includes("past")) {
      const teamMatch = lowerQuery.match(/(?:record|history|past).*?(?:of|for)\s+([a-z]+)/);
      if (teamMatch) {
        const teamName = teamMatch[1];
        try {
          const matches = await fetchMatchCards();
          const teamMatches = matches.filter(m => 
            (m.team1.toLowerCase().includes(teamName) || m.team2.toLowerCase().includes(teamName)) &&
            m.status === "finished"
          );

          if (teamMatches.length === 0) {
            return `No finished matches found for "${teamName}".`;
          }

          let wins = 0, losses = 0, draws = 0;
          teamMatches.forEach(match => {
            const isTeam1 = match.team1.toLowerCase().includes(teamName);
            if (match.score_team1 === match.score_team2) {
              draws++;
            } else if ((isTeam1 && match.score_team1 > match.score_team2) || 
                       (!isTeam1 && match.score_team2 > match.score_team1)) {
              wins++;
            } else {
              losses++;
            }
          });

          return `Record for ${teamName.charAt(0).toUpperCase() + teamName.slice(1)}: ${wins}W-${losses}L-${draws}D (${teamMatches.length} matches)`;
        } catch (error) {
          return "Sorry, I had trouble fetching team history. Please try again.";
        }
      }
    }

    // Pattern 7: Finished/completed matches
    if (lowerQuery.includes("finished") || lowerQuery.includes("completed") || lowerQuery.includes("results") || lowerQuery.includes("final matches")) {
      try {
        const results = await fetchResults();
        
        if (results.length === 0) {
          return "No completed matches found.";
        }

        let response = `Here are the completed matches:\n\n`;
        results.slice(0, 10).forEach(match => {
          const date = new Date(match.match_date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          });
          response += `• Match ${match.id}: ${match.score_team1}-${match.score_team2} - ${date} (${match.stage || 'N/A'})\n`;
        });

        if (results.length > 10) {
          response += `\n...and ${results.length - 10} more matches`;
        }

        return response;
      } catch (error) {
        return "Sorry, I had trouble fetching results. Please try again.";
      }
    }

    // Pattern 8: All picks/bets
    if (lowerQuery.includes("all picks") || lowerQuery.includes("all bets") || lowerQuery.includes("show picks") || lowerQuery.includes("show bets")) {
      try {
        const picks = await fetchPicks();
        
        if (picks.length === 0) {
          return "No picks/bets found in the system.";
        }

        let response = `Here are the recent picks (showing ${Math.min(picks.length, 10)}):\n\n`;
        picks.slice(0, 10).forEach((pick, idx) => {
          const amount = pick.amount ? `$${pick.amount}` : '';
          const odds = pick.odds ? `@ ${pick.odds}` : '';
          const result = pick.result ? `[${pick.result.toUpperCase()}]` : '[PENDING]';
          response += `${idx + 1}. Match ${pick.match_id}: ${pick.bet_type} on ${pick.bet_on} ${odds} ${amount} ${result}\n`;
        });

        if (picks.length > 10) {
          response += `\n...and ${picks.length - 10} more picks`;
        }

        return response;
      } catch (error) {
        return "Sorry, I had trouble fetching picks. Please try again.";
      }
    }

    // Pattern 9: User-specific bets
    if (lowerQuery.includes("my bets") || lowerQuery.includes("user bets")) {
      return "To view user-specific bets, please provide your user ID. For example: 'show bets for user [user-id] type moneyline'";
    }

    // Pattern 10: Match stages
    if (lowerQuery.includes("stage") || lowerQuery.includes("round") || lowerQuery.includes("knockout") || lowerQuery.includes("group stage")) {
      let stageFilter = null;
      if (lowerQuery.includes("final")) stageFilter = "Final";
      else if (lowerQuery.includes("semi")) stageFilter = "Semifinals";
      else if (lowerQuery.includes("quarter")) stageFilter = "Quarterfinals";
      else if (lowerQuery.includes("round of 16") || lowerQuery.includes("ro16")) stageFilter = "Round of 16";
      else if (lowerQuery.includes("group")) stageFilter = "Group Stage";

      if (stageFilter) {
        try {
          const matches = await fetchMatchCards();
          const stageMatches = matches.filter(m => 
            m.stage && m.stage.toLowerCase().includes(stageFilter.toLowerCase())
          );

          if (stageMatches.length === 0) {
            return `No matches found for ${stageFilter}.`;
          }

          let response = `Matches in ${stageFilter}:\n\n`;
          stageMatches.forEach(match => {
            const date = new Date(match.match_date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            const score = match.score_team1 !== null 
              ? ` (${match.score_team1}-${match.score_team2})`
              : '';
            response += `• ${match.team1} vs ${match.team2}${score} - ${date}\n`;
          });

          return response;
        } catch (error) {
          return "Sorry, I had trouble fetching matches by stage. Please try again.";
        }
      }
    }

    // Default response
    return "I can help you with:\n• Finding matches for a specific team (e.g., 'show me Argentina matches')\n• Showing value bets (e.g., 'what are the best bets?')\n• Listing upcoming matches (e.g., 'what games are coming up?')\n• Team records (e.g., 'what's France's record?')\n• Listing all teams (e.g., 'show all teams')\n• Showing finished matches (e.g., 'show results')\n• Viewing all picks (e.g., 'show all picks')\n• High-scoring matches (e.g., 'highest scoring games')\n• Matches by stage (e.g., 'show finals' or 'group stage matches')";
  };

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;

    setMessages(prev => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setIsProcessing(true);

    // Add a "thinking" message
    setMessages(prev => [...prev, { role: "bot", text: "Looking that up..." }]);

    try {
      const response = await processQuery(trimmed);
      
      // Remove the "thinking" message and add the real response
      setMessages(prev => {
        const withoutThinking = prev.slice(0, -1);
        return [...withoutThinking, { role: "bot", text: response }];
      });
    } catch (error) {
      setMessages(prev => {
        const withoutThinking = prev.slice(0, -1);
        return [...withoutThinking, { role: "bot", text: "Sorry, something went wrong. Please try again." }];
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
          onKeyPress={e => e.key === 'Enter' && send()}
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
    height: "600px",  // Fixed height instead of fit-content
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