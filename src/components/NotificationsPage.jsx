import React from 'react';
import { Bell, X, CheckCircle, Calendar, AlertTriangle, Flame } from 'lucide-react';
import './NotificationsPage.css';
import { format } from 'date-fns';

const NotificationsPage = ({ notifications, onClear }) => {

    const getIcon = (type) => {
        switch (type) {
            case 'deadline': return <AlertTriangle size={20} className="icon-deadline" />;
            case 'event': return <Calendar size={20} className="icon-event" />;
            case 'completion': return <CheckCircle size={20} className="icon-completion" />;
            case 'milestone': return <Flame size={20} className="icon-milestone" />;
            default: return <Bell size={20} className="icon-default" />;
        }
    };

    return (
        <div className="notifications-page animate-fade-in">
            <div className="notifications-header">
                <h2>Notifications</h2>
                <span className="badge">{notifications.length} New</span>
            </div>

            <div className="notifications-list">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div key={notif.id} className={`notification-card ${notif.type}`} onClick={() => onClear(notif.id)}>
                            <div className="notification-icon-wrapper">
                                {getIcon(notif.type)}
                            </div>
                            <div className="notification-content">
                                <p className="notification-message">{notif.message}</p>
                                <span className="notification-time">
                                    {format(new Date(notif.timestamp), 'MMM d, h:mm a')}
                                </span>
                            </div>
                            <button className="clear-btn" title="Mark as Read">
                                <X size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <Bell size={48} />
                        <p>No new notifications</p>
                        <span>You're all caught up!</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
