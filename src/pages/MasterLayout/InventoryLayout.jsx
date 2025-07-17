
import { useEffect, useRef } from "react";
import { Outlet, Navigate } from "react-router-dom"
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';

import { setInventory } from '../../redux/actions/inventoryActions';
import { setRecords } from "../../redux/actions/recordActions";
import { setAttendance } from "../../redux/actions/attendanceActions";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Navigation from "../../components/Navigation";
import useFetchInitialize from "../../hooks/useFetchInitialize";


import '../../styles/master-layout.scss'

const cookies = new Cookies()
const token = cookies.get('CDIIS-OIS')

const InventoryLayout = () => {
    
    
    // Early return, no unnecessary fetch call to Database if user is not logged in
    if (!token) {
        alert("You are not logged in!")
        return <Navigate to="/" replace />;
    }
    
    const decoded = jwtDecode(token);
    const dispatch = useDispatch();
    const prevItemsRef = useRef(null); // store previous data to compare
    const prevRecordsRef = useRef(null); // store previous data to compare
    const prevAttendancesRef = useRef(null); // store previous data to compare
    const { itemsQuery, recordsQuery, attendanceQuery } = useFetchInitialize();


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

    useEffect(() => {
        if (
            attendanceQuery?.data &&
            JSON.stringify(prevAttendancesRef.current) !== JSON.stringify(attendanceQuery.data)
        ) {
            console.log("🔁 Attendances updated")
            // console.log(JSON.stringify(attendanceQuery?.data.data))
            dispatch(setAttendance(attendanceQuery.data.data));
            prevAttendancesRef.current = attendanceQuery.data;
        }
    }, [attendanceQuery, dispatch]);
    

    return (
        <div className="inventory">
            <Sidebar decoded={decoded} />
            <div className="content-container">
                <Header />
                <main className="main-container">
                    <Outlet />
                </main>
            </div>
            <Navigation decoded={decoded} />
        </div>
    )
}

export default InventoryLayout;
