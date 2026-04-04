import { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate, Link } from 'react-router-dom';
import Cookies from "universal-cookie";
import { ok, err, ResultAsync } from "neverthrow";
import { Building2, LockKeyhole, Mail, User, ShieldAlert, Fingerprint, Key, Network, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { validateEmail, validatePassword } from "../helpers/validate";

// --- API & Validation Logic ---
const registerUserAPI = (userData) => {
    const postURL = import.meta.env.VITE_DEVELOPMENT === 'true'
        ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/register`
        : `https://cdiis-ois-server.vercel.app/api/register`;

    return ResultAsync.fromPromise(
        axios.post(postURL, {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            secret_code: userData.secretCode,
        }),
        (error) => error.response?.data?.message || "An unexpected error occurred during registration."
    );
};

const validateForm = (data) => {
    const nameRegex = /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/;

    if (!nameRegex.test(data.name.trim())) return err("Name must be properly capitalized (e.g., 'Juan Dela Cruz').");
    if (!validateEmail(data.email)) return err("Please use a valid official email address.");
    if (!validatePassword(data.password).isFullyValid) return err("Password must be 8+ chars with uppercase, lowercase, number, and special character.");
    if (data.password !== data.confirmPassword) return err("Passwords do not match.");
    if (!data.secretCode) return err("System authorization code is required.");

    return ok(data);
};

// --- Component ---
const Signup = () => {
    const cookies = new Cookies();
    const token = cookies.get('CDIIS-OIS');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', secretCode: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    if (token) return <Navigate to="/app/dashboard" replace />;

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validationResult = validateForm(formData);
        if (validationResult.isErr()) return setError(validationResult.error);

        const apiResult = await registerUserAPI(validationResult.value);
        if (apiResult.isErr()) return setError(apiResult.error);

        alert(apiResult.value.data.message);
        navigate('/');
    };

    return (
        <div className="w-full min-h-screen flex flex-col lg:flex-row font-sans bg-white">

            {/* Left Panel - The "Clearance" Branding */}
            <div className="hidden lg:flex w-full lg:w-5/12 bg-slate-950 flex-col justify-between p-12 relative overflow-hidden border-r border-slate-800">

                {/* Fading Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/50">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-white tracking-wide">Iligan City</h2>
                        <p className="text-blue-400 text-xs font-semibold tracking-wider uppercase">Digital Infrastructure</p>
                    </div>
                </div>

                <div className="relative z-10 mt-12 lg:mt-0">
                    <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                        System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Clearance</span>
                    </h1>
                    <p className="text-slate-400 text-base max-w-sm mb-10 leading-relaxed">
                        Request authorized access to the CDIIS inventory network. All requests are logged and monitored.
                    </p>

                    {/* Onboarding Bento Box Status Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl">
                            <Fingerprint className="text-blue-400 w-5 h-5 mb-3" />
                            <div className="text-lg font-bold text-white tracking-tight">Identity</div>
                            <div className="text-xs text-amber-500 font-medium uppercase tracking-wider mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Verification Required
                            </div>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl">
                            <Key className="text-emerald-400 w-5 h-5 mb-3" />
                            <div className="text-lg font-bold text-white tracking-tight">Access Level</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
                                Pending Approval
                            </div>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl col-span-2 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Network className="text-cyan-400 w-4 h-4" />
                                    <span className="text-sm font-bold text-white">Encrypted Network</span>
                                </div>
                                <div className="text-xs text-slate-500">Connection secured via TLS 1.3</div>
                            </div>
                            <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                ACTIVE
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>© 2026 CDIIS Framework</span>
                    <span>Strictly Confidential</span>
                </div>
            </div>

            {/* Right Panel - The Action Area (Form) */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 bg-slate-50 overflow-y-auto">
                <div className="w-full max-w-[420px] space-y-8 py-8">

                    <div className="flex flex-col items-center lg:hidden mb-4">
                        <div className="bg-blue-600 p-3 rounded-xl mb-3 shadow-lg shadow-blue-600/20">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">CDIIS Portal</h1>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Request Access</h2>
                        <p className="text-slate-500 text-sm">
                            Submit your credentials to create an authorized workspace.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <Input
                                    id="name" name="name" type="text"
                                    placeholder="Juan Dela Cruz"
                                    value={formData.name} onChange={handleChange}
                                    className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-600" required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700">Official Email</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <Input
                                    id="email" name="email" type="email"
                                    placeholder="name@iligan.gov.ph"
                                    value={formData.email} onChange={handleChange}
                                    className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-600" required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700">Password</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                        <LockKeyhole className="w-4 h-4" />
                                    </div>
                                    <Input
                                        id="password" name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password} onChange={handleChange}
                                        className="pl-10 pr-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-600" required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-slate-700">Confirm</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                        <LockKeyhole className="w-4 h-4" />
                                    </div>
                                    <Input
                                        id="confirmPassword" name="confirmPassword"
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword} onChange={handleChange}
                                        className="pl-10 pr-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-600" required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label htmlFor="secretCode" className="text-slate-700">Authorization Code</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <ShieldAlert className="w-4 h-4" />
                                </div>
                                <Input
                                    id="secretCode" name="secretCode" type="password"
                                    placeholder="Enter system admin code"
                                    value={formData.secretCode} onChange={handleChange}
                                    className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-600" required
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5">
                                Required to link your profile to the secure local network.
                            </p>
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 h-11 text-base font-semibold mt-4 transition-all">
                            Submit Access Request
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-500 pt-2">
                        Already have clearance?{" "}
                        <Link to="/" className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                            Sign In securely
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
