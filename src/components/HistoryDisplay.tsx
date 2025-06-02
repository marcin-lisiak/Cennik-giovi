import { ValuationHistoryItem } from "@/lib/history";
import { useState } from 'react';

interface HistoryDisplayProps {
  history: ValuationHistoryItem[];
  onClearHistory: () => void;
}

export default function HistoryDisplay({
  history,
  onClearHistory,
}: HistoryDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (history.length === 0) {
    return null; // Nie wyświetlaj nic, jeśli historia jest pusta
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button
          className="w-full text-left text-lg font-semibold text-gray-800 flex justify-between items-center focus:outline-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          Ostatnie wyceny ({history.length})
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <button
          onClick={onClearHistory}
          className="ml-4 px-3 py-1 text-sm bg-red-500 text-white rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Wyczyść
        </button>
      </div>

      {isExpanded && (
        <ul className="space-y-4">
          {history.map((item) => (
            <li key={item.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              {item.name && <p className="text-sm font-bold text-gray-900 mb-1">{item.name}</p>}
              <p className="text-sm font-medium text-gray-700">{new Date(item.timestamp).toLocaleString()}</p>
              <p className="text-gray-800"><span className="font-medium">{item.gateType}</span> - {item.dimensions.width}x{item.dimensions.height} mm</p>
              <p className="text-gray-800">Marża: {item.margin}%</p>
              <p className="text-gray-800">Cena zakupu: {item.priceWithoutMarginEUR.toFixed(2)} EUR / {item.priceWithoutMarginPLN.toFixed(2)} PLN</p>
               <p className="text-gray-800">Cena klienta: {item.priceWithMarginEUR.toFixed(2)} EUR / {item.priceWithMarginPLN.toFixed(2)} PLN</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 