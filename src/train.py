import joblib
from pathlib import Path

from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier


# 1. Load dataset
iris = load_iris()

X = iris.data
y = iris.target


# 2. Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# 3. Define models
models = {
    "KNN": KNeighborsClassifier(n_neighbors=6),

    "Logistic Regression": LogisticRegression(
        max_iter=1000
    ),

    "Decision Tree": DecisionTreeClassifier(
        max_depth=4,
        random_state=42
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )
}


# 4. Compare models
results = {}

for name, model in models.items():

    scores = cross_val_score(
        model,
        X_train,
        y_train,
        cv=5,
        scoring="accuracy"
    )

    test_accuracy = model.fit(
        X_train,
        y_train
    ).score(
        X_test,
        y_test
    )

    results[name] = {
        "cv_accuracy": scores.mean(),
        "test_accuracy": test_accuracy
    }

    scores = cross_val_score(
        model,
        X_train,
        y_train,
        cv=5,
        scoring="accuracy"
    )

    model.fit(X_train, y_train)

    test_accuracy = model.score(X_test, y_test)

    results[name] = {
        "cv_accuracy": scores.mean(),
        "test_accuracy": test_accuracy
    }


# 5. Display results
print("\nIRIS FLOWER CLASSIFICATION")
print("=" * 55)

print(
    f"{'Model':<22}"
    f"{'CV Accuracy':<16}"
    f"{'Test Accuracy':<16}"
)

print("-" * 55)

for name, result in results.items():
    print(
        f"{name:<22}"
        f"{result['cv_accuracy']:.2%}"
        f"{'':<9}"
        f"{result['test_accuracy']:.2%}"
    )


# 6. Train and save all models
Path("models").mkdir(exist_ok=True)

for name, model in models.items():
    model.fit(X_train, y_train)

    filename = name.lower().replace(" ", "_") + ".joblib"
    model_path = Path("models") / filename

    joblib.dump(model, model_path)

    print(f"Saved: {model_path}")


# 7. Select a model
model_names = list(models.keys())

print("\nChoose a model:")

for number, name in enumerate(model_names, start=1):
    print(f"{number}. {name}")

print("5. Automatically select highest CV model")


while True:
    try:
        choice = int(input("\nEnter your choice: "))

        if 1 <= choice <= 5:
            break

        print("Please enter a number between 1 and 5.")

    except ValueError:
        print("Please enter a valid number.")


if choice == 5:
    selected_name = max(
        results,
        key=lambda name: results[name]["cv_accuracy"]
    )

    print(f"\nAutomatically selected: {selected_name}")

else:
    selected_name = model_names[choice - 1]

    print(f"\nSelected model: {selected_name}")


print(f"\nSelected model: {selected_name}")