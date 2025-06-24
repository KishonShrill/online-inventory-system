import React from 'react';
import LoginForm from '../components/LoginForm';
import '../styles/auth.scss'; // additional layout styling

const Authpage = () => {
    return (
        <>
            <title>CDIIS OIS - Portal</title>
            <LoginForm/>
        </>
    );
};

export default Authpage;
