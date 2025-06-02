'use client';

import { useEffect, useState } from 'react';
import { fetchAndParseExcel, ParsedExcelData, GateType, findPriceForDimensions } from '@/lib/excel';
import GateSelector from '@/components/GateSelector';
import DimensionsForm from '@/components/DimensionsForm';
import MarginInput from '@/components/MarginInput';
import PriceDisplay from '@/components/PriceDisplay';
import HistoryDisplay from '@/components/HistoryDisplay';
import { loadValuations, saveValuation, clearValuations, ValuationHistoryItem } from '@/lib/history';
import Image from 'next/image';

export default function Home() {
  const [excelData, setExcelData] = useState<ParsedExcelData | null>(null);
  const [selectedGate, setSelectedGate] = useState<GateType | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number | ''; height: number | ''; }>({ width: '', height: '' });
  const [margin, setMargin] = useState<number | ''>('');
  const [exchangeRate, setExchangeRate] = useState<number>(4.4);
  const [priceWithoutMarginEUR, setPriceWithoutMarginEUR] = useState<number | null>(null);
  const [priceWithoutMarginPLN, setPriceWithoutMarginPLN] = useState<number | null>(null);
  const [priceWithMarginEUR, setPriceWithMarginEUR] = useState<number | null>(null);
  const [priceWithMarginPLN, setPriceWithMarginPLN] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dimensionError, setDimensionError] = useState<string | null>(null);
  const [marginError, setMarginError] = useState<string | null>(null);
  const [exchangeRateError, setExchangeRateError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<ValuationHistoryItem[]>([]);
  const [valuationName, setValuationName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const result = await fetchAndParseExcel();
        console.log('Parsed Excel Data:', result);
        setExcelData(result);
        setHistory(loadValuations());
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Excel data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleClearHistory = () => {
    clearValuations();
    setHistory([]);
  };

  const handleCalculateValuation = () => {
    // Reset błędów walidacji i wyników przed nową próbą
    setDimensionError(null);
    setMarginError(null);
    setExchangeRateError(null);
    setError(null);
    setPriceWithoutMarginEUR(null);
    setPriceWithoutMarginPLN(null);
    setPriceWithMarginEUR(null);
    setPriceWithMarginPLN(null);
    setValuationName('');

    // Pobierz wartości i spróbuj przekonwertować na liczby. Pusty string da NaN.
    const widthNum = parseFloat(dimensions.width as string) || 0;
    const heightNum = parseFloat(dimensions.height as string) || 0;
    const marginNum = parseFloat(margin as string) || 0;
    const rateNum = parseFloat(exchangeRate.toString()) || 0;

    // Sprawdź, czy wszystkie wymagane wejścia są dostępne i są poprawnymi liczbami (> 0 dla wymiarów/kursu) oraz czy wybrano bramę
    if (!selectedGate) {
      setError('Proszę wybrać typ bramy.');
      return;
    }

    if (isNaN(widthNum) || isNaN(heightNum) || widthNum <= 0 || heightNum <= 0) {
      setDimensionError('Proszę podać prawidłowe wymiary (liczby większe od 0).');
      return;
    }

    if (isNaN(marginNum) || marginNum < 0) {
      setMarginError('Proszę podać prawidłową wartość marży (liczba nieujemna).');
      return;
    }

    if (isNaN(rateNum) || rateNum <= 0) {
      setExchangeRateError('Proszę podać prawidłowy kurs walut (liczba większa od 0).');
      return;
    }

    if (!excelData) {
      setError('Brak danych cenowych. Spróbuj odświeżyć stronę.');
      return;
    }

    const gatePrices = excelData.gates[selectedGate];
    const packingPrices = excelData.packing[selectedGate];

    if (!gatePrices || !packingPrices) {
      setError(`Brak danych cenowych dla wybranej bramy: ${selectedGate}`);
      return;
    }

    // Find the price for the closest greater or equal dimensions
    const basePrice = findPriceForDimensions(gatePrices, widthNum, heightNum);
    const packingPrice = findPriceForDimensions(packingPrices, widthNum, heightNum);

    if (basePrice === null || packingPrice === null) {
      setDimensionError(`Podane wymiary ${widthNum}x${heightNum} wykraczają poza zakresy dla bramy ${selectedGate}. Brak dostępnych cen.`);
      console.warn(`Could not find price for ${selectedGate} with dimensions ${widthNum}x${heightNum}. Dimensions might be out of range.`);
      return;
    }

    const discountedPrice = basePrice * 0.95; // Apply 5% discount
    const priceBeforeMarginEUR = discountedPrice + packingPrice; // Cena zakupu w EUR
    const priceBeforeMarginPLN = priceBeforeMarginEUR * rateNum; // Użyj skonwertowanego kursu

    const marginDecimal = marginNum / 100;
    const priceWithMarginEUR = priceBeforeMarginEUR * (1 + marginDecimal);
    const priceWithMarginPLN = priceWithMarginEUR * rateNum; // Użyj skonwertowanego kursu

    const finalPriceWithoutMarginEUR = parseFloat(priceBeforeMarginEUR.toFixed(2));
    const finalPriceWithoutMarginPLN = parseFloat(priceBeforeMarginPLN.toFixed(2));
    const finalPriceWithMarginEUR = parseFloat(priceWithMarginEUR.toFixed(2));
    const finalPriceWithMarginPLN = parseFloat(priceWithMarginPLN.toFixed(2));

    // Ustaw wyniki wyceny w stanie, aby były widoczne dla użytkownika
    setPriceWithoutMarginEUR(finalPriceWithoutMarginEUR);
    setPriceWithoutMarginPLN(finalPriceWithoutMarginPLN);
    setPriceWithMarginEUR(finalPriceWithMarginEUR);
    setPriceWithMarginPLN(finalPriceWithMarginPLN);
  };

  const handleSaveCurrentValuation = () => {
    // Sprawdź, czy aktualne ceny w stanie są dostępne (nie null) i nie ma błędów walidacji
    if (!selectedGate
      || typeof dimensions.width !== 'number' || dimensions.width <= 0 // Sprawdzamy czy wymiary są liczbami > 0
      || typeof dimensions.height !== 'number' || dimensions.height <= 0 // Sprawdzamy czy wymiary są liczbami > 0
      || typeof margin !== 'number' || margin < 0 // Sprawdzamy czy marża jest liczbą nieujemną
      || priceWithoutMarginEUR === null
      || priceWithoutMarginPLN === null
      || priceWithMarginEUR === null
      || priceWithMarginPLN === null
      || dimensionError !== null
      || marginError !== null
      || exchangeRateError !== null
      || error !== null // Sprawdź też ogólny błąd ładowania danych
    ) {
      console.warn('Nie można zapisać wyceny: brak pełnych danych, błąd walidacji lub brak obliczonej wyceny.');
      // Można dodać wyświetlanie komunikatu dla użytkownika
      return; // Nie zapisuj, jeśli dane są niepełne lub wystąpił błąd
    }

    // Dane są w odpowiednich typach i przeszły walidację (w handleCalculateValuation)
    const newValuationToSave = {
      gateType: selectedGate,
      dimensions: { width: dimensions.width, height: dimensions.height }, // Użyj wartości ze stanu (są już number)
      margin: margin, // Użyj wartości ze stanu (jest już number)
      priceWithoutMarginEUR: priceWithoutMarginEUR,
      priceWithoutMarginPLN: priceWithoutMarginPLN,
      priceWithMarginEUR: priceWithMarginEUR,
      priceWithMarginPLN: priceWithMarginPLN,
      name: valuationName || 'Wycena bez nazwy',
    };

    saveValuation(newValuationToSave as Omit<ValuationHistoryItem, 'id' | 'timestamp'>);
    setHistory(loadValuations()); // Odśwież stan historii po zapisie
    console.log('Wycena zapisana do historii:', newValuationToSave);
  };

  // Filtruj historię na podstawie frazy wyszukiwania
  const filteredHistory = history.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) // Szukaj tylko w nazwie, ignorując wielkość liter
  );

  return (
    <div className="container mx-auto p-4 max-w-lg md:max-w-xl lg:max-w-2xl">
      <div className="flex justify-center mb-6">
        <Image
          src="/Giovi Doors by D.png"
          alt="Giovi Doors by D Logo"
          width={200}
          height={100}
          priority
        />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">Wycena Bram Szybkobieżnych</h1>
      {error ? (
        <div className="text-red-500 text-center">Error: {error}</div>
      ) : isLoading ? (
        <div className="text-center text-gray-600">Ładowanie danych...</div>
      ) : excelData ? (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <GateSelector selectedGate={selectedGate} onSelectGate={setSelectedGate} availableGates={Object.keys(excelData.gates) as GateType[]} />
          <DimensionsForm
            dimensions={dimensions}
            onSetDimensions={setDimensions}
            errors={{ width: dimensionError, height: dimensionError }}
            ranges={selectedGate ? excelData.ranges[selectedGate] : undefined}
          />
          <MarginInput margin={margin} onSetMargin={setMargin} error={marginError} exchangeRate={exchangeRate} onSetExchangeRate={setExchangeRate} exchangeRateError={exchangeRateError} />

          <button
            onClick={handleCalculateValuation}
            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Wyceń
          </button>

          {(dimensionError || marginError || exchangeRateError || error) && (
            <div className="text-red-500 mt-4 text-center font-medium">{dimensionError || marginError || exchangeRateError || error}</div>
          )}

          {!dimensionError && !marginError && !exchangeRateError && !error && priceWithoutMarginEUR !== null && priceWithoutMarginPLN !== null && priceWithMarginEUR !== null && priceWithMarginPLN !== null ? (
            <PriceDisplay
              priceWithoutMarginEUR={priceWithoutMarginEUR}
              priceWithoutMarginPLN={priceWithoutMarginPLN}
              priceWithMarginEUR={priceWithMarginEUR}
              priceWithMarginPLN={priceWithMarginPLN}
            />
          ) : null}

          {!dimensionError && !marginError && !exchangeRateError && !error && priceWithoutMarginEUR !== null && priceWithoutMarginPLN !== null && priceWithMarginEUR !== null && priceWithMarginPLN !== null && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Zapisz wycenę</h3>
              <input
                type="text"
                placeholder="Nazwa wyceny (opcjonalnie)"
                value={valuationName}
                onChange={(e) => setValuationName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSaveCurrentValuation}
                className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
              >
                Zapisz wycenę
              </button>
            </div>
          )}

          {/* Pole wyszukiwania historii */}
          {history.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Historia wycen</h3>
              <input
                type="text"
                placeholder="Szukaj w historii..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Przekazujemy przefiltrowaną historię do komponentu HistoryDisplay */}
          <HistoryDisplay history={filteredHistory} onClearHistory={handleClearHistory} />
        </div>
      ) : null}
    </div>
  );
}
