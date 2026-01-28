import { useState } from "react";
import axios from "axios";
import "./App.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line, Pie, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

function App() {
  /* ---------- STATE ---------- */

  const [file, setFile] = useState(null);
  const [dataInfo, setDataInfo] = useState(null);

  const [chartType, setChartType] = useState("bar");
  const [xColumn, setXColumn] = useState("");
  const [yColumn, setYColumn] = useState("");
  const [chartData, setChartData] = useState(null);
  const [showFullDataset, setShowFullDataset] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [error, setError] = useState("");

  /* ---------- HANDLERS ---------- */

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setDataInfo(null);
    setChartData(null);
    setError("");
  };

  const uploadCSV = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setLoadingUpload(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData
      );
      setDataInfo(response.data);
    } catch {
      setError("CSV upload failed. Please try again.");
    } finally {
      setLoadingUpload(false);
    }
  };

  const generateChart = () => {
    if (!xColumn) {
      setError("Please select X column");
      return;
    }

    setError("");

    const labels = dataInfo.preview.map((row) => row[xColumn]);

    let values = [];
    if (yColumn) {
      values = dataInfo.preview.map((row) => Number(row[yColumn]));
    }

    const dataset = {
      label: yColumn || xColumn,
      data:
        chartType === "scatter"
          ? dataInfo.preview.map((row) => ({
              x: Number(row[xColumn]),
              y: Number(row[yColumn]),
            }))
          : values.length
          ? values
          : labels.map(() => 1),
      backgroundColor: [
        "#2563eb",
        "#16a34a",
        "#dc2626",
        "#9333ea",
        "#f59e0b",
      ],
    };

    const newChartData = {
      labels,
      datasets: [dataset],
    };

    setChartData(newChartData);
    // Navigate to chart page
    window.setTimeout(() => {
      setShowChart(true);
    }, 0);
  };

  const handleBackButton = () => {
    setDataInfo(null);
    setFile(null);
    setChartData(null);
    setXColumn("");
    setYColumn("");
    setError("");
  };

  const handleBackFromDataset = () => {
    setShowFullDataset(false);
  };

  const handleBackFromChart = () => {
    setShowChart(false);
    setChartData(null);
  };

  /* ---------- RENDER ---------- */

  // Chart Output Page
  if (showChart && chartData) {
    return (
      <div className="container">
        <div className="page-header">
          <button className="back-button" onClick={handleBackFromChart}>
            ← Back to Analysis
          </button>
          <h1>Generated Chart</h1>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="section card chart-container">
          <h3>Interactive Chart</h3>

          {chartType === "bar" && <Bar data={chartData} />}
          {chartType === "line" && <Line data={chartData} />}
          {chartType === "pie" && <Pie data={chartData} />}
          {chartType === "scatter" && <Scatter data={chartData} />}
        </div>

        <p style={{ textAlign: "center", marginTop: "40px", color: "#64748b" }}>
          Built with FastAPI, Pandas & React
        </p>
      </div>
    );
  }

  // Full Dataset Page
  if (showFullDataset && dataInfo) {
    return (
      <div className="container">
        <div className="page-header">
          <button className="back-button" onClick={handleBackFromDataset}>
            ← Back to Analysis
          </button>
          <h1>Full Dataset View</h1>
        </div>

        <div className="section card">
          <h3>Dataset Info</h3>
          <table>
            <tbody>
              <tr>
                <td><b>Total Rows</b></td>
                <td>{dataInfo.rows}</td>
              </tr>
              <tr>
                <td><b>Total Columns</b></td>
                <td>{dataInfo.columns.length}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {dataInfo.full_data && (
          <div className="section card">
            <h3>Complete Dataset</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {Object.keys(dataInfo.full_data[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataInfo.full_data.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: "40px", color: "#64748b" }}>
          Built with FastAPI, Pandas & React
        </p>
      </div>
    );
  }

  // Upload Page
  if (!dataInfo) {
    return (
      <div className="container">
        <div className="hero">
          <h1>Data Analyst & Visualization App</h1>
          <p>
            Upload CSV files and generate interactive charts using React &
            Chart.js
          </p>

          <div className="hero-tags">
            <span>FastAPI</span>
            <span>Pandas</span>
            <span>React</span>
            <span>Chart.js</span>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="section card">
          <h3>Upload Dataset</h3>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <br /><br />
          <button onClick={uploadCSV} disabled={loadingUpload}>
            Upload CSV
          </button>
          {loadingUpload && <p className="spinner">Uploading CSV...</p>}
        </div>
      </div>
    );
  }

  // Dataset + Chart Page
  return (
    <div className="container">
      <div className="page-header">
        <button className="back-button" onClick={handleBackButton}>
          ← Back to Upload
        </button>
        <h1>Dataset Analysis</h1>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="section card">
        <h3>Dataset Info</h3>
        <table>
          <tbody>
            <tr>
              <td><b>Total Rows</b></td>
              <td>{dataInfo.rows}</td>
            </tr>
          </tbody>
        </table>
        <br />
        <div className="button-group">
          <button onClick={() => setShowFullDataset(true)}>
            View Full Dataset
          </button>
          <button onClick={generateChart} style={{ marginLeft: "10px" }}>
            Generate Chart
          </button>
        </div>
      </div>

      <div className="section card">
        <h3>Chart Controls</h3>

        <label>Chart Type</label>
        <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
          <option value="scatter">Scatter</option>
        </select>

        <br /><br />

        <label>X Column</label>
        <select value={xColumn} onChange={(e) => setXColumn(e.target.value)}>
          <option value="">Select</option>
          {dataInfo.columns.map((col) => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>

        <br /><br />

        <label>Y Column</label>
        <select value={yColumn} onChange={(e) => setYColumn(e.target.value)}>
          <option value="">None</option>
          {dataInfo.columns.map((col) => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      {dataInfo.preview?.length > 0 && (
        <div className="section card">
          <h3>Preview (first 5 rows)</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {Object.keys(dataInfo.preview[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataInfo.preview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p style={{ textAlign: "center", marginTop: "40px", color: "#64748b" }}>
        Built with FastAPI, Pandas & React
      </p>
    </div>
  );
}

export default App;
