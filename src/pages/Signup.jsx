import { useEffect, useState } from "react";
import { ok, err, ResultAsync } from "neverthrow";
import { Navigate, useNavigate } from 'react-router-dom';
import axios from "axios";
import viewIcon from '../assets/view-on.svg';
import viewOffIcon from '../assets/view-off.svg';
import { validateEmail, validatePassword } from "../helpers/validate";
import Cookies from "universal-cookie";

const cookies = new Cookies()


// 1. Extract API logic outside the component to prevent recreation on every render
const registerUserAPI = (userData) => {
    const postURL = import.meta.env.VITE_DEVELOPMENT === 'true'
        ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/register`
        : `https://cdiis-ois-server.vercel.app/api/register`;

    // Wrap the axios promise in ResultAsync to catch network/server errors
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

// 2. Extract validation logic to keep the component clean
const validateForm = (data) => {
    const nameRegex = /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/;

    if (!nameRegex.test(data.name.trim())) {
        return err("Name must be properly capitalized (e.g., 'John Doe').");
    }
    if (!validateEmail(data.email)) {
        return err("Please use a valid email address.");
    }
    if (!validatePassword(data.password).isFullyValid) {
        return err("Password should be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
    }
    if (data.password !== data.confirmPassword) {
        return err("Passwords do not match.");
    }
    if (!data.secretCode) {
        return err("Secret code is required.");
    }

    return ok(data); // All good, pass the data forward
};

const Signup = () => {
    const token = cookies.get('CDIIS-OIS');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretCode: '',
    });

    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (token) {
            alert("You are logged in!")
            return navigate("/app/dashboard");
        }
    }, [])

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Reset errors on new submission

        // Step 1: Synchronous Validation using neverthrow
        const validationResult = validateForm(formData);

        if (validationResult.isErr()) {
            return setError(validationResult.error);
        }

        // Step 2: Asynchronous API Call using neverthrow
        const apiResult = await registerUserAPI(validationResult.value);

        if (apiResult.isErr()) {
            return setError(apiResult.error);
        }

        // Step 3: Success Path
        // v2 Suggestion: Swap this alert for a modern toast library (like react-hot-toast or sonner)
        alert(apiResult.value.data.message);
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-indigo-500 to-purple-700 font-sans">
            {/* Left Side - Branding */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-black/20 shadow-inner">
                <div className="text-center text-white max-w-lg">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                        CDIIS Inventory
                    </h1>
                    <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
                        Create your account and start tracking your items seamlessly.
                    </p>
                    <div className="flex flex-col gap-4 items-center md:items-start text-left mx-auto md:mx-0 w-fit">
                        {['Secure & Protected', 'Easy Setup', '24/7 Support'].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-lg font-medium">
                                <span className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm backdrop-blur-sm">
                                    ✓
                                </span>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-white">
                <div className="w-full max-w-md">
                    <form className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full border border-gray-100" onSubmit={handleSubmit}>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                            <p className="text-gray-500">Fill in your details to get started</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 border-l-4 border-red-500 text-sm font-medium" role="alert">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="name" className="block mb-1.5 text-gray-700 font-semibold text-sm">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block mb-1.5 text-gray-700 font-semibold text-sm">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block mb-1.5 text-gray-700 font-semibold text-sm">Password</label>
                                <div className="relative flex items-center">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full p-3 pr-12 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder-gray-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        tabIndex={-1}
                                        className="absolute right-2 p-2 rounded-md hover:bg-gray-200/50 transition-colors"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <img src={showPassword ? viewOffIcon : viewIcon} alt="" className="w-5 h-5 opacity-60" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block mb-1.5 text-gray-700 font-semibold text-sm">Confirm Password</label>
                                <div className="relative flex items-center">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirm ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full p-3 pr-12 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder-gray-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(prev => !prev)}
                                        tabIndex={-1}
                                        className="absolute right-2 p-2 rounded-md hover:bg-gray-200/50 transition-colors"
                                        aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                                    >
                                        <img src={showConfirm ? viewOffIcon : viewIcon} alt="" className="w-5 h-5 opacity-60" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="secretCode" className="block mb-1.5 text-gray-700 font-semibold text-sm">Secret Code</label>
                                <input
                                    id="secretCode"
                                    type="password"
                                    name="secretCode"
                                    placeholder="Enter your secret code"
                                    value={formData.secretCode}
                                    onChange={handleChange}
                                    className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder-gray-400"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3.5 rounded-lg text-lg font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 mt-8 mb-6"
                        >
                            Create Account
                        </button>

                        <div className="text-center">
                            <p className="text-gray-600 text-sm font-medium">
                                Already have an account?{' '}
                                <Link to="/" className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
