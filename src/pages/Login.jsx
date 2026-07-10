import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Building2, LockKeyhole, Mail, Activity, Server, Database, ShieldCheck, ShieldAlert } from "lucide-react";
import { ok, err, ResultAsync } from "neverthrow";
import axios from "axios";
import Cookies from "universal-cookie";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const cookies = new Cookies();

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const token = cookies.get('CDIIS-OIS');

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const loginUserAPI = (credentials) => {
        const postURL = import.meta.env.VITE_DEVELOPMENT === 'true'
            ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/login`
            : `https://cdiis-ois-server.vercel.app/api/login`;

        return ResultAsync.fromPromise(
            axios.post(postURL, {
                email: credentials.email,
                password: credentials.password,
            }),
            (error) => error.response?.data?.message || "Invalid credentials or server unavailable."
        );
    };

    const validateLoginForm = (data) => {
        if (!data.email) return err("Official email is required.");
        if (!data.password) return err("Password is required.");
        return ok(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Reset error state on new attempt

        // 1. Validate Form
        const validationResult = validateLoginForm(formData);
        if (validationResult.isErr()) return setError(validationResult.error);

        // 2. Call API
        const apiResult = await loginUserAPI(validationResult.value);
        if (apiResult.isErr()) return setError(apiResult.error);

        // 3. Success! Set Cookie and redirect
        // Note: Make sure your backend actually returns the token as `res.data.token`
        const receivedToken = apiResult.value.data.token;

        cookies.set("CDIIS-OIS", receivedToken, {
            path: "/",
            // secure: true, // Uncomment this in production when using HTTPS
            // sameSite: 'strict'
        });

        navigate('/app/dashboard');
    };

    useEffect(() => {
        if (token) {
            navigate('/app/dashboard', { replace: true });
        }
    }, [])
    if (token) return null;

    return (
        <div className="w-full min-h-screen flex flex-col lg:flex-row font-sans bg-slate-50">

            {/* Left Panel - The "Mission Control" Branding */}
            <div className="hidden lg:flex w-full lg:w-5/12 bg-slate-950 flex-col justify-between p-12 relative overflow-hidden border-r border-slate-800">

                {/* Awesome Tailwind Trick: Fading Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

                {/* Top: Branding */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/50">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-white tracking-wide">Iligan City</h2>
                        <p className="text-blue-400 text-xs font-semibold tracking-wider uppercase">Digital Infrastructure</p>
                    </div>
                </div>

                {/* Middle: Title & Glassmorphic Stats Grid */}
                <div className="relative z-10 mt-12 lg:mt-0">
                    <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                        CDIIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Inventory</span>
                    </h1>
                    <p className="text-slate-400 text-base max-w-sm mb-10 leading-relaxed">
                        Centralized tracking and lifecycle management for municipal assets.
                    </p>

                    {/* Bento Box Status Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl">
                            <Activity className="text-emerald-400 w-5 h-5 mb-3" />
                            <div className="text-2xl font-bold text-white tracking-tight">24,592</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Active Assets</div>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl">
                            <Server className="text-blue-400 w-5 h-5 mb-3" />
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <div className="text-lg font-bold text-white tracking-tight">99.9%</div>
                            </div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">System Uptime</div>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl col-span-2 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Database className="text-cyan-400 w-4 h-4" />
                                    <span className="text-sm font-bold text-white">Database Sync</span>
                                </div>
                                <div className="text-xs text-slate-500">Last updated: Just now</div>
                            </div>
                            <ShieldCheck className="text-emerald-500 w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Bottom: Footer Info */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>© 2026 CDIIS Framework</span>
                    <span>v2.0.1 Stable</span>
                </div>
            </div>

            {/* Right Panel - The Action Area (Form) */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 md:p-24">
                <div className="w-full max-w-[400px] space-y-8">

                    <div className="flex flex-col items-center lg:hidden mb-8">
                        <div className="bg-blue-600 p-3 rounded-xl mb-3 shadow-lg shadow-blue-600/20">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">CDIIS Portal</h1>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Log In</h2>
                        <p className="text-slate-500 text-sm">
                            Access the official CDIIS inventory management system.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <Input
                                    id="email" name="email" type="email"
                                    placeholder="name@iligan.gov.ph"
                                    value={formData.email} onChange={handleChange}
                                    className="text-black pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-600" required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-700">Password</Label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <LockKeyhole className="w-4 h-4" />
                                </div>
                                <Input
                                    id="password" name="password" type="password"
                                    placeholder="••••••••"
                                    value={formData.password} onChange={handleChange}
                                    className="text-black pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-600" required
                                />
                            </div>
                            <div className="flex mt-8 items-center justify-between">
                                <div className="flex space-x-2">
                                    <Checkbox id="remember" className="border-slate-300 text-blue-600 data-[state=checked]:bg-blue-600" />
                                    <label htmlFor="remember" className="text-sm font-medium leading-none text-slate-600">
                                        Remember this device
                                    </label>
                                </div>
                                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>


                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 h-11 text-base font-semibold mt-2 transition-all">
                            Authenticate
                        </Button>
                    </form>

                    {error && (
                        <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="text-center text-sm text-slate-500 pt-6">
                        Don't have an account?{" "}
                        <Link to="/signup" className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                            Request Access
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Login;
