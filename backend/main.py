from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import matplotlib.pyplot as plt
import io
import base64

app = FastAPI(title="Data Analyst & Visualization API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- HELPER FUNCTION ----------
def read_file(file: UploadFile):
    file.file.seek(0)  # 🔥 CRITICAL FIX

    filename = file.filename.lower()

    try:
        if filename.endswith(".csv"):
            return pd.read_csv(file.file)

        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            return pd.read_excel(file.file)

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Upload CSV or Excel file."
            )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"File reading failed: {str(e)}"
        )

# ---------- ROOT ----------
@app.get("/")
def root():
    return {"message": "Backend is running successfully"}

# ---------- UPLOAD ----------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    df = read_file(file)

    return {
        "filename": file.filename,
        "columns": df.columns.tolist(),
        "rows": len(df),
        "preview": df.head(50).to_dict(orient="records"),
        "full_data": df.to_dict(orient="records"),
    }

# ---------- ANALYZE ----------
@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    df = read_file(file)
    numeric_df = df.select_dtypes(include="number")

    return {
        "numeric_columns": numeric_df.columns.tolist(),
        "mean": numeric_df.mean().to_dict(),
        "min": numeric_df.min().to_dict(),
        "max": numeric_df.max().to_dict(),
        "count": numeric_df.count().to_dict(),
    }

# ---------- VISUALIZE ----------
@app.post("/visualize")
async def visualize(
    file: UploadFile = File(...),
    chart_type: str = Form(...),
    x_column: str = Form(...),
    y_column: str = Form(None),
):
    df = read_file(file)

    if x_column not in df.columns:
        raise HTTPException(status_code=400, detail="Invalid X column")

    if y_column and y_column not in df.columns:
        raise HTTPException(status_code=400, detail="Invalid Y column")

    plt.style.use("seaborn-v0_8-whitegrid")
    plt.figure(figsize=(9, 5))

    if chart_type == "bar":
        if not y_column or not pd.api.types.is_numeric_dtype(df[y_column]):
            raise HTTPException(status_code=400, detail="Y must be numeric for bar chart")
        df.groupby(x_column)[y_column].sum().plot(kind="bar", color="#2563eb")

    elif chart_type == "line":
        df.plot(x=x_column, y=y_column, linewidth=2)

    elif chart_type == "histogram":
        if not pd.api.types.is_numeric_dtype(df[x_column]):
            raise HTTPException(status_code=400, detail="X must be numeric for histogram")
        df[x_column].plot(kind="hist", bins=20, color="#16a34a")

    elif chart_type == "pie":
        df.groupby(x_column).size().plot(
            kind="pie",
            autopct="%1.1f%%",
            startangle=90
        )
        plt.ylabel("")

    elif chart_type == "scatter":
        if not (
            pd.api.types.is_numeric_dtype(df[x_column])
            and pd.api.types.is_numeric_dtype(df[y_column])
        ):
            raise HTTPException(
                status_code=400,
                detail="X and Y must be numeric for scatter plot"
            )
        df.plot(kind="scatter", x=x_column, y=y_column, color="#dc2626")

    else:
        raise HTTPException(status_code=400, detail="Unsupported chart type")

    plt.title(f"{chart_type.capitalize()} Chart")
    plt.tight_layout()

    buffer = io.BytesIO()
    plt.savefig(buffer, format="png")
    plt.close()
    buffer.seek(0)

    return {
        "chart_type": chart_type,
        "image": base64.b64encode(buffer.read()).decode("utf-8"),
    }
