import React from "react";
import "./App.css"; 

// Import components
import Header from "./components/Header.jsx";
import ValueBetsPanel from "./components/ValueBetsPanel.jsx";
import UpcomingGamesSidebar from "./components/UpcomingGamesSidebar.jsx";
import ChatbotWidget from "./components/ChatBotWidget.jsx";

function App() {
  return (
    <div className="app-container">
      <Header />
      
      {/* Top Section: Value Bets Table */}
      <section className="top-section">
         <ValueBetsPanel />
      </section>

      <main className="main-content">
        {/* Left Sidebar: Upcoming Matches List */}
        <UpcomingGamesSidebar />
        
        {/* Main Content: Chatbot */}
        <ChatbotWidget />
      </main>
    </div>
  );
}

export default App;