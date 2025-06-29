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

  // Close picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Extract current Jalali year & month (Latin digits)
  const [py, pm] = currentDate
    .toLocaleDateString('fa-IR-u-nu-latn')
    .split('/')
    .map(Number);

  // Navigate by year
  const selectYear = (newYear: number) => {
    // Preserve current Jalali month/day
    const jDay = +currentDate.toLocaleDateString('fa-IR-u-nu-latn', { day: 'numeric' });
    const ts = calculateBaseTimestamp(newYear, pm, jDay);
    setCurrentDate(new Date(ts * 1000));
  };

  // Navigate by month using utilities
  const selectMonth = (newMonth: number) => {
    const delta = newMonth - pm;
    const { year: newYear, month: targetMonth } = adjustJalaliMonth(py, pm, delta);
    // Always go to first day of target month
    const ts = calculateBaseTimestamp(newYear, targetMonth, 1);
    setCurrentDate(new Date(ts * 1000));
  };

  const goToPreviousMonth = () => selectMonth(pm === 1 ? 12 : pm - 1);
  const goToNextMonth = () => selectMonth(pm === 12 ? 1 : pm + 1);

  const { days: jalaliDays, firstDayOfMonthWeekDay } = generateCurrentJalaliMonthDays(currentDate);
  const offset = firstDayOfMonthWeekDay - 1; // 1 (Saturday) → index 0

  // Displayed month/year label in Persian
  const displayLabel = currentDate.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
  });

  const weekdaysLabels = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const months = utilJalaliMonths();

  return (
    <div dir="rtl" className="relative w-full max-w-md mx-auto p-4 border rounded-lg shadow-sm bg-white font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 rounded-full">‹</button>
        <span
          onClick={() => setPickerOpen(!pickerOpen)}
          className="font-bold text-lg md:text-xl text-gray-900 cursor-pointer"
        >
          {displayLabel}
        </span>
        <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-full">›</button>
      </div>

      {/* Picker Panel */}
      {pickerOpen && (
        <div
          ref={pickerRef}
          className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-4 z-10 w-64"
        >
          {/* Year selector */}
          <div className="flex justify-between items-center mb-2">
            <button onClick={() => selectYear(py - 1)} className="p-1 rounded hover:bg-gray-100">‹</button>
            <span className="font-medium text-gray-800">{py}</span>
            <button onClick={() => selectYear(py + 1)} className="p-1 rounded hover:bg-gray-100">›</button>
          </div>
          {/* Month grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {months.map((mo) => (
              <button
                key={mo.id}
                onClick={() => { selectMonth(mo.id); setPickerOpen(false); }}
                className={`py-1 px-2 rounded ${mo.id === pm ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'} text-gray-900`}
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
          <div key={i} className="py-1 text-center">{d}</div>
        ))}
      </div>
      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }, (_, i) => <div key={i} className="p-2" />)}
        {jalaliDays.map((dayObj) => {
          const isToday = dayObj.ts === Math.floor(new Date().setHours(0,0,0,0) / 1000);
          return (
            <div
              key={dayObj.ts}
              className={`p-2 flex items-center justify-center rounded transition-colors cursor-pointer hover:bg-gray-100 ${isToday ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-800'}`}
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
