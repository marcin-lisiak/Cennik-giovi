import { Dispatch, SetStateAction, useState } from "react";

interface MarginInputProps {
  margin: number | '';
  onSetMargin: Dispatch<SetStateAction<number | ''>>;
  error: string | null;
  exchangeRate: number;
  onSetExchangeRate: Dispatch<SetStateAction<number>>;
  exchangeRateError: string | null;
}

export default function MarginInput({
  margin,
  onSetMargin,
  error,
  exchangeRate,
  onSetExchangeRate,
  exchangeRateError,
}: MarginInputProps) {
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [newExchangeRate, setNewExchangeRate] = useState<number | ''>(exchangeRate);

  const handleRateChange = () => {
    if (typeof newExchangeRate === 'number' && newExchangeRate > 0) {
      onSetExchangeRate(newExchangeRate);
      setIsEditingRate(false);
    } else {
      console.warn('Niepoprawna wartość kursu walut.');
    }
  };

  const handleCancelEdit = () => {
    setNewExchangeRate(exchangeRate);
    setIsEditingRate(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Podaj marżę i kurs</h3>
      <div>
        <label htmlFor="margin" className="block text-sm font-medium text-gray-700 mb-1">Marża (%):</label>
        <input
          type="number"
          id="margin"
          className={`block w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          value={margin}
          onChange={(e) => onSetMargin(e.target.value === '' ? '' : parseFloat(e.target.value))}
          min="0"
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kurs EURO na PLN:</label>
        {isEditingRate ? (
          <div className="flex space-x-2 items-center">
            <input
              type="number"
              className={`block w-full border ${exchangeRateError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              value={newExchangeRate}
              onChange={(e) => setNewExchangeRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
              min="0"
              step="0.01"
            />
            <button onClick={handleRateChange} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">Zapisz</button>
            <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">Anuluj</button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-lg font-medium text-gray-800">{exchangeRate.toFixed(2)} PLN</span>
            <button onClick={() => setIsEditingRate(true)} className="px-3 py-1 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm">Zmień kurs</button>
          </div>
        )}
        {exchangeRateError && <p className="mt-1 text-sm text-red-500">{exchangeRateError}</p>}
      </div>
    </div>
  );
} 