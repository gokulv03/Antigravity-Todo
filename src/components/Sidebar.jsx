import React from 'react';
import { LayoutDashboard, CheckSquare, Calendar as CalendarIcon, Settings, LogOut, TrendingUp, Coffee, X } from 'lucide-react';
import PomodoroTimer from './PomodoroTimer';
import './Sidebar.css';

const Sidebar = ({ activeView, onViewChange, user, onLogout, isMobileOpen, onClose }) => {
    // Fallback if user is null (though App.jsx handles this usually)
    const displayName = user ? user.name : 'Guest User';
    const names = displayName.split(' ');
    const firstName = names[0];
    const lastName = names.length > 1 ? names[names.length - 1] : '';

    // Generate avatar URL based on user name
    const avatarUrl = user
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0f172a&color=fff`
        : "https://ui-avatars.com/api/?name=Guest&background=0f172a&color=fff";

    return (
        <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
            <button className="close-sidebar-btn" onClick={onClose}>
                <X size={24} />
            </button>
            <div className="user-profile-section">
                <div className="profile-image-container">
                    <img
                        src={avatarUrl}
                        alt="User"
                        className="user-avatar"
                    />
                    <div className="profile-glow"></div>
                </div>
                <div className="user-info">
                    <h2 className="user-name">
                        {firstName}<br />{lastName}
                    </h2>
                </div>
            </div>

            <nav className="sidebar-nav">
                <button
                    className={`nav-item ${activeView === 'overview' ? 'active' : ''}`}
                    onClick={() => onViewChange('overview')}
                >
                    <LayoutDashboard size={20} />
                    <span>Overview</span>
                </button>
                <button
                    className={`nav-item ${activeView === 'calendar' ? 'active' : ''}`}
                    onClick={() => onViewChange('calendar')}
                >
                    <CalendarIcon size={20} />
                    <span>Calendar</span>
                </button>
                <button
                    className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
                    onClick={() => onViewChange('settings')}
                >
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
                <button
                    className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
                    onClick={() => onViewChange('analytics')}
                >
                    <TrendingUp size={20} />
                    <span>Analytics</span>
                </button>
                <button
                    className={`nav-item ${activeView === 'pomodoro' ? 'active' : ''}`}
                    onClick={() => onViewChange('pomodoro')}
                >
                    <Coffee size={20} />
                    <span>Pomodoro</span>
                </button>
            </nav>

            <div className="sidebar-footer">
                <div className="consistency-graph">
                    <svg viewBox="0 0 100 30" className="sparkline">
                        <path
                            d="M0,25 C10,25 15,10 25,15 C35,20 40,5 50,10 C60,15 65,25 75,20 C85,15 90,5 100,10"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#d946ef" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="graph-label">
                        <span className="label-main">Good</span>
                        <span className="label-sub">Consistency</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={onLogout} title="Sign Out">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
