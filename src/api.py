import joblib
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel


MODEL_DIR = Path(__file__).resolve().parent.parent / "models"

MODELS = {
    "knn": ("KNN", "knn.joblib"),
    "logistic_regression": (
        "Logistic Regression",
        "logistic_regression.joblib"
    ),
    "decision_tree": (
        "Decision Tree",
        "decision_tree.joblib"
    ),
    "random_forest": (
        "Random Forest",
        "random_forest.joblib"
    )
}

SPECIES_NAMES = {
    0: "Setosa",
    1: "Versicolor",
    2: "Virginica"
}


app = FastAPI(
    title="Iris Flower Classification API",
    description="API for predicting Iris flower species using machine learning models.",
    version="1.0.0"
)


class PredictionRequest(BaseModel):
    model: str
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float


@app.get("/")
def root():
    return {
        "message": "Iris Flower Classification API is running"
    }


@app.get("/health")
def health_check():
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


@app.post("/predict")
def predict(request: PredictionRequest):
    model_name, model_filename = MODELS[request.model]

    model_path = MODEL_DIR / model_filename
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
            for species, probability
            in zip(SPECIES_NAMES.values(), probabilities)
        }
    }