import { useEffect, useRef } from "react";
import { Outlet, Navigate } from "react-router-dom"
import { useDispatch } from 'react-redux';
import Cookies from 'universal-cookie';

import { setInventory } from '../../redux/actions/inventoryActions';
import { setRecords } from "../../redux/actions/recordActions";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
// import useFetchItems from "../../hooks/useFetchItems";
import useFetchInventoryAndRecords from "../../hooks/useFetchInventoryAndRecords";


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
    const prevItemsRef = useRef(null); // store previous data to compare
    const prevRecordsRef = useRef(null); // store previous data to compare
    // const { data } = useFetchItems();
    const { itemsQuery, recordsQuery } = useFetchInventoryAndRecords();


    useEffect(() => {
        if (
            itemsQuery?.data && 
            JSON.stringify(prevItemsRef.current) !== JSON.stringify(itemsQuery.data)
        ) {
            console.log("🔁 Inventory updated");
            // console.log(JSON.stringify(itemsQuery?.data.data))
            dispatch(setInventory(itemsQuery.data.data));
            prevItemsRef.current = itemsQuery.data;
        }
    }, [itemsQuery, dispatch]);

    useEffect(() => {
        if (
            recordsQuery?.data &&
            JSON.stringify(prevRecordsRef.current) !== JSON.stringify(recordsQuery.data)
        ) {
            console.log("🔁 Records updated")
            // console.log(JSON.stringify(recordsQuery?.data.data))
            dispatch(setRecords(recordsQuery.data.data));
            prevRecordsRef.current = recordsQuery.data;
        }
    }, [recordsQuery, dispatch]);

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

export default InventoryLayout;