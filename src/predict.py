import joblib
from pathlib import Path


MODEL_DIR = Path(__file__).resolve().parent.parent / "models"

MODELS = {
    "1": ("KNN", "knn.joblib"),
    "2": ("Logistic Regression", "logistic_regression.joblib"),
    "3": ("Decision Tree", "decision_tree.joblib"),
    "4": ("Random Forest", "random_forest.joblib")
}

FEATURES = [
    ("Sepal length", 4.3, 7.9),
    ("Sepal width", 2.0, 4.4),
    ("Petal length", 1.0, 6.9),
    ("Petal width", 0.1, 2.5)
]

SPECIES_NAMES = {
    0: "Setosa",
    1: "Versicolor",
    2: "Virginica"
}


def choose_model():
    print("IRIS FLOWER CLASSIFICATION")
    print("=" * 35)

    print("\nChoose a model:")

    for number, (name, filename) in MODELS.items():
        print(f"{number}. {name}")

    while True:
        choice = input("\nEnter your choice (1-4): ")

        if choice in MODELS:
            break

        print("Please enter a number between 1 and 4.")

    model_name, model_filename = MODELS[choice]

    model_path = MODEL_DIR / model_filename
    model = joblib.load(model_path)

    print(f"\nUsing model: {model_name}")

    return model, model_name


def get_input_values():
    print("\nEnter flower measurements:")

    input_values = []

    for feature_name, minimum, maximum in FEATURES:
        while True:
            try:
                value = float(
                    input(
                        f"{feature_name} ({minimum} - {maximum} cm): "
                    )
                )

                if minimum <= value <= maximum:
                    input_values.append(value)
                    break

                print(
                    f"Please enter a value between "
                    f"{minimum} and {maximum}."
                )

            except ValueError:
                print("Please enter a valid number.")

    return input_values


def predict_species(model, input_values):
    prediction_input = [input_values]

    prediction = model.predict(prediction_input)[0]
    probabilities = model.predict_proba(prediction_input)[0]

    predicted_species = SPECIES_NAMES[prediction]

    return predicted_species, probabilities


def display_prediction(predicted_species, probabilities):
    print(f"\nPredicted species: {predicted_species}")

    print("\nPrediction probabilities:")

    for species, probability in zip(SPECIES_NAMES.values(), probabilities):
        print(f"{species}: {probability:.2%}")


def main():
    model, model_name = choose_model()

    input_values = get_input_values()

    predicted_species, probabilities = predict_species(
        model,
        input_values
    )

    display_prediction(
        predicted_species,
        probabilities
    )


if __name__ == "__main__":
    main()