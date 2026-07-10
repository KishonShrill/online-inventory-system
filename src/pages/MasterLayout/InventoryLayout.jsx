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
    const dispatch = useDispatch();

    // BUG FIX: Prevent jwtDecode from crashing if token is missing
    const decoded = token ? jwtDecode(token) : null;

    const prevItemsRef = useRef(null);
    const prevRecordsRef = useRef(null);
    const prevAttendancesRef = useRef(null);

    // Early return if not authenticated
    useEffect(() => {
        if (!token) {
            alert("System clearance required. Please log in.");
            return navigate("/");
        }
    }, [token, navigate]);

    // Data Synchronization Hooks
    // Note: We only run these if the token exists to prevent unauthorized API calls
    const { itemsQuery, recordsQuery, attendanceQuery } = useFetchInitialize(!!token);

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

    if (!token) return null; // Prevent UI flash while redirecting

    return (
        // Added dark:bg-slate-950 and transition-colors to the Master Grid
        <div className="flex flex-col sm:flex-row h-[100dvh] bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-200">

            {/* Desktop Sidebar (Hidden on Mobile) */}
            <div className="hidden sm:flex z-10 border-r border-slate-200 dark:border-slate-800">
                <Sidebar decoded={decoded} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Header />

                {/* Scrollable Page Content */}
                {/* Added dark mode background to the main scrolling area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Navigation (Hidden on Desktop) */}
            <div className="sm:hidden mt-auto z-50 border-t border-slate-200 dark:border-slate-800">
                <Navigation decoded={decoded} />
            </div>
        </div>
    );
};

export default InventoryLayout;
