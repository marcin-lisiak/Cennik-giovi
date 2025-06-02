import { Dispatch, SetStateAction } from "react";
import { DimensionsRange } from "@/lib/excel";

interface DimensionsFormProps {
  dimensions: { width: number | ''; height: number | ''; };
  onSetDimensions: Dispatch<SetStateAction<{ width: number | ''; height: number | ''; }>>;
  errors: { width: string | null; height: string | null };
  ranges?: DimensionsRange;
}

export default function DimensionsForm({
  dimensions,
  onSetDimensions,
  errors,
  ranges,
}: DimensionsFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Podaj wymiary</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">Szerokość (mm):</label>
          <input
            type="number"
            id="width"
            className={`block w-full border ${errors.width ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            value={dimensions.width}
            onChange={(e) => onSetDimensions({ ...dimensions, width: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
            min="0"
          />
          {ranges && ranges.minWidth !== 0 && ranges.maxWidth !== 0 && (
            <p className="mt-1 text-xs text-gray-500">Zakres: {ranges.minWidth} - {ranges.maxWidth} mm</p>
          )}
          {errors.width && <p className="mt-1 text-sm text-red-500">{errors.width}</p>}
        </div>
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Wysokość (mm):</label>
          <input
            type="number"
            id="height"
            className={`block w-full border ${errors.height ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            value={dimensions.height}
            onChange={(e) => onSetDimensions({ ...dimensions, height: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
            min="0"
          />
          {ranges && ranges.minHeight !== 0 && ranges.maxHeight !== 0 && (
            <p className="mt-1 text-xs text-gray-500">Zakres: {ranges.minHeight} - {ranges.maxHeight} mm</p>
          )}
          {errors.height && <p className="mt-1 text-sm text-red-500">{errors.height}</p>}
        </div>
      </div>
    </div>
  );
} 