import React from "react";
import { Icons } from "./Icons";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand-container">
          <Icons.Trophy style={{ color: '#34d399', marginRight: '8px' }} />
          <div className="brand-name">Sports Betting Companion</div>
        </div>
        <nav className="nav">
        </nav>
      </div>
    </header>
  );
}