import React, { useContext, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Line, Bar, Pie, Scatter } from "react-chartjs-2";
import { DataContext } from "../context/DataContext";

export default function GraphPage() {
  const { dataInfo } = useContext(DataContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [palette, setPalette] = useState("ocean");
  const [showCount, setShowCount] = useState(15);

  const palettes = {
    ocean: { border: "rgba(56,189,248,0.95)", bg: "rgba(56,189,248,0.25)", point: "#06b6d4" },
    neon: { border: "rgba(52,211,153,0.95)", bg: "rgba(16,185,129,0.18)", point: "#34d399" },
    sunset: { border: "rgba(249,115,22,0.95)", bg: "rgba(249,115,22,0.18)", point: "#fb923c" },
    violet: { border: "rgba(139,92,246,0.95)", bg: "rgba(139,92,246,0.18)", point: "#a78bfa" },
  };

  const paletteColors = {
    ocean: ["#0ea5e9", "#3b82f6", "#06b6d4", "#60a5fa", "#0284c7"],
    neon: ["#070F34", "#10b981", "#0313A6", "#84cc16", "#F715AB"],
    sunset: ["#fb923c", "#f97316", "#f43f5e", "#fb7185", "#fca5a5"],
    violet: ["#a78bfa", "#8b5cf6", "#7c3aed", "#c4b5fd", "#ddd6fe"],
  };

  const opts = (type) => {
    const p = palettes[palette] || palettes.ocean;
    return {
      responsive: true,
      plugins: {
        legend: { labels: { color: p.border } },
        tooltip: { mode: "nearest" },
        zoom: {
          pan: { enabled: true, mode: "xy" },
          zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "xy" },
        },
      },
      scales: {
        x: { ticks: { color: p.border }, grid: { color: "rgba(0,0,0,0.06)" } },
        y: { ticks: { color: p.border }, grid: { color: "rgba(0,0,0,0.06)" } },
      },
      animation: { duration: 600, easing: "easeOutQuart" },
    };
  };

  const state = location.state || {};
  const { xColumn, yColumn, chartType } = state;
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    if (!dataInfo || !xColumn) return null;
    // Limit the chart to show the user-selected number of values
    const rows = (dataInfo.preview || []).slice(0, showCount);
    const labels = rows.map((r) => r[xColumn]);
    const p = palettes[palette] || palettes.ocean;
    const colors = paletteColors[palette] || paletteColors.ocean;
    const dataset = {
      label: yColumn || xColumn,
      data:
        chartType === "scatter"
          ? dataInfo.preview.map((row) => ({ x: Number(row[xColumn]), y: Number(row[yColumn] || row[xColumn]) }))
              : yColumn
              ? rows.map((row) => Number(row[yColumn]))
              : labels.map(() => 1),
      borderColor: p.border,
      backgroundColor: p.bg,
      pointBackgroundColor: p.point,
      tension: 0.4,
      borderWidth: 2,
    };

    // For pie charts, provide multiple slice colors
    if (chartType === "pie") {
      dataset.backgroundColor = labels.map((_, i) => colors[i % colors.length]);
      dataset.borderColor = labels.map(() => "rgba(255,255,255,0.06)");
    }

    return { labels, datasets: [dataset] };
  }, [dataInfo, xColumn, yColumn, chartType, showCount]);

  const stats = useMemo(() => {
    if (!chartData || !chartData.datasets || !chartData.datasets[0]) return null;
    const raw = chartData.datasets[0].data || [];
    const vals = raw
      .map((v) => (typeof v === "number" ? v : v && typeof v.y === "number" ? v.y : Number(v)))
      .filter((n) => !isNaN(n));
    const count = vals.length;
    if (count === 0) return { count: 0, mean: null, min: null, max: null };
    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return { count, mean, min, max };
  }, [chartData]);

  if (!dataInfo) {
    return (
      <div className="page container">
        <h2>No dataset loaded</h2>
        <p>Please upload a dataset first.</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="page container">
        <h2>Chart configuration missing</h2>
        <p>Please select X (and optionally Y) columns from the Dataset page.</p>
      </div>
    );
  }

  return (
    <div className="page container">
      <button className="btn ghost" onClick={() => navigate(-1)}>← Back</button>
      <h2 className="neon">{yColumn ? `${yColumn} vs ${xColumn}` : xColumn}</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
        <label>Palette</label>
        <select value={palette} onChange={(e) => setPalette(e.target.value)}>
          {Object.keys(palettes).map((k) => (<option key={k} value={k}>{k}</option>))}
        </select>

        <label>Count</label>
        <input
          type="number"
          min={1}
          max={(dataInfo && dataInfo.preview && dataInfo.preview.length) || 1000}
          value={showCount}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10) || 0;
            const max = (dataInfo && dataInfo.preview && dataInfo.preview.length) || v;
            const clamped = Math.max(1, Math.min(v, max));
            setShowCount(clamped);
          }}
          style={{ width: 80 }}
        />

        <button className="btn primary" onClick={() => {
          const chart = chartRef.current;
          if (!chart) return;
          const url = chart.toBase64Image();
          const a = document.createElement('a');
          const name = `${yColumn ? yColumn + '_vs_' + xColumn : xColumn}-chart`.replace(/\s+/g, '_');
          a.href = url;
          a.download = `${name}.png`;
          a.click();
        }}>Download PNG</button>

        <button className="btn ghost" onClick={() => {
          const chart = chartRef.current;
          if (!chart || !chart.resetZoom) return;
          try { chart.resetZoom(); } catch (e) { /* fallback: call chart.resetZoom if available */ }
        }}>Reset Zoom</button>
      </div>

      {stats && (
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <div className="stat-card">
            <div style={{ fontSize: 12, color: "#374151" }}>Count</div>
            <div style={{ fontWeight: 700 }}>{stats.count}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 12, color: "#374151" }}>Mean</div>
            <div style={{ fontWeight: 700 }}>{stats.mean === null ? "—" : Number(stats.mean).toFixed(3)}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 12, color: "#374151" }}>Min</div>
            <div style={{ fontWeight: 700 }}>{stats.min === null ? "—" : Number(stats.min).toFixed(3)}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 12, color: "#374151" }}>Max</div>
            <div style={{ fontWeight: 700 }}>{stats.max === null ? "—" : Number(stats.max).toFixed(3)}</div>
          </div>
        </div>
      )}

      <div className="chart-wrap neon-card" style={{ marginTop: 12 }}>
        {chartType === "bar" && <Bar ref={chartRef} data={chartData} options={opts(chartType)} />}
        {chartType === "line" && <Line ref={chartRef} data={chartData} options={opts(chartType)} />}
        {chartType === "pie" && <Pie ref={chartRef} data={chartData} options={opts(chartType)} />}
        {chartType === "scatter" && <Scatter ref={chartRef} data={chartData} options={opts(chartType)} />}
      </div>
    </div>
  );
}
