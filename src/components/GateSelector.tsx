import { GateType } from "@/lib/excel";
import { Dispatch, SetStateAction } from "react";

interface GateSelectorProps {
  selectedGate: GateType | null;
  onSelectGate: Dispatch<SetStateAction<GateType | null>>;
  availableGates: GateType[];
}

export default function GateSelector({
  selectedGate,
  onSelectGate,
  availableGates,
}: GateSelectorProps) {
  return (
    <div>
      <label htmlFor="gate-select" className="block text-sm font-medium text-gray-700 mb-1">Wybierz bramę:</label>
      <select
        id="gate-select"
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
        value={selectedGate || ''}
        onChange={(e) => onSelectGate(e.target.value as GateType)}
      >
        <option value="">-- Wybierz bramę --</option>
        {availableGates.map((gate) => (
          <option key={gate} value={gate}>
            {gate}
          </option>
        ))}
      </select>
    </div>
  );
} 