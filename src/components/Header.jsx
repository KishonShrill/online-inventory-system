import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';

import '../styles/header.scss'


const Header = () => {
    const cookies = new Cookies()
    const token = cookies.get("CDIIS-OIS")
    const decoded = jwtDecode(token);
    
    const isSidebarOpen = useSelector(state => state.sidebar.isOpen);
    const dispatch = useDispatch();

    return (
        <header className="header">
            <div className="header-container">
                {/* {!isSidebarOpen && (
                    <button onClick={() => handleToggle()} className="header-sidebar-btn">
                        <ChevronRight size={24} />
                    </button>
                )} */}
                <h2 className='header-title' style={{color: 'orange'}}>CDIIS</h2>
            </div>
            <div className="header-container">
                <p className="header-title">Welcome, {decoded.userName}!</p>
            </div>
        </header>
    )
}

export default Header