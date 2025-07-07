import { Navigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import LoginForm from '../components/LoginForm';
import '../styles/auth.scss'; // additional layout styling

const Authpage = () => {
    const cookies = new Cookies()
    const token = cookies.get('CDIIS-OIS')
    
    // Early return, no unnecessary fetch call to Database if user is not logged in
    if (token) {
        alert("You are logged in!")
        return <Navigate to="/app/dashboard" replace />;
    }

    return (
        <>
            <title>CDIIS OIS - Portal</title>
            <LoginForm/>
        </>
    );
};

export default Authpage;
