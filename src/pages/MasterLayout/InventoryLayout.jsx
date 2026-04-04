import { useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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

const cookies = new Cookies();

const InventoryLayout = () => {
    const token = cookies.get('CDIIS-OIS');
    const navigate = useNavigate();

    const decoded = jwtDecode(token);
    const dispatch = useDispatch();

    const prevItemsRef = useRef(null);
    const prevRecordsRef = useRef(null);
    const prevAttendancesRef = useRef(null);

    // Early return if not authenticated
    useEffect(() => {
        if (!token) {
            alert("System clearance required. Please log in.");
            return navigate("/");
        }
    }, [])
    if (!token) return null;

    const { itemsQuery, recordsQuery, attendanceQuery } = useFetchInitialize();

    // Data Synchronization Hooks
    useEffect(() => {
        if (itemsQuery?.data && JSON.stringify(prevItemsRef.current) !== JSON.stringify(itemsQuery.data)) {
            dispatch(setInventory(itemsQuery.data.data));
            prevItemsRef.current = itemsQuery.data;
        }
    }, [itemsQuery, dispatch]);

    useEffect(() => {
        if (recordsQuery?.data && JSON.stringify(prevRecordsRef.current) !== JSON.stringify(recordsQuery.data)) {
            dispatch(setRecords(recordsQuery.data.data));
            prevRecordsRef.current = recordsQuery.data;
        }
    }, [recordsQuery, dispatch]);

    useEffect(() => {
        if (attendanceQuery?.data && JSON.stringify(prevAttendancesRef.current) !== JSON.stringify(attendanceQuery.data)) {
            dispatch(setAttendance(attendanceQuery.data.data));
            prevAttendancesRef.current = attendanceQuery.data;
        }
    }, [attendanceQuery, dispatch]);

    return (
        // The Master Layout Grid
        <div className="flex flex-col sm:flex-row h-[100dvh] bg-slate-50 font-sans overflow-hidden">
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <div className="hidden sm:flex">
                <Sidebar decoded={decoded} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Header />

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Navigation (Hidden on Desktop) */}
            <div className="sm:hidden mt-auto z-50">
                <Navigation decoded={decoded} />
            </div>
        </div>
    );
};

export default InventoryLayout;
