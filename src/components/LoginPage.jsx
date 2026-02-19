import React, { useState } from 'react';
import { User, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        // Simulate login delay
        setTimeout(() => {
            onLogin({ name, email }, rememberMe);
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-circle">
                        <div className="logo-inner"></div>
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue your journey</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form animate-fade-in">
                    <div className="input-field">
                        <User size={20} className="field-icon" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(''); }}
                        />
                    </div>

                    <div className="input-field">
                        <Mail size={20} className="field-icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        />
                    </div>

                    <div className="checkbox-container">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span className="checkmark-box">
                                {rememberMe && <CheckCircle size={12} />}
                            </span>
                            Remember login details
                        </label>
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                        <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                        {!isLoading && <ArrowRight size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
