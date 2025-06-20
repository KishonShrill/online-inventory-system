// src/pages/LoginPage.jsx
import React from 'react';
import LoginForm from '../components/LoginForm';
import '../styles/loginpage.scss'; // additional layout styling

const LoginPage = () => {
    return (
        <div className="login-page">
            <LoginForm/>
        </div>
    );
};

export default LoginPage;
