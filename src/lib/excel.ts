import * as XLSX from 'xlsx';

export type GateType =
  | 'MasterPack'
  | 'MasterRoll'
  | 'MasterRoll CarWash'
  | 'MasterRoll INOX'
  | 'ActiveRoll'
  | 'Active Car Wash'
  | 'Active Food INOX'
  | 'Active COLD 20'
  | 'Active COLD 55'
  | 'Active Pharma';

export interface PriceCell {
  width: number;
  height: number;
  price: number;
}

// Nowy interfejs do przechowywania zakresów wymiarów
export interface DimensionsRange {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
}

export interface GatePrices {
  [gateType: string]: PriceCell[];
}

export interface PackingPriceCell {
  width: number;
  height: number;
  price: number;
}

export interface PackingPrices {
  [gateType: string]: PackingPriceCell[];
}

export interface ParsedExcelData {
  gates: GatePrices;
  packing: PackingPrices;
  ranges: { [gateType: string]: DimensionsRange }; // Dodaj pola na zakresy
}

const GATE_TYPES_TO_PARSE: GateType[] = ['MasterPack', 'ActiveRoll'];

// Funkcja do pobierania i parsowania pliku Excel
export async function fetchAndParseExcel(): Promise<ParsedExcelData> {
  const res = await fetch('/ceny bram.xlsx');
  const arrayBuffer = await res.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const gates: GatePrices = {};
  const packing: PackingPrices = {};
  const ranges: { [gateType: string]: DimensionsRange } = {}; // Zainicjuj obiekt na zakresy

  for (const gateType of GATE_TYPES_TO_PARSE) {
    const gateSheetName = `${gateType} - cena`;
    const packingSheetName = `${gateType} - pakowanie`;

    const gatesSheet = workbook.Sheets[gateSheetName];
    const packingSheet = workbook.Sheets[packingSheetName];

    // Parsuj dane o cenach
    const parsedGateData = gatesSheet ? parseSheet(gatesSheet) : null;
    if (parsedGateData && parsedGateData.prices.length > 0) {
        gates[gateType] = parsedGateData.prices;
        // Oblicz i zapisz zakresy dla tej bramy
        const widths = parsedGateData.prices.map(item => item.width);
        const heights = parsedGateData.prices.map(item => item.height);
        ranges[gateType] = {
            minWidth: Math.min(...widths),
            maxWidth: Math.max(...widths),
            minHeight: Math.min(...heights),
            maxHeight: Math.max(...heights),
        };
    } else {
        console.warn(`Could not parse gate data or data is empty for sheet: ${gateSheetName}`);
        gates[gateType] = [];
         // Ustaw domyślne (zerowe) zakresy, jeśli brak danych
        ranges[gateType] = { minWidth: 0, maxWidth: 0, minHeight: 0, maxHeight: 0 };
    }

    // Parsuj dane o pakowaniu (na razie nie używamy ich do zakresów, ale warto je mieć)
    const parsedPackingData = packingSheet ? parseSheet(packingSheet) : null;
    if (parsedPackingData && parsedPackingData.prices.length > 0) {
        packing[gateType] = parsedPackingData.prices;
    } else {
        console.warn(`Could not parse packing data or data is empty for sheet: ${packingSheetName}`);
        packing[gateType] = [];
    }
  }

  return {
    gates,
    packing,
    ranges, // Zwróć również obliczone zakresy
  };
}

// Funkcja pomocnicza do parsowania arkusza Excel w ustandaryzowanym formacie
// Zwraca nazwę arkusza (z A1) i sparsowane dane
function parseSheet(sheet: XLSX.WorkSheet): { name: string, prices: PriceCell[] } | null {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

  // Odczyt nazwy (zakładamy, że jest w komórce A1)
  const nameCell = sheet['A1'];
  const name = nameCell ? String(nameCell.v).trim() : null; // Zezwól na null name

  if (!name) {
    console.warn('Sheet name not found or is empty in A1.');
    return null; // Zwróć null, jeśli nazwa jest pusta lub brak komórki
  }

  // Odczyt szerokości (zakładamy, że są w wierszu 2, zaczynając od B2)
  const widths: number[] = [];
  // Zaczynamy od kolumny B (indeks 1) w wierszu 2 (indeks 1)
  for (let c = 1; c <= range.e.c; c++) { // c=1 to kolumna B
    const cellAddress = XLSX.utils.encode_cell({ r: 1, c }); // wiersz 2 ma indeks 1
    const cell = sheet[cellAddress];
    if (cell && typeof cell.v === 'number') {
      widths.push(cell.v);
    } else if (cell && cell.v) { // Jeśli komórka nie jest pusta, ale nie jest liczbą, zakładamy koniec szerokości
      break;
    } else if (!cell) {
      // Jeśli komórka jest pusta, też zakładamy koniec szerokości
      // Kontynuujemy, aby znaleźć wszystkie szerokości nawet jeśli między nimi są puste komórki
      continue; // Zmieniono break na continue
    }
  }

  // Usuń duplikaty i posortuj szerokości
  const uniqueWidths = [...new Set(widths)].sort((a, b) => a - b);

  if (uniqueWidths.length === 0) {
    console.warn(`No valid numeric widths found in sheet ${name}`);
    return { name, prices: [] };
  }

  // Odczyt wysokości i cen (wysokości w kolumnie A od wiersza 3, ceny od B3)
  const prices: PriceCell[] = [];
  // Zaczynamy od wiersza 3 (indeks 2)
  for (let r = 2; r <= range.e.r; r++) { // r=2 to wiersz 3
    const heightCellAddress = XLSX.utils.encode_cell({ r, c: 0 }); // kolumna A ma indeks 0
    const heightCell = sheet[heightCellAddress];

    if (!heightCell || typeof heightCell.v !== 'number') {
      // Jeśli komórka wysokości jest pusta lub nie jest liczbą, zakładamy koniec danych
      break;
    }

    const height = heightCell.v;

    // Odczyt cen dla danej wysokości
    for (let i = 0; i < uniqueWidths.length; i++) { // Użyj uniqueWidths do iteracji po kolumnach
      const width = uniqueWidths[i];
      const priceCol = widths.indexOf(width) + 1; // Znajdź indeks kolumny dla danej szerokości i dodaj 1 (indeks kolumny w arkuszu)

      // Upewnij się, że priceCol jest w zakresie arkusza
      if (priceCol <= range.e.c) {
        const priceCellAddress = XLSX.utils.encode_cell({ r, c: priceCol });
        const priceCell = sheet[priceCellAddress];

        if (priceCell && typeof priceCell.v === 'number') {
          prices.push({
            width,
            height,
            price: Math.round(priceCell.v), // Zaokrąglanie ceny
          });
        } else {
          // Jeśli napotkamy brak ceny dla danej szerokości/wysokości, możemy dodać 0 lub pominąć
          console.warn(`Missing price for ${name} - Width: ${width}, Height: ${height}`);
          // Można dodać { width, height, price: 0 } jeśli chcemy mieć wszystkie komórki z ceną 0
        }
      } else {
        console.warn(`Column index ${priceCol} for width ${width} is out of sheet range.`);
      }
    }
  }

  // Sortuj ceny według szerokości, a następnie wysokości, aby ułatwić wyszukiwanie
  prices.sort((a, b) => {
    if (a.width !== b.width) {
      return a.width - b.width;
    }
    return a.height - b.height;
  });

  return { name, prices };
}

// Funkcja do wyszukiwania ceny dla najbliższych większych lub równych wymiarów
export function findPriceForDimensions(
  priceList: PriceCell[],
  targetWidth: number,
  targetHeight: number
): number | null {
  for (const priceCell of priceList) {
    if (priceCell.width >= targetWidth && priceCell.height >= targetHeight) {
      // Znaleziono pierwsze pasujące wymiary (najmniejsze większe/równe dzięki sortowaniu)
      return priceCell.price;
    }
  }

  return null; // Brak pasujących wymiarów w liście
} 