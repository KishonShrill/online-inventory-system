import {useState} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import viewIcon from '../assets/view-on.svg';
import viewOffIcon from '../assets/view-off.svg';
import '../styles/signup.scss';


const Signup = () => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword){
            return setError('Passwords do not match');
        }
            // const res = await axios.post(postURL, {
            //     name: formData.name,
            //     email: formData.email,
            //     password: formData.password,
            //     secret_code: formData.secretCode,
            // });


        const postURL = import.meta.env.VITE_DEVELOPMENT === 'true'
            ? `http://localhost:5000/api/register`
            : `https://cdiis-ois-server.vercel.app/api/register`;

        const configuration = {
            method: "post",
            url: postURL,
            data: {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                secret_code: formData.secretCode,
            },
        };

        axios(configuration)
            .then((result) => {
                console.log(result.data)
                
                alert('Signup successful');
                navigate('/');
            })
            .catch((error) => {
                console.log(error)
                setError(error.response.data.message);
            })
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