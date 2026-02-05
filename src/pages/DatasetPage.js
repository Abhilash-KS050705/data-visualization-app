import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";

export default function DatasetPage() {
  const { dataInfo } = useContext(DataContext);
  const navigate = useNavigate();
  const [xColumn, setXColumn] = useState("");
  const [yColumn, setYColumn] = useState("");
  const [chartType, setChartType] = useState("line");

  if (!dataInfo) {
    return (
      <div className="page container">
        <h2>No dataset loaded</h2>
        <p>Please upload a dataset first.</p>
        <Link className="btn primary" to="/upload">Upload Data</Link>
      </div>
    );
  }

  const goToGraph = () => {
    navigate("/graph", { state: { xColumn, yColumn, chartType } });
  };

  return (
    <div className="page container">
      <h2>Dataset Preview</h2>
      <p><strong>Rows:</strong> {dataInfo.rows} &nbsp; <strong>Columns:</strong> {dataInfo.columns.length}</p>

      <div className="controls">
        <label>X Column</label>
        <select value={xColumn} onChange={(e) => setXColumn(e.target.value)}>
          <option value="">Select</option>
          {dataInfo.columns.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>

        <label>Y Column</label>
        <select value={yColumn} onChange={(e) => setYColumn(e.target.value)}>
          <option value="">None</option>
          {dataInfo.columns.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>

        <label>Chart Type</label>
        <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="line">Line</option>
          <option value="bar">Bar</option>
          <option value="scatter">Scatter</option>
          <option value="pie">Pie</option>
        </select>

        <button className="btn primary" onClick={goToGraph} disabled={!xColumn}>View Graph</button>
      </div>

      <h3>Preview Rows</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {dataInfo.columns.map((c) => (<th key={c}>{c}</th>))}
            </tr>
          </thead>
          <tbody>
            {dataInfo.preview.map((row, i) => (
              <tr key={i}>
                {dataInfo.columns.map((c) => (<td key={c}>{row[c]}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
