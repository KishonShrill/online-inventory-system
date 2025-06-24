import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom"
import Cookies from 'universal-cookie';

import Sidebar from "../../components/Navigation";
import Header from "../../components/Header";

import '../../styles/master-layout.scss'


const InventoryLayout = () => {
    const cookies = new Cookies()

    if (!cookies.get('CDIIS-OIS')) {
        alert("You are not logged in!")
        return <Navigate to="/" replace />;
    }
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="inventory">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="content-container">
                <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <main className="main-container">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default InventoryLayout