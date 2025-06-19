import { ChevronRight } from "lucide-react"

import '../styles/header.scss'

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
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
                 <p className="header-title">Welcome, Admin!</p>
            </div>
        </header>
    )
}

export default Header