
'use client';

import React, { FC } from 'react';
import { getTodayDate } from '@/utils/jalaliUtils';
interface DayObj {
    day: number;
    ts: number;
}

interface CalendarGridProps {
    jalaliDays: DayObj[];
    offset: number;
}

const CalendarGrid: FC<CalendarGridProps> = ({ jalaliDays, offset }) => {
    const todayTs = getTodayDate()
    const weekdays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

    return (
        <>
            <div className="grid grid-cols-7 gap-1 text-sm font-semibold mb-2 text-gray-600">
                {weekdays.map((d, i) => <div key={i} className="py-1 text-center">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: offset }).map((_, i) => <div key={i} className="p-2" />)}
                {jalaliDays.map(dayObj => {
                    const isToday = todayTs.ts === dayObj.ts
                    return (
                        <div
                            key={dayObj.ts}
                            className={`p-2 flex items-center justify-center rounded transition-colors cursor-pointer hover:bg-gray-100 ${isToday
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-white text-gray-800'
                                }`}
                        >
                            {dayObj.day.toLocaleString('fa-IR')}
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default CalendarGrid;


