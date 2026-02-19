import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CalendarWidget.css';

const CalendarWidget = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const onDateClick = (day) => {
        setSelectedDate(day);
    };

    const renderHeader = () => {
        return (
            <div className="calendar-header">
                <button onClick={prevMonth} className="nav-btn">
                    <ChevronLeft size={20} />
                </button>
                <div className="month-display">
                    <span>{format(currentMonth, 'MMMM yyyy')}</span>
                </div>
                <button onClick={nextMonth} className="nav-btn">
                    <ChevronRight size={20} />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const dateFormat = "EEEEE";
        const startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="day-name" key={i}>
                    {format(addDays(startDate, i), dateFormat)}
                </div>
            );
        }

        return <div className="days-row">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;

                days.push(
                    <div
                        className={`cell ${!isSameMonth(day, monthStart)
                                ? "disabled"
                                : isSameDay(day, selectedDate) ? "selected" : ""
                            }`}
                        key={day}
                        onClick={() => onDateClick(cloneDay)}
                    >
                        <span className="number">{formattedDate}</span>
                        {isSameDay(day, new Date()) && <div className="today-indicator"></div>}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="row" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="calendar-body">{rows}</div>;
    };

    return (
        <div className="calendar-widget">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
};

export default CalendarWidget;
