import React, { useState } from 'react';
import '../styles/loginpage.scss';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const validateEmail = (email) => {
        const validDomains = ['@gmail.com', '@yahoo.com', '@outlook.com'];
        return validDomains.some((domain) => email.endsWith(domain));
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return regex.test(password);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value);
        }

        // Clear field error when user starts typing
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

        try {
        // Mock API call - replace with real API when ready
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock validation (replace with real logic)
        if (email === 'admin@gmail.com' && password === 'password123') {
            // alert('Login successful');
            // localStorage.setItem('token', 'mock-token'); // Don't use in production
            window.location.href = '/dashboard';
        } else {
            setError('Invalid email or password');
        }
    } catch (err) {
        console.error(err);
        setError('Server error. Please try again.');
    } finally {
        setLoading(false);
    }
// ================== UNCOMMENT WHEN BACKEND IS READY =========================== //
        // try {
        //     const res = await fetch('http://localhost:5000/api/login', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({ email, password }),
        //     });

        //     const data = await res.json();

        //     if (res.ok) {
        //         alert('Login successful');
        //         localStorage.setItem('token', data.token);
        //         window.location.href = '/dashboard';
        //     } else {
        //         setError(data.message || 'Login failed');
        //     }
        // } catch (err) {
        //     console.error(err);
        //     setError('Server error. Please try again.');
        // } finally {
        //     setLoading(false);
        // }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-heading">CDIIS Login</div>

            <div className="input-group">
                <label className="label" htmlFor="email">Email</label>
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
                {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>

            <div className="input-group">
                <label className="label" htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={fieldErrors.password ? 'error' : ''}
                    disabled={loading}
                    required
                />
                {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
            </div>

            {/* <div className="forgot-password">
                <a href="#">Forgot password?</a>
            </div> */}

            <button className="submit" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
            </button>

            {error && <p className="text-danger">{error}</p>}

            <div className="signup-link">
                Don't have an account? <a href="#">Sign up</a>
            </div>
        </form>
    );
};

export default LoginForm;