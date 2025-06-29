// components/PickerPanel.tsx
'use client';

import React, { FC } from 'react';

interface PickerPanelProps {
  panelYear: number;
  panelMonth: number;
  months: { id: number; title: string }[];
  onYearChange: (year: number) => void;
  onSelectMonth: (year: number, month: number) => void;
  onClose: () => void;
}

const PickerPanel: FC<PickerPanelProps> = ({
  panelYear,
  panelMonth,
  months,
  onYearChange,
  onSelectMonth,
  onClose,
}) => (
  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-4 z-10 w-80" ref={React.useRef<HTMLDivElement>(null)}>
    {/* Year selector */}
    <div className="flex justify-between items-center text-gray-700 mb-2">
      <button onClick={() => onYearChange(panelYear - 1)} className="p-1 rounded">‹</button>
      <span className="font-medium">{panelYear.toLocaleString('fa-IR',{useGrouping:false})}</span>
      <button onClick={() => onYearChange(panelYear + 1)} className="p-1 rounded">›</button>
    </div>

    {/* Month grid */}
    <div className="grid grid-cols-4 gap-2 text-center">
      {months.map(mo => (
        <button
          key={mo.id}
          onClick={() => { onSelectMonth(panelYear, mo.id); onClose(); }}
          className={`py-1 px-2 rounded ${mo.id === panelMonth ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}>
          {mo.title}
        </button>
      ))}
    </div>
  </div>
);

export default PickerPanel;
