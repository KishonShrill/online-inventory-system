import { useState } from "react";
import Cookies from "universal-cookie";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { validateEmail, validatePassword } from '../helpers/validate.js';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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
        if (name === 'email') setEmail(value);
        else if (name === 'password') setPassword(value);

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!email.trim()) errors.email = 'Email is required';
        else if (!validateEmail(email)) errors.email = 'Email must be a valid email';

        if (!password) errors.password = 'Password is required';
        else if (!validatePassword(password).isFullyValid)
            errors.password = 'Password must be 8+ chars and contain letters/numbers/special chars';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        const postURL = import.meta.env.VITE_DEVELOPMENT === 'true'
            ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/login`
            : `https://cdiis-ois-server.vercel.app/api/login`;

        try {
            const result = await axios.post(postURL, { email, password });
            cookies.set("CDIIS-OIS", result.data.token, { path: "/" });
            navigate('/app/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modern-login-page dark:bg-slate-950">
            {/* Branding Section - Keep your custom CSS here */}
            <div className="brand-section">
                <div className="brand-overlay"></div>
                <div className="brand-content">
                    <div className="brand-header">
                        <h1 className="brand-title">CDIIS</h1>
                        <p className="brand-subtitle">Center for Digital Iligan, Innovation & Sustainability</p>
                    </div>
                </div>
                <div className="animated-bg">
                    <div className="bg-circle bg-circle-1"></div>
                    <div className="bg-circle bg-circle-2"></div>
                    <div className="bg-circle bg-circle-3"></div>
                </div>
            </div>

            {/* Login Form Section */}
            <div className="form-section dark:bg-slate-900 transition-colors">
                <div className="form-container">
                    <div className="login-card">
                        <div className="login-header">
                            <h2 className="dark:text-white">Welcome back</h2>
                            <p className="dark:text-slate-400">Please sign in to your account</p>
                        </div>

                        <form className="login-form space-y-4" onSubmit={handleSubmit}>
                            {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="dark:text-slate-300">Email address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="email" name="email" type="email"
                                        placeholder="name@iligan.gov.ph"
                                        value={email} onChange={handleInputChange}
                                        className={`pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.email ? 'border-red-500' : ''}`}
                                        disabled={loading}
                                    />
                                </div>
                                {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="dark:text-slate-300">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="password" name="password" type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password} onChange={handleInputChange}
                                        className={`pl-10 pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${fieldErrors.password ? 'border-red-500' : ''}`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="remember" />
                                    <Label htmlFor="remember" className="text-sm dark:text-slate-400">Remember me</Label>
                                </div>
                                <button type="button" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</button>
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
