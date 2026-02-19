import React, { useState } from 'react';
import { User, Mail, Shield, Check, Palette, Image as ImageIcon, Layout, Sun, Moon, Monitor } from 'lucide-react';
import './SettingsPage.css';

const SettingsPage = ({ user, currentTheme, onThemeChange }) => {
    // Generate avatar URL
    const avatarUrl = user
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`
        : "https://ui-avatars.com/api/?name=Guest&background=random&color=fff";

    return (
        <div className="settings-page">
            <header className="settings-header">
                <h2>Settings</h2>
                <p>Manage your account, appearance, and preferences.</p>
            </header>

            <div className="settings-grid">
                {/* Account Section - Now shows Real User Info */}
                <section className="settings-section">
                    <div className="section-header">
                        <User size={20} className="section-icon" />
                        <h3>Account Profile</h3>
                    </div>

                    <div className="account-badge">
                        <img src={avatarUrl} alt="Avatar" className="profile-img-lg" />
                        <div className="badge-info">
                            <h4 className="user-real-name">{user ? user.name : 'Guest User'}</h4>
                            <span className="user-email">{user ? user.email : 'Not signed in'}</span>
                            <span className="sync-status">
                                <Check size={12} /> Sync Active • Online
                            </span>
                        </div>
                    </div>
                </section>

                {/* Appearance Section */}
                <section className="settings-section">
                    <div className="section-header">
                        <Palette size={20} className="section-icon" />
                        <h3>Look & Feel</h3>
                    </div>

                    {/* Theme Selector */}
                    <div className="setting-group">
                        <label>Color Theme</label>
                        <div className="theme-options">
                            <button
                                className={`theme-btn ${currentTheme === 'nebula' || currentTheme === 'dark' ? 'active' : ''}`}
                                onClick={() => onThemeChange('nebula')}
                            >
                                <div className="theme-preview nebula" style={{ background: 'linear-gradient(135deg, #0f172a, #334155)' }}></div>
                                <span>Nebula</span>
                            </button>
                            <button
                                className={`theme-btn ${currentTheme === 'lux' ? 'active' : ''}`}
                                onClick={() => onThemeChange('lux')}
                            >
                                <div className="theme-preview lux" style={{ background: '#000', border: '1px solid #FFD700' }}></div>
                                <span>Lux</span>
                            </button>
                            <button
                                className={`theme-btn ${currentTheme === 'royal' ? 'active' : ''}`}
                                onClick={() => onThemeChange('royal')}
                            >
                                <div className="theme-preview royal" style={{ background: 'linear-gradient(135deg, #1a0b1c, #4a2c4d)' }}></div>
                                <span>Royal</span>
                            </button>
                            <button
                                className={`theme-btn ${currentTheme === 'sunset' ? 'active' : ''}`}
                                onClick={() => onThemeChange('sunset')}
                            >
                                <div className="theme-preview sunset" style={{ background: 'linear-gradient(135deg, #1e1b4b, #4338ca)' }}></div>
                                <span>Sunset</span>
                            </button>
                            <button
                                className={`theme-btn ${currentTheme === 'ocean' ? 'active' : ''}`}
                                onClick={() => onThemeChange('ocean')}
                            >
                                <div className="theme-preview ocean" style={{ background: 'linear-gradient(135deg, #020617, #0f172a)' }}></div>
                                <span>Ocean</span>
                            </button>
                            <button
                                className={`theme-btn ${currentTheme === 'oled' ? 'active' : ''}`}
                                onClick={() => onThemeChange('oled')}
                            >
                                <div className="theme-preview oled" style={{ background: '#000' }}></div>
                                <span>OLED</span>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsPage;
