import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from 'lucide-react';
import './PomodoroTimer.css';

const PomodoroTimer = () => {
    // Load saved settings or default
    const [focusDuration, setFocusDuration] = useState(() => parseInt(localStorage.getItem('pomo_focus')) || 25);
    const [breakDuration, setBreakDuration] = useState(() => parseInt(localStorage.getItem('pomo_break')) || 5);

    const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // 'focus' | 'break'
    const [progress, setProgress] = useState(100);
    const [showSettings, setShowSettings] = useState(false);

    // Temp state for editing
    const [tempFocus, setTempFocus] = useState(focusDuration);
    const [tempBreak, setTempBreak] = useState(breakDuration);

    const timerRef = useRef(null);
    const audioContextRef = useRef(null);

    const MODES = {
        focus: { time: focusDuration * 60, color: 'var(--accent-primary)', label: 'Focus' },
        break: { time: breakDuration * 60, color: 'var(--success)', label: 'Break' }
    };

    // Update timeLeft if settings change and timer is NOT running
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(MODES[mode].time);
            setProgress(100);
        }
    }, [focusDuration, breakDuration]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    const newTime = prev - 1;
                    const totalTime = MODES[mode].time;
                    setProgress((newTime / totalTime) * 100);
                    return newTime;
                });
            }, 1000);
        } else if (timeLeft === 0) {
            handleComplete();
        }

        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft, mode, focusDuration, breakDuration]);

    const handleComplete = () => {
        setIsActive(false);
        playBeep();
        const nextMode = mode === 'focus' ? 'break' : 'focus';
        if (Notification.permission === 'granted') {
            new Notification(mode === 'focus' ? "Focus Session Complete!" : "Break Over!");
        }
        // Optional: Auto-switch?
        // setMode(nextMode);
        // setTimeLeft(MODES[nextMode].time);
        // setProgress(100);
    };

    const playBeep = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(MODES[mode].time);
        setProgress(100);
    };

    const switchMode = () => {
        setIsActive(false);
        const newMode = mode === 'focus' ? 'break' : 'focus';
        setMode(newMode);
        setTimeLeft(MODES[newMode].time);
        setProgress(100);
    };

    const saveSettings = () => {
        setFocusDuration(tempFocus);
        setBreakDuration(tempBreak);
        localStorage.setItem('pomo_focus', tempFocus);
        localStorage.setItem('pomo_break', tempBreak);
        setShowSettings(false);
        // Reset timer to apply changes immediately if wanted, or let effect handle it
        setIsActive(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="pomodoro-widget" style={{ '--current-color': MODES[mode].color, position: 'relative', overflow: 'hidden' }}>
            <div className="timer-header">
                <span className="mode-label">
                    {mode === 'focus' ? <Brain size={14} /> : <Coffee size={14} />}
                    {MODES[mode].label}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="mode-switch-btn" onClick={switchMode} title="Switch Mode">
                        Switch
                    </button>
                    <button className="settings-toggle" onClick={() => setShowSettings(true)}>
                        <Settings size={14} />
                    </button>
                </div>
            </div>

            <div className="timer-display-container">
                <svg className="timer-ring" viewBox="0 0 100 100">
                    <circle className="ring-bg" cx="50" cy="50" r="45" />
                    <circle
                        className="ring-progress"
                        cx="50" cy="50" r="45"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * progress / 100)}
                    />
                </svg>
                <div className="time-value">
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="timer-controls">
                <button className={`control-btn main ${isActive ? 'active' : ''}`} onClick={toggleTimer}>
                    {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
                <button className="control-btn reset" onClick={resetTimer}>
                    <RotateCcw size={16} />
                </button>
            </div>

            {/* Settings Overlay */}
            {showSettings && (
                <div className="settings-overlay">
                    <div className="settings-group">
                        <label>Focus Duration (min)</label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={tempFocus}
                            onChange={(e) => setTempFocus(Number(e.target.value))}
                        />
                    </div>
                    <div className="settings-group">
                        <label>Break Duration (min)</label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={tempBreak}
                            onChange={(e) => setTempBreak(Number(e.target.value))}
                        />
                    </div>
                    <button className="save-btn" onClick={saveSettings}>Save Changes</button>
                </div>
            )}
        </div>
    );
};

export default PomodoroTimer;
