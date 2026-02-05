import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <h1 className="hero-title">Futuristic Data Visualization Studio</h1>
        <p className="hero-sub">Upload datasets, explore data, and create interactive  graphs.</p>
        <div className="hero-ctas">
          <Link className="btn primary" to="/upload">Upload Data</Link>
          <Link className="btn ghost" to="/dataset">View Dataset</Link>
        </div>
      </div>
    </section>
  );
}
