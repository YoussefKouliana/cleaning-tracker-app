import { useState } from "react";

const colorMap: Record<string, string> = {
  white: "bg-gray-200",
  red: "bg-red-400",
  blue: "bg-blue-400",
  green: "bg-green-400",
  yellow: "bg-yellow-300",
  purple: "bg-purple-400",
};

export default function SugarTracker() {
  const [sugarLeft, setSugarLeft] = useState("");
  const [submittedValue, setSubmittedValue] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState("white");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(sugarLeft);
    if (!isNaN(value)) {
      setSubmittedValue(value);
      setSugarLeft("");
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 mt-6 bg-white rounded-xl shadow space-y-4">
      <h1 className="text-xl font-bold text-center">Sugar Container Tracker</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Select Sugar Color</label>
          <div className="flex gap-2 mt-1">
            {Object.keys(colorMap).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColor === color ? "border-black" : "border-transparent"
                } ${colorMap[color]}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">How much sugar left? (kg)</label>
          <input
            type="number"
            value={sugarLeft}
            onChange={(e) => setSugarLeft(e.target.value)}
            placeholder="e.g. 35"
            className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Submit
        </button>
      </form>

      {submittedValue !== null && (
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Last reported:</p>
          <p className="text-lg font-bold">
            {submittedValue} kg - <span className="capitalize">{selectedColor}</span>
          </p>

          {/* Visual Sugar Container */}
          <div className="relative w-24 h-40 mx-auto border-2 border-gray-300 rounded-md overflow-hidden">
            <div
              className={`absolute bottom-0 left-0 w-full ${colorMap[selectedColor]} opacity-70`}
              style={{ height: `${(submittedValue / 50) * 100}%` }} // assuming max 50kg
            />
          </div>
        </div>
      )}
    </div>
  );
}
