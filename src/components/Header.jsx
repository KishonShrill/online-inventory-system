import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';
import { ChevronRight } from "lucide-react"

import '../styles/header.scss'


const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const cookies = new Cookies()
    const token = cookies.get("CDIIS-OIS")
    const decoded = jwtDecode(token);

    console.log(decoded)
    
    return (
        <header className="header">
             <div className="header-container">
                 {!isSidebarOpen && (
                     <button onClick={() => setIsSidebarOpen(true)} className="header-sidebar-btn">
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