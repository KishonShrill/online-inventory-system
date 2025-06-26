import {useState} from "react";
import axios from "axios";
import { Navigate, useNavigate } from 'react-router-dom';
import Cookies from "universal-cookie";
import viewIcon from '../assets/view-on.svg';
import viewOffIcon from '../assets/view-off.svg';
import { validateEmail, validatePassword } from "../helpers/validate";
import '../styles/signup.scss';


const Signup = () => {
    const cookies = new Cookies()
    const token = cookies.get('CDIIS-OIS')
    
    // Early return, no unnecessary fetch call to Database if user is not logged in
    if (token) {
        alert("You are logged in!")
        return <Navigate to="/app/dashboard" replace />;
    }

    const [formData, setFormData] = useState ({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretCode: '',
    });

    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value});
    };

    const isProperName = (name) => {
        // 
        return /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(name.trim());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!isProperName(formData.name)) return setError("Name must be properly capitalized (e.g., 'John Doe')");
        if (!validateEmail(formData.email)) return setError("Please use a valid email...")
        if (!validatePassword(formData.password).isFullyValid) return setError("Password should be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.") 

        if (formData.password !== formData.confirmPassword){
            return setError('Passwords do not match');
        }

        const postURL = import.meta.env.VITE_DEVELOPMENT === 'true'
            ? `http://localhost:5000/api/register`
            : `https://cdiis-ois-server.vercel.app/api/register`;

        const confirguation = {
            method: 'post',
            url: postURL,
            data: {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                secret_code: formData.secretCode,
            }
        }

        axios(confirguation)
            .then((res) => {
                console.log(res)
                alert(res.data.message);
                navigate('/');
            })
            .catch((err) => {
                console.log(err)
                setError(err.response.data.message);
            });
    };
    
    return(
        <div className="signup-page">
            <div className="signup-left">
                <div className="signup-branding">
                    <h1>CDIIS Inventory</h1>
                    <p>Create your account and start tracking your items</p>
                    <div className="features-list">
                        <div className="feature-item">
                            <span className="feature-icon">✓</span>
                            <span>Secure & Protected</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">✓</span>
                            <span>Easy Setup</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">✓</span>
                            <span>24/7 Support</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="signup-right">
                <div className="signup-form-container">
                    <form className="signup-form" onSubmit={handleSubmit}>
                        <div className="form-header">
                            <h2>Create Account</h2>
                            <p>Fill in your details to get started</p>
                        </div>
                    
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input 
                                id="name"
                                type="text" 
                                name="name" 
                                placeholder="Enter your full name" 
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input 
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-field">
                                <input 
                                    id="password"
                                    type={showPassword ? 'text' : 'password'} 
                                    name="password" 
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button className="view-button" type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                                    <img src={showPassword ? viewOffIcon : viewIcon} alt={showPassword ? "Hide password" : "Show password"} width={20} height={20} />
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-field">
                                <input 
                                    id="confirmPassword"
                                    type={showConfirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button className="view-button" type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    tabIndex={-1}>
                                    <img src={showConfirm ? viewOffIcon : viewIcon} alt={showConfirm ? "Hide password" : "Show password"} width={20} height={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="secretCode">Secret Code</label>
                            <input 
                                id="secretCode"
                                type="password" 
                                name="secretCode"
                                placeholder="Enter your secret code"
                                value={formData.secretCode}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="submit-button">
                            Create Account
                        </button>

                        <div className="form-footer">
                            <p>Already have an account? <a href="/">Log in</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;