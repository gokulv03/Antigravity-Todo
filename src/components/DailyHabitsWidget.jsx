import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Flame } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import './DailyHabitsWidget.css';

const DailyHabitsWidget = ({ addNotification }) => {
    const [habits, setHabits] = useState(() => {
        const saved = localStorage.getItem('daily_habits');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'Drink 2L Water', completed: false, lastCompletedDate: null, streak: 0 },
            { id: 2, title: 'Read 30 mins', completed: false, lastCompletedDate: null, streak: 0 },
        ];
    });

    const [newHabitTitle, setNewHabitTitle] = useState('');

    useEffect(() => {
        // Daily Reset Logic
        const updatedHabits = habits.map(habit => {
            if (habit.lastCompletedDate && !isToday(parseISO(habit.lastCompletedDate))) {
                return { ...habit, completed: false };
            }
            return habit;
        });

        // Only update if there are changes to avoid infinite loop if we were setting state directly here without checking
        // But since we are doing this on mount/update, we actually need to be careful. 
        // Better approach: Check on load.
    }, []); // Run once on mount

    useEffect(() => {
        localStorage.setItem('daily_habits', JSON.stringify(habits));
    }, [habits]);

    const items = habits.map(habit => {
        // Run specific check for display
        const isCompletedToday = habit.lastCompletedDate && isToday(parseISO(habit.lastCompletedDate));
        return { ...habit, completed: isCompletedToday };
    });

    const addHabit = (e) => {
        e.preventDefault();
        if (!newHabitTitle.trim()) return;

        const newHabit = {
            id: Date.now(),
            title: newHabitTitle,
            completed: false,
            lastCompletedDate: null,
            streak: 0
        };

        setHabits([...habits, newHabit]);
        setNewHabitTitle('');
    };

    const toggleHabit = (id) => {
        setHabits(habits.map(habit => {
            if (habit.id === id) {
                const now = new Date();
                const todayStr = now.toISOString();

                // If already completed today, toggle off (undo)
                if (habit.lastCompletedDate && isToday(parseISO(habit.lastCompletedDate))) {
                    return {
                        ...habit,
                        completed: false,
                        lastCompletedDate: null, // Resetting date might break streak logic if we were strict, but for simple toggle off it's fine
                        streak: Math.max(0, habit.streak - 1)
                    };
                }

                // If marking as complete
                let newStreak = habit.streak;
                // If last completed was yesterday, increment streak
                if (habit.lastCompletedDate && isYesterday(parseISO(habit.lastCompletedDate))) {
                    newStreak += 1;
                } else if (!habit.lastCompletedDate || !isToday(parseISO(habit.lastCompletedDate))) {
                    const lastDate = habit.lastCompletedDate ? parseISO(habit.lastCompletedDate) : null;
                    if (lastDate && isYesterday(lastDate)) {
                        newStreak += 1;
                    } else if (lastDate && isToday(lastDate)) {
                        // should not happen in this branch
                    } else {
                        newStreak = 1;
                    }
                }

                // Milestone Check (Every 30 days)
                if (newStreak > 0 && newStreak % 30 === 0) {
                    if (addNotification) {
                        addNotification(`🔥 Incredible! You reached a ${newStreak}-day streak for "${habit.title}"!`, 'milestone');
                    }
                }

                return {
                    ...habit,
                    completed: true,
                    lastCompletedDate: todayStr,
                    streak: newStreak
                };
            }
            return habit;
        }));
    };

    const deleteHabit = (id) => {
        setHabits(habits.filter(h => h.id !== id));
    };

    return (
        <div className="daily-habits-widget">
            <div className="widget-header">
                <h3>Daily Habits</h3>
                <span className="date-badge">{format(new Date(), 'MMM d')}</span>
            </div>

            <div className="habits-list">
                {items.map(habit => (
                    <div key={habit.id} className={`habit-item ${habit.completed ? 'completed' : ''}`}>
                        <div className="habit-content">
                            <button
                                className={`check-circle ${habit.completed ? 'checked' : ''}`}
                                onClick={() => toggleHabit(habit.id)}
                            >
                                {habit.completed && <Check size={14} />}
                            </button>
                            <span className="habit-title">{habit.title}</span>
                        </div>
                        <div className="habit-actions">
                            <div className="streak-badge" title="Current Streak">
                                <Flame size={14} className={habit.streak > 0 ? 'lit' : ''} />
                                <span>{habit.streak}</span>
                            </div>
                            <button className="delete-habit-btn" onClick={() => deleteHabit(habit.id)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={addHabit} className="add-habit-form">
                <input
                    type="text"
                    placeholder="New habit..."
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                />
                <button type="submit"><Plus size={16} /></button>
            </form>
        </div>
    );
};

export default DailyHabitsWidget;
