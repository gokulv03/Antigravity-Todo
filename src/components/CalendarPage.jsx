import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import './CalendarPage.css';

const CalendarPage = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('calendar_events');
        return saved ? JSON.parse(saved) : {};
    });
    const [showModal, setShowModal] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');

    useEffect(() => {
        localStorage.setItem('calendar_events', JSON.stringify(events));
    }, [events]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const onDateClick = (day) => {
        setSelectedDate(day);
        setShowModal(true);
    };

    const addEvent = (e) => {
        e.preventDefault();
        if (!newEventTitle.trim()) return;

        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        const existingEvents = events[dateKey] || [];

        setEvents({
            ...events,
            [dateKey]: [...existingEvents, { id: Date.now(), title: newEventTitle }]
        });

        setNewEventTitle('');
        setShowModal(false);
    };

    const removeEvent = (dateKey, eventId) => {
        const updatedEvents = events[dateKey].filter(ev => ev.id !== eventId);
        if (updatedEvents.length === 0) {
            const newEvents = { ...events };
            delete newEvents[dateKey];
            setEvents(newEvents);
        } else {
            setEvents({
                ...events,
                [dateKey]: updatedEvents
            });
        }
    };

    const renderHeader = () => (
        <div className="calendar-page-header">
            <div className="header-left">
                <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
                <div className="header-nav">
                    <button onClick={prevMonth}><ChevronLeft size={24} /></button>
                    <button onClick={nextMonth}><ChevronRight size={24} /></button>
                </div>
            </div>
            <button className="today-btn" onClick={() => setCurrentMonth(new Date())}>Today</button>
        </div>
    );

    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(currentMonth);
        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="col col-center" key={i}>
                    {format(addDays(startDate, i), 'EEEE')}
                </div>
            );
        }
        return <div className="days row">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = events[dateKey] || [];

                days.push(
                    <div
                        className={`col cell ${!isSameMonth(day, monthStart)
                                ? "disabled"
                                : isSameDay(day, new Date()) ? "today" : ""
                            }`}
                        key={day}
                        onClick={() => onDateClick(cloneDay)}
                    >
                        <span className="number">{formattedDate}</span>
                        <div className="events-container">
                            {dayEvents.slice(0, 3).map(ev => (
                                <div key={ev.id} className="event-badge" title={ev.title}>
                                    {ev.title}
                                </div>
                            ))}
                            {dayEvents.length > 3 && (
                                <div className="more-events">+{dayEvents.length - 3} more</div>
                            )}
                        </div>
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
        return <div className="body">{rows}</div>;
    };

    return (
        <div className="calendar-page">
            {renderHeader()}
            {renderDays()}
            {renderCells()}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Events for {format(selectedDate, 'MMM d, yyyy')}</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>

                        <div className="modal-body">
                            <div className="existing-events">
                                {(events[format(selectedDate, 'yyyy-MM-dd')] || []).map(ev => (
                                    <div key={ev.id} className="event-item">
                                        <span>{ev.title}</span>
                                        <button onClick={() => removeEvent(format(selectedDate, 'yyyy-MM-dd'), ev.id)} className="delete-event">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {!(events[format(selectedDate, 'yyyy-MM-dd')] || []).length && (
                                    <p className="no-events">No events scheduled.</p>
                                )}
                            </div>

                            <form onSubmit={addEvent} className="add-event-form">
                                <input
                                    type="text"
                                    placeholder="Add new event..."
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit"><Plus size={18} /></button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
