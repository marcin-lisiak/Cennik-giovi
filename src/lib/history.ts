import { GateType } from "@/lib/excel";

export interface ValuationHistoryItem {
  id: string;
  timestamp: number;
  gateType: GateType;
  dimensions: { width: number; height: number };
  margin: number;
  priceWithoutMarginEUR: number;
  priceWithoutMarginPLN: number;
  priceWithMarginEUR: number;
  priceWithMarginPLN: number;
  name?: string;
}

const STORAGE_KEY = 'valuationHistory';

export function loadValuations(): ValuationHistoryItem[] {
  try {
    const historyString = localStorage.getItem(STORAGE_KEY);
    if (historyString) {
      // Parsowanie i upewnienie się, że to tablica i elementy mają timestamp
      const history = JSON.parse(historyString);
      if (Array.isArray(history)) {
          return history.map(item => ({...item, timestamp: item.timestamp || Date.now()})); // Dodaj fallback dla timestamp
      } else {
          console.error('Stored history is not an array.');
          return [];
      }
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error loading valuation history:', error);
    return [];
  }
}

export function saveValuation(valuation: Omit<ValuationHistoryItem, 'id' | 'timestamp'>): void {
    try {
        const history = loadValuations();
        // Dodaj unikalne ID i timestamp
        const newItem: ValuationHistoryItem = {
            ...valuation,
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
        };
        // Dodaj nowy element na początek i ogranicz liczbę przechowywanych wycen (np. do 10)
        const newHistory = [newItem, ...history].slice(0, 10);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
        console.error('Error saving valuation history:', error);
    }
}

// Funkcja do czyszczenia historii (opcjonalnie)
export function clearValuations(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing valuation history:', error);
    }
} 