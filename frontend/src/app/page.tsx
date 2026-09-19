"use client";

import { useEffect, useState } from "react";

type Model = {
  id: string;
  name: string;
};

type ModelPerformance = {
  id: string;
  name: string;
  cv_accuracy: number;
  test_accuracy: number;
};

type PredictionResult = {
  model: string;
  prediction: string;
  probabilities: Record<string, number>;
};

const features = [
  { name: "sepal_length", label: "Sepal Length", min: 4.3, max: 7.9 },
  { name: "sepal_width", label: "Sepal Width", min: 2.0, max: 4.4 },
  { name: "petal_length", label: "Petal Length", min: 1.0, max: 6.9 },
  { name: "petal_width", label: "Petal Width", min: 0.1, max: 2.5 },
];

export default function Home() {
  const [models, setModels] = useState<Model[]>([]);
  const [performance, setPerformance] = useState<ModelPerformance[]>([]);
  const [model, setModel] = useState("knn");

  const [measurements, setMeasurements] = useState({
    sepal_length: "",
    sepal_width: "",
    petal_length: "",
    petal_width: "",
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("iris-theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("iris-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/models");

        if (!response.ok) {
          throw new Error("Failed to load models");
        }

        const data = await response.json();

        setModels(data.models);

        if (data.models.length > 0) {
          setModel(data.models[0].id);
        }
      } catch (error) {
        console.error(error);
        setError("Could not connect to the backend.");
      } finally {
        setModelsLoading(false);
      }
    };

    const fetchPerformance = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/model-performance"
        );

        if (!response.ok) {
          throw new Error("Failed to load model performance");
        }

        const data = await response.json();
        setPerformance(data.models);
      } catch (error) {
        console.error(error);
      } finally {
        setPerformanceLoading(false);
      }
    };

    fetchModels();
    fetchPerformance();
  }, []);

  const handlePredict = async () => {
    setError("");
    setResult(null);

    const values = Object.values(measurements);

    if (values.some((value) => value === "")) {
      setError("Please enter all four measurements.");
      return;
    }

    const numericValues = {
      sepal_length: Number(measurements.sepal_length),
      sepal_width: Number(measurements.sepal_width),
      petal_length: Number(measurements.petal_length),
      petal_width: Number(measurements.petal_width),
    };

    for (const feature of features) {
      const value =
        numericValues[feature.name as keyof typeof numericValues];

      if (Number.isNaN(value)) {
        setError(`Please enter a valid number for ${feature.label}.`);
        return;
      }

      if (value < feature.min || value > feature.max) {
        setError(
          `${feature.label} must be between ${feature.min} and ${feature.max} cm.`
        );
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          ...numericValues,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          const messages = data.detail.map(
            (error: { msg: string }) => error.msg
          );

          throw new Error(messages.join(" "));
        }

        throw new Error(data.detail || "Prediction request failed.");
      }

      setResult(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Could not get a prediction. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPredictionDescription = (prediction: string) => {
    if (prediction === "Setosa") {
      return "The measurements most closely match Iris Setosa.";
    }

    if (prediction === "Versicolor") {
      return "The measurements most closely match Iris Versicolor.";
    }

    return "The measurements most closely match Iris Virginica.";
  };

  return (
    <main
      className={`min-h-screen px-4 py-8 transition-colors duration-300 sm:px-6 sm:py-10 ${
        darkMode
          ? "bg-zinc-950 text-zinc-100"
          : "bg-zinc-50 text-zinc-900"
      }`}
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Iris Flower Classification
              </h1>

              <p
                className={`mt-4 whitespace-nowrap text-sm sm:text-base ${
                  darkMode ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Enter the four flower measurements and use a trained
                classification model to predict the Iris species.
              </p>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                darkMode
                  ? "border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
              }`}
              aria-label="Toggle dark mode"
            >
              <span className="text-base">
                {darkMode ? "☀" : "☾"}
              </span>
              <span>{darkMode ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Prediction Form */}
          <section
            className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 sm:p-8 ${
              darkMode
                ? "border-zinc-800 bg-zinc-900"
                : "border-zinc-200 bg-white"
            }`}
          >
            <div className="mb-8">
              <h2 className="text-xl font-semibold">
                Make a prediction
              </h2>

              <p
                className={`mt-1 text-sm ${
                  darkMode ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Select a model and provide the flower measurements.
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="text-sm font-medium">
                Classification Model
              </label>

              {modelsLoading ? (
                <div
                  className={`mt-2 rounded-xl border p-3 text-sm ${
                    darkMode
                      ? "border-zinc-700 bg-zinc-950 text-zinc-400"
                      : "border-zinc-200 bg-zinc-50 text-zinc-500"
                  }`}
                >
                  Loading models...
                </div>
              ) : (
                <select
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className={`mt-2 w-full rounded-xl border p-3 outline-none transition ${
                    darkMode
                      ? "border-zinc-700 bg-zinc-950 text-zinc-100 focus:border-zinc-400"
                      : "border-zinc-300 bg-white text-zinc-900 focus:border-zinc-900"
                  }`}
                >
                  {models.map((modelOption) => (
                    <option key={modelOption.id} value={modelOption.id}>
                      {modelOption.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Measurements */}
            <div className="mt-8">
              <div className="mb-4">
                <h3 className="font-semibold">Flower Measurements</h3>

                <p
                  className={`text-sm ${
                    darkMode ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  All measurements are in centimeters.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.name}>
                    <label className="text-sm font-medium">
                      {feature.label}
                    </label>

                    <p
                      className={`mt-1 text-xs ${
                        darkMode ? "text-zinc-500" : "text-zinc-500"
                      }`}
                    >
                      Valid range: {feature.min}–{feature.max}
                    </p>

                    <input
                      type="number"
                      step="0.1"
                      min={feature.min}
                      max={feature.max}
                      value={
                        measurements[
                          feature.name as keyof typeof measurements
                        ]
                      }
                      onChange={(event) =>
                        setMeasurements({
                          ...measurements,
                          [feature.name]: event.target.value,
                        })
                      }
                      className={`mt-2 w-full rounded-xl border p-3 outline-none transition ${
                        darkMode
                          ? "border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-400"
                          : "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900"
                      }`}
                      placeholder="Enter value"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className={`mt-6 rounded-xl border p-4 text-sm ${
                  darkMode
                    ? "border-red-900 bg-red-950/50 text-red-300"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {error}
              </div>
            )}

            <button
              onClick={handlePredict}
              disabled={loading || modelsLoading}
              className={`mt-8 w-full rounded-xl px-4 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                darkMode
                  ? "bg-white text-zinc-900 hover:bg-zinc-200"
                  : "bg-zinc-900 text-white hover:bg-zinc-700"
              }`}
            >
              {loading ? "Analyzing..." : "Predict Species"}
            </button>
          </section>

          {/* Prediction Result */}
          <section
            className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 sm:p-8 ${
              darkMode
                ? "border-zinc-800 bg-zinc-900"
                : "border-zinc-200 bg-white"
            }`}
          >
            <div>
              <p
                className={`text-sm font-semibold uppercase tracking-widest ${
                  darkMode ? "text-zinc-500" : "text-zinc-500"
                }`}
              >
                Result
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Prediction
              </h2>
            </div>

            {result ? (
              <div className="mt-8">
                <div
                  className={`rounded-xl p-5 ${
                    darkMode ? "bg-zinc-950" : "bg-zinc-100"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      darkMode ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Predicted species
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {result.prediction}
                  </p>

                  <p
                    className={`mt-2 text-sm ${
                      darkMode ? "text-zinc-400" : "text-zinc-600"
                    }`}
                  >
                    {getPredictionDescription(result.prediction)}
                  </p>

                  <p
                    className={`mt-4 text-xs ${
                      darkMode ? "text-zinc-500" : "text-zinc-500"
                    }`}
                  >
                    Model used: {result.model}
                  </p>
                </div>

                <div className="mt-8">
                  <h3 className="font-semibold">
                    Model probabilities
                  </h3>

                  <div className="mt-5 space-y-5">
                    {Object.entries(result.probabilities).map(
                      ([species, probability]) => (
                        <div key={species}>
                          <div className="mb-2 flex justify-between text-sm">
                            <span className="font-medium">
                              {species}
                            </span>

                            <span
                              className={
                                darkMode
                                  ? "text-zinc-400"
                                  : "text-zinc-500"
                              }
                            >
                              {(probability * 100).toFixed(2)}%
                            </span>
                          </div>

                          <div
                            className={`h-2 overflow-hidden rounded-full ${
                              darkMode
                                ? "bg-zinc-700"
                                : "bg-zinc-200"
                            }`}
                          >
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                darkMode ? "bg-white" : "bg-zinc-900"
                              }`}
                              style={{
                                width: `${probability * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`mt-8 rounded-xl border border-dashed p-6 text-center ${
                  darkMode
                    ? "border-zinc-700"
                    : "border-zinc-300"
                }`}
              >
                <p
                  className={`font-medium ${
                    darkMode ? "text-zinc-300" : "text-zinc-600"
                  }`}
                >
                  No prediction yet
                </p>

                <p
                  className={`mt-2 text-sm ${
                    darkMode ? "text-zinc-500" : "text-zinc-500"
                  }`}
                >
                  Enter the flower measurements and run the classifier.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Model Performance */}
        <section
          className={`mt-6 rounded-2xl border p-6 shadow-sm transition-colors duration-300 sm:p-8 ${
            darkMode
              ? "border-zinc-800 bg-zinc-900"
              : "border-zinc-200 bg-white"
          }`}
        >
          <div>
            <p
              className={`text-sm font-semibold uppercase tracking-widest ${
                darkMode ? "text-zinc-500" : "text-zinc-500"
              }`}
            >
              Evaluation
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Model Performance
            </h2>

            <p
              className={`mt-1 text-sm ${
                darkMode ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Results from 5-fold cross-validation on the training set
              and evaluation on the held-out test set.
            </p>
          </div>

          {performanceLoading ? (
            <p
              className={`mt-6 text-sm ${
                darkMode ? "text-zinc-500" : "text-zinc-500"
              }`}
            >
              Loading performance data...
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr
                    className={`border-b ${
                      darkMode
                        ? "border-zinc-700 text-zinc-400"
                        : "border-zinc-200 text-zinc-500"
                    }`}
                  >
                    <th className="px-4 py-3 font-medium">
                      Model
                    </th>
                    <th className="px-4 py-3 font-medium">
                      CV Accuracy
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Test Accuracy
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {performance.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b last:border-0 ${
                        darkMode
                          ? "border-zinc-800"
                          : "border-zinc-100"
                      }`}
                    >
                      <td className="px-4 py-4 font-medium">
                        {item.name}
                      </td>

                      <td className="px-4 py-4">
                        {(item.cv_accuracy * 100).toFixed(2)}%
                      </td>

                      <td className="px-4 py-4">
                        {(item.test_accuracy * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer
          className={`mt-8 text-center text-sm ${
            darkMode ? "text-zinc-600" : "text-zinc-500"
          }`}
        >
          Built with Next.js, FastAPI, and scikit-learn
        </footer>
      </div>
    </main>
  );
}