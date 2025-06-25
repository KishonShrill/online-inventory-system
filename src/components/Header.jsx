import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';
import { ChevronRight } from "lucide-react"
import { useSelector, useDispatch } from "react-redux";
import { openSidebar, closeSidebar } from "../redux/actions/sidebarActions";

import '../styles/header.scss'

const cookies = new Cookies()
const token = cookies.get("CDIIS-OIS")
const decoded = jwtDecode(token);

const Header = () => {
    const isSidebarOpen = useSelector(state => state.sidebar.isOpen);
    const dispatch = useDispatch();

    const handleToggle = () => {
        if (isSidebarOpen) {
            dispatch(closeSidebar());
        } else {
            dispatch(openSidebar());
        }
    };

    // console.log(decoded)
    
    return (
        <header className="header">
             <div className="header-container">
                 {!isSidebarOpen && (
                     <button onClick={() => handleToggle()} className="header-sidebar-btn">
                         <ChevronRight size={24} />
                     </button>
                 )}
            </div>
            <div className="header-container">
                 <p className="header-title">Welcome, {decoded.userName}!</p>
            </div>
        </header>
    )
}

export default Header