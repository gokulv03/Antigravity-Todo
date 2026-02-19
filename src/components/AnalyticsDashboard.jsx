import React from 'react';
import { PieChart, BarChart, TrendingUp, CheckCircle, Target, Award } from 'lucide-react';
import { format, subDays, isSameDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ tasks, habits }) => {
    // 1. Completion Rate
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // 2. Weekly Focus Trend (Last 7 Days)
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, 6 - i);
        return date;
    });

    const focusTrendData = last7Days.map(date => {
        const dayTasks = tasks.filter(t => {
            if (!t.completed || !t.completedAt) return false;
            return isSameDay(parseISO(t.completedAt), date);
        });
        return {
            date: format(date, 'EEE'), // Mon, Tue...
            count: dayTasks.length,
            fullDate: format(date, 'MMM d')
        };
    });

    const maxCount = Math.max(...focusTrendData.map(d => d.count), 1); // Avoid div by 0

    // 3. Category Breakdown (Completed Tasks)
    const categories = ['business', 'personal']; // Habits handled separately or included if desired
    const categoryData = categories.map(cat => {
        const count = tasks.filter(t => t.completed && t.category === cat).length;
        const total = tasks.filter(t => t.category === cat).length;
        return {
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            count,
            total,
            color: cat === 'business' ? 'var(--accent-primary)' : 'var(--accent-secondary)'
        };
    });

    return (
        <div className="analytics-container animate-fade-in">
            <div className="analytics-header">
                <h1>Productivity Insights</h1>
                <p>Track your performance and build consistency.</p>
            </div>

            <div className="stats-grid">
                {/* Completion Rate Card */}
                <div className="stat-card rate-card">
                    <div className="stat-icon-wrapper">
                        <Target size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Completion Rate</h3>
                        <div className="big-number">{completionRate}%</div>
                        <p className="stat-sub">of {totalTasks} total tasks</p>
                    </div>

                    {/* Circle Chart Background Effect */}
                    <svg viewBox="0 0 36 36" className="circular-chart">
                        <path className="circle-bg"
                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path className="circle"
                            strokeDasharray={`${completionRate}, 100`}
                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                </div>

                {/* Total Completed Card */}
                <div className="stat-card total-card">
                    <div className="stat-icon-wrapper secondary">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Tasks Done</h3>
                        <div className="big-number">{completedTasks}</div>
                        <p className="stat-sub">Lifetime completion</p>
                    </div>
                </div>
            </div>

            {/* Weekly Trends Chart */}
            <div className="chart-section plain-card">
                <div className="chart-header">
                    <h3><TrendingUp size={20} /> Focus Trends</h3>
                    <span>Last 7 Days</span>
                </div>
                <div className="bar-chart-container">
                    {focusTrendData.map((day, index) => (
                        <div key={index} className="bar-group" title={`${day.count} tasks on ${day.fullDate}`}>
                            <div
                                className="bar"
                                style={{
                                    height: `${(day.count / maxCount) * 100}%`,
                                    opacity: day.count > 0 ? 1 : 0.3
                                }}
                            >
                                {day.count > 0 && <span className="bar-tooltip">{day.count}</span>}
                            </div>
                            <span className="bar-label">{day.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="chart-section plain-card">
                <div className="chart-header">
                    <h3>Category Performance</h3>
                </div>
                <div className="category-bars">
                    {categoryData.map(cat => (
                        <div key={cat.name} className="cat-progress-item">
                            <div className="cat-label">
                                <span>{cat.name}</span>
                                <span>{cat.count}/{cat.total} Done</span>
                            </div>
                            <div className="progress-bg">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${cat.total === 0 ? 0 : (cat.count / cat.total) * 100}%`,
                                        backgroundColor: cat.color
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
