"use client";

import { useEffect, useState } from "react";

type Model = {
  id: string;
  name: string;
};

type PredictionResult = {
  model: string;
  prediction: string;
  probabilities: Record<string, number>;
};

export default function Home() {
  const [models, setModels] = useState<Model[]>([]);
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
  const [error, setError] = useState("");

  const features = [
    {
      name: "sepal_length",
      label: "Sepal Length",
      min: 4.3,
      max: 7.9,
    },
    {
      name: "sepal_width",
      label: "Sepal Width",
      min: 2.0,
      max: 4.4,
    },
    {
      name: "petal_length",
      label: "Petal Length",
      min: 1.0,
      max: 6.9,
    },
    {
      name: "petal_width",
      label: "Petal Width",
      min: 0.1,
      max: 2.5,
    },
  ];

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/models"
        );

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

    fetchModels();
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            sepal_length: Number(measurements.sepal_length),
            sepal_width: Number(measurements.sepal_width),
            petal_length: Number(measurements.petal_length),
            petal_width: Number(measurements.petal_width),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);
      setError("Could not get a prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">
          Iris Flower Classification
        </h1>

        <p className="mt-3 text-gray-600">
          Predict the species of an Iris flower using a machine
          learning model.
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <label className="block font-medium">
              Model
            </label>

            {modelsLoading ? (
              <p className="mt-2 text-sm text-gray-500">
                Loading models...
              </p>
            ) : (
              <select
                value={model}
                onChange={(event) =>
                  setModel(event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
              >
                {models.map((modelOption) => (
                  <option
                    key={modelOption.id}
                    value={modelOption.id}
                  >
                    {modelOption.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              Flower Measurements
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.name}>
                  <label className="block font-medium">
                    {feature.label}
                  </label>

                  <p className="mt-1 text-sm text-gray-500">
                    Range: {feature.min} - {feature.max} cm
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
                    className="mt-2 w-full rounded-lg border p-3"
                    placeholder={`Enter ${feature.label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading || modelsLoading}
            className="w-full rounded-lg bg-black p-3 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Predicting..." : "Predict Species"}
          </button>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold">
                Prediction Result
              </h2>

              <p className="mt-4 text-2xl font-bold">
                {result.prediction}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Model: {result.model}
              </p>

              <div className="mt-6 space-y-3">
                {Object.entries(result.probabilities).map(
                  ([species, probability]) => (
                    <div key={species}>
                      <div className="flex justify-between text-sm">
                        <span>{species}</span>
                        <span>
                          {(probability * 100).toFixed(2)}%
                        </span>
                      </div>

                      <div className="mt-1 h-2 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-black"
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
          )}
        </div>
      </div>
    </main>
  );
}