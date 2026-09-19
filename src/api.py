import joblib
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


MODEL_DIR = Path(__file__).resolve().parent.parent / "models"

MODELS = {
    "knn": ("KNN", "knn.joblib"),
    "logistic_regression": ("Logistic Regression", "logistic_regression.joblib"),
    "decision_tree": ("Decision Tree", "decision_tree.joblib"),
    "random_forest": ("Random Forest", "random_forest.joblib")
}

MODEL_PERFORMANCE = {
    "knn": {"cv_accuracy": 0.9833, "test_accuracy": 0.9667},
    "logistic_regression": {"cv_accuracy": 0.9667, "test_accuracy": 0.9667},
    "decision_tree": {"cv_accuracy": 0.9417, "test_accuracy": 0.9333},
    "random_forest": {"cv_accuracy": 0.9500, "test_accuracy": 0.9000},
}

SPECIES_NAMES = {
    0: "Setosa",
    1: "Versicolor",
    2: "Virginica"
}


app = FastAPI(
    title="Iris Flower Classification API",
    description="API for predicting Iris flower species using trained ML models.",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class PredictionRequest(BaseModel):
    model: str = Field(..., description="Model ID to use for prediction")
    sepal_length: float = Field(..., ge=4.3, le=7.9)
    sepal_width: float = Field(..., ge=2.0, le=4.4)
    petal_length: float = Field(..., ge=1.0, le=6.9)
    petal_width: float = Field(..., ge=0.1, le=2.5)


@app.get("/")
def root():
    return {
        "message": "Iris Flower Classification API is running."
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/models")
def get_models():
    return {
        "models": [
            {
                "id": model_id,
                "name": model_name
            }
            for model_id, (model_name, _) in MODELS.items()
        ]
    }


@app.get("/model-performance")
def get_model_performance():
    return {
        "models": [
            {
                "id": model_id,
                "name": MODELS[model_id][0],
                **MODEL_PERFORMANCE[model_id]
            }
            for model_id in MODELS
        ]
    }


@app.post("/predict")
def predict(request: PredictionRequest):
    if request.model not in MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model. Choose one of: {', '.join(MODELS.keys())}"
        )

    model_name, model_filename = MODELS[request.model]
    model_path = MODEL_DIR / model_filename

    if not model_path.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Model file not found: {model_filename}"
        )

    try:
        model = joblib.load(model_path)

        input_data = [[
            request.sepal_length,
            request.sepal_width,
            request.petal_length,
            request.petal_width
        ]]

        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]

        return {
            "model": model_name,
            "prediction": SPECIES_NAMES[prediction],
            "probabilities": {
                species: float(probability)
                for species, probability in zip(
                    SPECIES_NAMES.values(),
                    probabilities
                )
            }
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )