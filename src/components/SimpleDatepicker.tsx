// components/PersianDatepicker.tsx
'use client';

import React, { FC, useState, useRef, useEffect } from 'react';
import {
  getJalaliMonths as utilJalaliMonths,
  generateCurrentJalaliMonthDays,
  adjustJalaliMonth,
  calculateBaseTimestamp,
} from '../utils/jalaliUtils';

const SimpleDatepicker: FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // TEMP picker state
  const [panelYear, setPanelYear] = useState<number>(0);
  const [panelMonth, setPanelMonth] = useState<number>(0);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Extract Jalali py,pm from currentDate
  const [py, pm] = currentDate
    .toLocaleDateString('fa-IR-u-nu-latn')
    .split('/')
    .map(Number);

  // When opening the picker, seed panelYear/panelMonth
  const openPicker = () => {
    setPanelYear(py);
    setPanelMonth(pm);
    setPickerOpen(true);
  };

  // Month navigation buttons (outside picker)
  const goToPreviousMonth = () => {
    const { year: y, month: m } = adjustJalaliMonth(py, pm, -1);
    const ts = calculateBaseTimestamp(y, m, 1);
    setCurrentDate(new Date(ts * 1000));
  };
  const goToNextMonth = () => {
    const { year: y, month: m } = adjustJalaliMonth(py, pm, +1);
    const ts = calculateBaseTimestamp(y, m, 1);
    setCurrentDate(new Date(ts * 1000));
  };

  // Data for calendar grid
  const { days: jalaliDays, firstDayOfMonthWeekDay } =
    generateCurrentJalaliMonthDays(currentDate);
  const offset = firstDayOfMonthWeekDay - 1; // Saturday→0

  const displayLabel = currentDate.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
  });

  const weekdaysLabels = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const months = utilJalaliMonths();

  return (
    <div
      dir="rtl"
      className="relative w-full max-w-md mx-auto p-4 border rounded-lg shadow-sm bg-white font-sans"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 text-gray-900 hover:bg-gray-100 rounded-full"
        >
          ‹
        </button>
        <span
          onClick={openPicker}
          className="font-bold text-lg md:text-xl text-gray-900 cursor-pointer"
        >
          {displayLabel}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-2 text-gray-900 hover:bg-gray-100 rounded-full"
        >
          ›
        </button>
      </div>

      {/* Picker Panel */}
      {pickerOpen && (
        <div
          ref={pickerRef}
          className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-4 z-10 w-64"
        >
          {/* Year selector */}
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setPanelYear(panelYear - 1)}
              className="p-1 text-gray-900 rounded"
            >
              ‹
            </button>
            <span className="font-medium text-gray-800">{panelYear}</span>
            <button
              onClick={() => setPanelYear(panelYear + 1)}
              className="p-1 text-gray-900 rounded"
            >
              ›
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {months.map((mo) => (
              <button
                key={mo.id}
                onClick={() => {
                  // commit selection
                  const ts = calculateBaseTimestamp(panelYear, mo.id, 1);
                  setCurrentDate(new Date(ts * 1000));
                  setPickerOpen(false);
                }}
                className={`py-1 px-2 rounded ${
                  mo.id === panelMonth
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100'
                } text-gray-900`}
              >
                {mo.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-sm font-semibold mb-2 text-gray-600">
        {weekdaysLabels.map((d, i) => (
          <div key={i} className="py-1 text-center">
            {d}
          </div>
        ))}
      </div>
      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }, (_, i) => (
          <div key={i} className="p-2" />
        ))}
        {jalaliDays.map((dayObj) => {
          const isToday =
            dayObj.ts === Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
          return (
            <div
              key={dayObj.ts}
              className={`p-2 flex items-center justify-center rounded transition-colors cursor-pointer hover:bg-gray-100 ${
                isToday
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-white text-gray-800'
              }`}
            >
              {dayObj.day.toLocaleString('fa-IR')}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleDatepicker;
