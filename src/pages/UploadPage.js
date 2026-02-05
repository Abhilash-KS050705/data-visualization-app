import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setDataInfo } = useContext(DataContext);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setError("");
  };

  const uploadFile = async () => {
    if (!file) return setError("Please select a CSV or Excel file");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload", formData);
      setDataInfo(res.data);
      navigate("/dataset");
    } catch (e) {
      // show backend error message when available
      const msg = e?.response?.data?.detail || e?.message || "Upload failed. Ensure backend is running and file format is valid.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      <h2>Upload Dataset</h2>
      {error && <p className="error">{error}</p>}
      <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
      <br />
      <button className="btn primary" onClick={uploadFile} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
