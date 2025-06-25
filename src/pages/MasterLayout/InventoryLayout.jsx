import { useEffect, useRef } from "react";
import { Outlet, Navigate } from "react-router-dom"
import Cookies from 'universal-cookie';
import { useDispatch } from 'react-redux';
import { addInventory, removeInventory, setInventory } from '../../redux/actions/inventoryActions';

import Sidebar from "../../components/Navigation";
import Header from "../../components/Header";
import useFetchItems from "../../hooks/useFetchItems";


import '../../styles/master-layout.scss'


const InventoryLayout = () => {

    const dispatch = useDispatch();
    const cookies = new Cookies()
    const prevDataRef = useRef(null); // store previous data to compare

    if (!cookies.get('CDIIS-OIS')) {
        alert("You are not logged in!")
        return <Navigate to="/" replace />;
    }

    const { isLoading, data, isError, error, isFetching } = useFetchItems();

    useEffect(() => {
        if (data?.data && JSON.stringify(prevDataRef.current) !== JSON.stringify(data.data)) {
            console.log("🔁 Inventory updated");
            console.log(JSON.stringify(data?.data))
            dispatch(setInventory(data.data));
            prevDataRef.current = data.data;
        }
    }, [data]);

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