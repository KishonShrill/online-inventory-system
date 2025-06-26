import { useEffect, useRef } from "react";
import { Outlet, Navigate } from "react-router-dom"
import Cookies from 'universal-cookie';
import { useDispatch } from 'react-redux';
import { setInventory } from '../../redux/actions/inventoryActions';

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import useFetchItems from "../../hooks/useFetchItems";


import '../../styles/master-layout.scss'


const InventoryLayout = () => {

    const cookies = new Cookies()
    const token = cookies.get('CDIIS-OIS')
    
    // Early return, no unnecessary fetch call to Database if user is not logged in
    if (!token) {
        alert("You are not logged in!")
        return <Navigate to="/" replace />;
    }
    
    const dispatch = useDispatch();
    const prevDataRef = useRef(null); // store previous data to compare
    const { data } = useFetchItems();

    useEffect(() => {
        if (
            data?.data && 
            JSON.stringify(prevDataRef.current) !== JSON.stringify(data.data)
        ) {
            console.log("🔁 Inventory updated");
            // console.log(JSON.stringify(data?.data))
            dispatch(setInventory(data.data));
            prevDataRef.current = data.data;
        }
    }, [data, dispatch]);

    return (
        <div className="inventory">
            <Sidebar />
            <div className="content-container">
                <Header />
                <main className="main-container">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default InventoryLayout