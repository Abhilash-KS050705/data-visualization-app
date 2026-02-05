import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import "./chartSetup";
import { DataProvider } from "./context/DataContext";
import Hero from "./components/Hero";
import UploadPage from "./pages/UploadPage";
import DatasetPage from "./pages/DatasetPage";
import GraphPage from "./pages/GraphPage";

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <header className="topbar">
          <div className="container nav">
            <Link className="brand" to="/">Data Visualization Studio</Link>
            <nav>
              <Link to="/upload">Upload</Link>
              <Link to="/dataset">Dataset</Link>
              <Link to="/graph">Graph</Link>
            </nav>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dataset" element={<DatasetPage />} />
            <Route path="/graph" element={<GraphPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
