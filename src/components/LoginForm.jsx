import React, { useState } from 'react';
import Cookies from "universal-cookie";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {validateEmail, validatePassword} from '../helpers/validate.js';

const cookies = new Cookies();


const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value);
        }
        
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            errors.email = 'Email must be a valid email';
        }
        if (!password) {
            errors.password = 'Password is required';
        } else if (!validatePassword(password)) {
            errors.password = 'Password must contain 12 characters long and contain letters and numbers';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        setLoading(true);
        setError('');

        const postURL = import.meta.env.VITE_DEVELOPMENT === 'true'
            ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/login`
            : `https://cdiis-ois-server.vercel.app/api/login`;

        const configuration = {
            method: "post",
            url: postURL,
            data: {
                email,
                password,
            },
        };

        axios(configuration)
            .then((result) => {
                setLoading(false);
                // emailRef.current.style.borderColor = "green";
                // passwordRef.current.style.borderColor = "green";
                // logRef.current.style.color = "green";
                // console.log(result.data.token)
                cookies.set("CDIIS-OIS", result.data.token, {
                    path: "/",
                });
                navigate('/app/dashboard')
            })
            .catch((error) => {
                console.error(error);
                setError(error.response.data.message)
                setLoading(false);
            });
    };

    return (
        <div className="modern-login-page">
            {/* Left Side - Branding */}
            <div className="brand-section">
                <div className="brand-overlay"></div>
                <div className="brand-content">
                    <div className="brand-header">
                        <h1 className="brand-title">CDIIS</h1>
                        <p className="brand-subtitle">Center for Digital Iligan, Innovation & Sustainability </p>
                    </div>
                    <div className="brand-welcome">
                        <p>Access your dashboard and manage your items with our powerful inventory platform.</p>
                    </div>
                </div>
                <div className="animated-bg">
                    <div className="bg-circle bg-circle-1"></div>
                    <div className="bg-circle bg-circle-2"></div>
                    <div className="bg-circle bg-circle-3"></div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="form-section">
                <div className="form-container">
                    <div className="mobile-brand">
                        <h1>CDIIS</h1>
                    </div>

                    <div className="login-card">
                        <div className="login-header">
                            <h2>Welcome back</h2>
                            <p>Please sign in to your account</p>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
                            {error && (
                                <div className="error-alert">
                                    {error}
                                </div>
                            )}

                            <div className="input-group">
                                <label htmlFor="email">Email address</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        className={fieldErrors.email ? 'error' : ''}
                                        disabled={loading}
                                        required
                                    />
                                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                {fieldErrors.email && (
                                    <p className="field-error">{fieldErrors.email}</p>
                                )}
                            </div>

                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        className={fieldErrors.password ? 'error' : ''}
                                        disabled={loading}
                                        required
                                    />
                                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <p className="field-error">{fieldErrors.password}</p>
                                )}
                            </div>

                            <div className="form-options">
                                <div className="remember-me">
                                    <input id="remember-me" name="remember-me" type="checkbox" />
                                    <label htmlFor="remember-me">Remember me</label>
                                </div>
                                <button className="forgot-password">Forgot password?</button>
                            </div>

                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="submit-btn"
                            >
                                {loading ? (
                                    <div className="loading-content">
                                        <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </button>

                            <div className="signup-link">
                                <p>
                                    Don't have an account?{' '}
                                    <a href="/signup" className="signup-btn">Sign up</a>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="login-footer">
                        <p>&copy; 2025 CDIIS. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default LoginForm;