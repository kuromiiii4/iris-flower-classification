# Iris Flower Classification

A machine learning classification project that compares multiple supervised learning models on the Iris dataset and exposes the trained models through a FastAPI backend with a Next.js web interface.

The project covers the complete workflow from data exploration and model evaluation to model persistence, API development, frontend integration, and input validation.

## Features

* Exploratory data analysis of the Iris dataset
* Train/test split with stratification
* Comparison of four classification algorithms
* 5-fold cross-validation
* Hyperparameter analysis for KNN, Decision Tree, and Random Forest
* Classification reports and confusion matrices
* Saved trained models using Joblib
* Interactive command-line prediction program
* FastAPI prediction API
* Next.js frontend
* Model performance comparison in the web interface
* Prediction probability visualization
* Frontend and backend input validation
* Light/dark mode
* Custom Iris favicon

## Dataset

The project uses the Iris dataset provided by `scikit-learn`.

The dataset contains 150 samples with four numerical features:

| Feature      | Description               |
| ------------ | ------------------------- |
| Sepal Length | Length of the sepal in cm |
| Sepal Width  | Width of the sepal in cm  |
| Petal Length | Length of the petal in cm |
| Petal Width  | Width of the petal in cm  |

The three target classes are:

* Setosa
* Versicolor
* Virginica

The dataset was split into:

* 80% training data — 120 samples
* 20% test data — 30 samples

A stratified split with `random_state=42` was used.

## Exploratory Data Analysis

The exploratory analysis showed that the Setosa class is clearly separated from the other two classes.

Versicolor and Virginica have more overlap, particularly around their petal measurements. Petal length and petal width were also found to be particularly useful for distinguishing the classes.

## Models Evaluated

Four classification models were evaluated:

1. K-Nearest Neighbors
2. Logistic Regression
3. Decision Tree
4. Random Forest

### Model comparison

The following results were obtained using 5-fold cross-validation on the training set and evaluation on the held-out test set.

| Model               | Mean CV Accuracy | Test Accuracy |
| ------------------- | ---------------: | ------------: |
| KNN                 |           98.33% |        96.67% |
| Logistic Regression |           96.67% |        96.67% |
| Decision Tree       |           94.17% |        93.33% |
| Random Forest       |           95.00% |        90.00% |

Among the configurations evaluated in this project, KNN achieved the highest mean cross-validation accuracy and tied Logistic Regression for the highest test accuracy. Therefore, KNN with `k=6` was selected as the primary configuration for the project.

This result applies to the experiments performed on this dataset and should not be interpreted as a general claim that KNN is always the best classifier for Iris data.

## KNN Analysis

Different values of `k` were evaluated using 5-fold cross-validation.

The best mean cross-validation result in the evaluated range was obtained with:

```text
k = 6
Mean CV Accuracy = 98.33%
```

The final KNN model achieved:

```text
Test Accuracy = 96.67%
```

The test confusion matrix was:

```text
[[10, 0, 0],
 [ 0,10, 0],
 [ 0, 1, 9]]
```

The single test-set error was a Virginica sample predicted as Versicolor.

A comparison with a `StandardScaler` pipeline was also performed. For this particular Iris setup, scaling resulted in lower cross-validation and test performance, so the unscaled KNN configuration was retained.

## Decision Tree Analysis

The maximum tree depth was evaluated using cross-validation.

The selected configuration was:

```text
max_depth = 4
Mean CV Accuracy = 94.17%
```

Feature importance from the evaluated tree showed that petal length and petal width were the most important features.

## Logistic Regression Analysis

Logistic Regression achieved:

```text
Mean CV Accuracy = 96.67%
Test Accuracy = 96.67%
```

One test-set error occurred near the Versicolor–Virginica decision boundary.

## Random Forest Analysis

Random Forest was evaluated with different numbers of trees and different maximum depths.

The evaluated final configuration used:

```text
n_estimators = 100
random_state = 42
```

Its results were:

```text
Mean CV Accuracy = 95.00%
Test Accuracy = 90.00%
```

Petal length and petal width were again the most important features.

Several of the Random Forest errors occurred around the Versicolor–Virginica boundary.

## Model Disagreement

Samples near the Versicolor–Virginica boundary produced disagreement between models.

For example, the following samples were examined during the analysis:

| Sample | Sepal Length | Sepal Width | Petal Length | Petal Width | Actual Class |
| ------ | -----------: | ----------: | -----------: | ----------: | ------------ |
| 19     |          6.0 |         3.0 |          4.8 |         1.8 | Virginica    |
| 23     |          6.1 |         2.6 |          5.6 |         1.4 | Virginica    |
| 25     |          6.7 |         3.0 |          5.0 |         1.7 | Versicolor   |

These examples illustrate that classification becomes more difficult when feature values lie close to the boundary between two classes.

## Project Architecture

The application has three main layers:

```text
                    ┌──────────────────────┐
                    │    Next.js Frontend  │
                    │                      │
                    │  User Input          │
                    │  Model Selection     │
                    │  Prediction Results  │
                    │  Performance Table   │
                    └──────────┬───────────┘
                               │ HTTP
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    │                      │
                    │  Input Validation    │
                    │  Model Selection     │
                    │  Prediction API      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Saved ML Models      │
                    │                      │
                    │ KNN                  │
                    │ Logistic Regression  │
                    │ Decision Tree        │
                    │ Random Forest        │
                    └──────────────────────┘
```

## Project Structure

```text
iris-flower-classification/
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── icon.png
│   │       ├── globals.css
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── public/
│   ├── package.json
│   └── ...
│
├── models/
│   ├── knn.joblib
│   ├── logistic_regression.joblib
│   ├── decision_tree.joblib
│   └── random_forest.joblib
│
├── notebooks/
│   └── 01_iris_classification.ipynb
│
├── src/
│   ├── train.py
│   ├── predict.py
│   └── api.py
│
├── .gitignore
├── requirements.txt
└── README.md
```

## Backend

The backend is implemented using FastAPI.

### Available endpoints

| Method | Endpoint             | Purpose                         |
| ------ | -------------------- | ------------------------------- |
| GET    | `/`                  | Check that the API is running   |
| GET    | `/health`            | Health check                    |
| GET    | `/models`            | List available models           |
| GET    | `/model-performance` | Return model evaluation results |
| POST   | `/predict`           | Predict an Iris species         |

FastAPI also provides an interactive API documentation interface at:

```text
http://127.0.0.1:8000/docs
```

## Prediction API

A prediction request contains the selected model and four flower measurements.

Example:

```json
{
  "model": "knn",
  "sepal_length": 5.1,
  "sepal_width": 3.5,
  "petal_length": 1.4,
  "petal_width": 0.2
}
```

The API returns the predicted species along with the model's class probabilities.

## Input Validation

The application validates Iris measurement ranges on both the frontend and backend.

| Feature      | Valid Range |
| ------------ | ----------: |
| Sepal Length |  4.3–7.9 cm |
| Sepal Width  |  2.0–4.4 cm |
| Petal Length |  1.0–6.9 cm |
| Petal Width  |  0.1–2.5 cm |

Frontend validation provides immediate feedback to the user, while backend validation ensures invalid requests cannot bypass the application's constraints.

## Frontend

The frontend is built using:

* Next.js
* React
* TypeScript
* Tailwind CSS

The web interface allows users to:

* Select a classification model
* Enter flower measurements
* Receive a prediction
* View prediction probabilities
* Compare model performance
* Switch between light and dark mode

## Installation

Clone the repository:

```bash
git clone https://github.com/kuromiiii4/iris-flower-classification.git
cd iris-flower-classification
```

### Backend setup

Create and activate a virtual environment:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install the Python dependencies:

```powershell
pip install -r requirements.txt
```

Start the FastAPI server:

```powershell
python -m uvicorn src.api:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

### Frontend setup

Open another terminal and enter the frontend directory:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

## Training the Models

The training script can be run from the project root:

```powershell
python src/train.py
```

The script:

1. Loads the Iris dataset.
2. Creates the train/test split.
3. Evaluates the four classification models.
4. Performs 5-fold cross-validation.
5. Prints the comparison results.
6. Saves the trained models to the `models/` directory.

## Command-Line Prediction

Predictions can also be made without the web application:

```powershell
python src/predict.py
```

The program allows the user to select a model and enter the four flower measurements interactively.

## Technologies Used

### Machine Learning

* Python
* NumPy
* Pandas
* Matplotlib
* scikit-learn
* Joblib

### Backend

* FastAPI
* Uvicorn
* Pydantic

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Development

* Git
* GitHub
* VS Code

## Limitations

This project uses the small, well-known Iris dataset, so its results should not be interpreted as representative of performance on larger or more complex real-world classification problems.

The reported model performance depends on the particular train/test split and cross-validation configuration used in this project.

The web application currently runs the frontend and backend as separate services and uses locally stored model files.

## Future Improvements

Possible extensions include:

* Deploy the FastAPI backend and Next.js frontend
* Add automated model retraining
* Add more datasets
* Add additional classification algorithms
* Add visualizations of the decision boundaries
* Add automated tests for the API
* Add CI/CD using GitHub Actions
* Containerize the application with Docker
* Add production environment configuration

## License

This project is intended for educational and portfolio purposes.