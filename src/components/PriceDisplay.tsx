import React from 'react';
import { useState, useEffect } from 'react';

interface PriceDisplayProps {
  priceWithoutMarginEUR: number | null;
  priceWithoutMarginPLN: number | null;
  priceWithMarginEUR: number | null;
  priceWithMarginPLN: number | null;
}

export default function PriceDisplay({
  priceWithoutMarginEUR,
  priceWithoutMarginPLN,
  priceWithMarginEUR,
  priceWithMarginPLN,
}: PriceDisplayProps) {
  const [copiedPrice, setCopiedPrice] = useState<'none' | 'eur_no_margin' | 'pln_no_margin' | 'eur_margin' | 'pln_margin'>('none');

  useEffect(() => {
    if (copiedPrice !== 'none') {
      const timer = setTimeout(() => {
        setCopiedPrice('none');
      }, 2000); // Reset statusu po 2 sekundach
      return () => clearTimeout(timer);
    }
  }, [copiedPrice]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };

  const handleCopy = async (priceType: 'eur_no_margin' | 'pln_no_margin' | 'eur_margin' | 'pln_margin', value: number | null) => {
      if (value === null) return;
      const textToCopy = value.toFixed(2);
      const success = await copyToClipboard(textToCopy);
      if (success) {
          setCopiedPrice(priceType);
      }
  }

  return (
    <div className="bg-gray-100 p-4 rounded-md space-y-2">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Wyniki wyceny</h3>
      {priceWithoutMarginEUR !== null && (
        <p className="text-gray-800 flex items-center justify-between">
            Cena zakupu (bez marży): <span className="font-medium">{priceWithoutMarginEUR.toFixed(2)} EUR</span>
             <button
                 onClick={() => handleCopy('eur_no_margin', priceWithoutMarginEUR)}
                 className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
             >
                 {copiedPrice === 'eur_no_margin' ? 'Skopiowano!' : 'Kopiuj'}
             </button>
        </p>
      )}
      {priceWithoutMarginPLN !== null && (
        <p className="text-gray-800 flex items-center justify-between">
            Cena zakupu (bez marży): <span className="font-medium">{priceWithoutMarginPLN.toFixed(2)} PLN</span>
             <button
                 onClick={() => handleCopy('pln_no_margin', priceWithoutMarginPLN)}
                 className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
             >
                 {copiedPrice === 'pln_no_margin' ? 'Skopiowano!' : 'Kopiuj'}
             </button>
        </p>
      )}

       {(priceWithoutMarginEUR !== null || priceWithoutMarginPLN !== null) && (priceWithMarginEUR !== null || priceWithMarginPLN !== null) && (
            <div className="border-t border-gray-300 my-2"></div>
       )}

      {priceWithMarginEUR !== null && (
        <p className="text-gray-800 flex items-center justify-between">
            Cena dla klienta (z marżą): <span className="font-medium">{priceWithMarginEUR.toFixed(2)} EUR</span>
             <button
                 onClick={() => handleCopy('eur_margin', priceWithMarginEUR)}
                 className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
             >
                 {copiedPrice === 'eur_margin' ? 'Skopiowano!' : 'Kopiuj'}
             </button>
        </p>
      )}
      {priceWithMarginPLN !== null && (
        <p className="text-gray-800 flex items-center justify-between">
            Cena dla klienta (z marżą): <span className="font-medium">{priceWithMarginPLN.toFixed(2)} PLN</span>
             <button
                 onClick={() => handleCopy('pln_margin', priceWithMarginPLN)}
                 className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
             >
                 {copiedPrice === 'pln_margin' ? 'Skopiowano!' : 'Kopiuj'}
             </button>
        </p>
      )}
    </div>
  );
} 