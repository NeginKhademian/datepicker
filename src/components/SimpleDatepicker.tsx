
// components/PersianDatepicker.tsx
'use client';

import React, { FC, useState, useRef, useEffect } from 'react';
import {
  getJalaliMonths as utilJalaliMonths,
  generateCurrentJalaliMonthDays,
  adjustJalaliMonth,
  calculateBaseTimestamp,
} from '../utils/jalaliUtils';
import PickerPanel from './PickerPanel';
import CalendarGrid from './CalendarGrid';

const SimpleDatepicker: FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Temp panel state
  const [panelYear, setPanelYear] = useState(0);
  const [panelMonth, setPanelMonth] = useState(0);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Extract Jalali year/month
  const [py, pm] = currentDate.toLocaleDateString('fa-IR-u-nu-latn').split('/').map(Number);

  // Calendar data
  const { days: jalaliDays, firstDayOfMonthWeekDay } = generateCurrentJalaliMonthDays(currentDate);
  const offset = firstDayOfMonthWeekDay;
  const months = utilJalaliMonths();

  // Handlers
  const openPicker = () => {
    setPanelYear(py);
    setPanelMonth(pm);
    setPickerOpen(true);
  };

  const changeYear = (year: number) => {
    setPanelYear(year);
  };

  const selectMonth = (year: number, month: number) => {
    const ts = calculateBaseTimestamp(year, month, 1);
    setCurrentDate(new Date(ts * 1000));
  };

  const navigate = (delta: number) => {
    const { year, month } = adjustJalaliMonth(py, pm, delta);
    const ts = calculateBaseTimestamp(year, month, 1);
    setCurrentDate(new Date(ts * 1000));
  };

  return (
    <div dir="rtl" className="relative w-full max-w-md mx-auto p-4 border rounded-lg shadow-sm bg-white font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-700 rounded-full">‹</button>
        <span onClick={openPicker} className="font-bold text-gray-700 text-lg cursor-pointer">
          {currentDate.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })}
        </span>
        <button onClick={() => navigate(+1)} className="p-2  text-gray-700 rounded-full">›</button>
      </div>

      {/* Picker Panel */}
      {pickerOpen && (
        <div ref={pickerRef}>
          <PickerPanel
            panelYear={panelYear}
            panelMonth={panelMonth}
            months={months}
            onYearChange={changeYear}
            onSelectMonth={(y, m) => { selectMonth(y, m); setPickerOpen(false); }}
            onClose={() => setPickerOpen(false)}
          />
        </div>
      )}

      {/* Calendar */}
      <CalendarGrid jalaliDays={jalaliDays} offset={offset}  />
    </div>
  );
};

export default SimpleDatepicker;
