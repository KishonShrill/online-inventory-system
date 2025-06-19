import { useState } from "react";
import { Link, Outlet } from "react-router-dom"

import Sidebar from "../../components/Navigation";
import Header from "../../components/Header";

import '../../styles/master-layout.scss'

const InventoryLayout = () => {
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