import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResultAsync } from 'neverthrow';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { Shield, ShieldAlert, User, Loader2, Mail, Search, Trash2, Users as UsersIcon, AlertTriangle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

import Pagination from '../components/Pagination';

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const cookies = new Cookies();
const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const LOCALHOST = import.meta.env.VITE_LOCALHOST;

const baseURL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/users`
    : `https://cdiis-ois-server.vercel.app/api/users`;

// CDIIS Clearance Hierarchy
const ROLE_WEIGHTS = {
    employee: 1,
    manager: 5,
    admin: 10
};

export default function Users() {
    const navigate = useNavigate();
    const token = cookies.get("CDIIS-OIS");
    const currentUser = token ? jwtDecode(token) : { userRole: 'guest', userId: '' };

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- Modal State ---
    const [roleModal, setRoleModal] = useState({ isOpen: false, user: null, newRole: '' });

    useEffect(() => {
        if (!token) return navigate("/");
        fetchUsers();
    }, [token, navigate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const fetchUsers = async () => {
        setIsLoading(true);
        const apiResult = await ResultAsync.fromPromise(
            axios.get(baseURL, { headers: { Authorization: `Bearer ${token}` } }),
            (err) => err.response?.data?.message || "Failed to retrieve user registry."
        );

        if (apiResult.isOk()) {
            setUsers(apiResult.value.data.users || apiResult.value.data);
        } else {
            setError(apiResult.error);
        }
        setIsLoading(false);
    };

    // Triggered by the confirmation modal
    const executeRoleUpdate = async () => {
        const { user, newRole } = roleModal;
        setIsProcessing(true);

        const apiResult = await ResultAsync.fromPromise(
            axios.put(`${baseURL}/${user._id}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            (err) => err.response?.data?.message || "Failed to update clearance level."
        );

        if (apiResult.isOk()) {
            setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
            setRoleModal({ isOpen: false, user: null, newRole: '' });
        } else {
            alert(apiResult.error); // Replace with Toast later
        }
        setIsProcessing(false);
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`WARNING: Permanently revoke system access for ${username}? This cannot be undone.`)) return;

        setIsProcessing(true);
        const apiResult = await ResultAsync.fromPromise(
            axios.delete(`${baseURL}/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            (err) => err.response?.data?.message || "Failed to delete user."
        );

        if (apiResult.isOk()) {
            setUsers(prev => prev.filter(u => u._id !== userId));
        } else {
            alert(apiResult.error);
        }
        setIsProcessing(false);
    };

    // --- RBAC HELPER LOGIC ---
    const canManageUser = (targetRole, targetId) => {
        if (targetId === currentUser.userId) return false; // Never manage yourself here
        // Admins can manage anyone (including other admins)
        if (currentUser.userRole === 'admin') return true;
        // Managers can only manage people strictly below them
        return ROLE_WEIGHTS[currentUser.userRole] > ROLE_WEIGHTS[targetRole];
    };

    const getAssignableRoles = () => {
        // Admins can assign any role. Everyone else can only assign roles strictly below theirs.
        if (currentUser.userRole === 'admin') return Object.keys(ROLE_WEIGHTS);
        return Object.keys(ROLE_WEIGHTS).filter(
            (role) => ROLE_WEIGHTS[role] < ROLE_WEIGHTS[currentUser.userRole]
        );
    };

    const assignableRoles = getAssignableRoles();

    const filteredUsers = useMemo(() => {
        return users
            .filter(user =>
                user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => {
                if (a._id === currentUser.userId) return -1;
                if (b._id === currentUser.userId) return 1;
                return 0;
            });
    }, [users, searchQuery, currentUser.userId]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    return (
        <div className="container mx-auto min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-transparent p-6 md:p-10 font-sans transition-colors duration-200">
            <title>CDIIS OIS - System Personnel</title>

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl max-md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">System Personnel</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 max-md:text-sm">Manage clearance levels and platform access.</p>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors duration-200">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 bg-white dark:bg-slate-900 rounded-t-xl transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <Input
                                type="text"
                                placeholder="Search by name or email..."
                                className="pl-10 h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-600 w-full placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-auto flex justify-end max-md:justify-center">
                            <Pagination setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={totalPages} quantity={filteredUsers.length} />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {error && (
                        <div className="m-4 p-4 text-sm text-red-700 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                            {error}
                        </div>
                    )}

                    {paginatedUsers.length === 0 && !error ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                            <UsersIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No personnel found</h3>
                        </div>
                    ) : (
                        <div className="overflow-x-auto px-4 pb-4">
                            <Table>
                                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 transition-colors">
                                    <TableRow className="dark:border-slate-700">
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Identity</TableHead>
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300 w-[200px]">Clearance Level</TableHead>
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right w-[80px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedUsers.map((user) => {
                                        const isManageable = canManageUser(user.role, user._id);
                                        const isSelf = user._id === currentUser.userId;

                                        return (
                                            <TableRow key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 dark:border-slate-800 transition-colors">
                                                <TableCell className="align-middle py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center flex-shrink-0">
                                                            {user.role === 'admin' ? <ShieldAlert className="text-blue-600 dark:text-blue-400 h-5 w-5" /> :
                                                                user.role === 'manager' ? <Shield className="text-blue-500 dark:text-blue-400 h-5 w-5" /> :
                                                                    <User className="text-slate-500 dark:text-slate-400 h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 capitalize flex items-center gap-2">
                                                                {user.name.toLowerCase()}
                                                                {isSelf && <span className="text-[10px] uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-sm">You</span>}
                                                            </h3>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                                <Mail className="h-3 w-3" />
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="align-middle">
                                                    {/* Changed from direct API call to opening the modal */}
                                                    <Select
                                                        disabled={!isManageable || isProcessing}
                                                        value={user.role}
                                                        onValueChange={(newRole) => setRoleModal({ isOpen: true, user, newRole })}
                                                    >
                                                        <SelectTrigger className={`w-full capitalize transition-colors ${!isManageable ? 'bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-80' : 'bg-white dark:bg-slate-950 hover:border-blue-400 focus:ring-blue-500 dark:border-slate-700'}`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className='bg-white dark:bg-slate-900 dark:border-slate-800'>
                                                            <SelectItem value={user.role} className="capitalize font-medium dark:text-slate-200 dark:focus:bg-slate-800">
                                                                {user.role}
                                                            </SelectItem>
                                                            {isManageable && assignableRoles.map((role) => (
                                                                role !== user.role && (
                                                                    <SelectItem key={role} value={role} className="capitalize cursor-pointer dark:text-slate-200 dark:focus:bg-slate-800">
                                                                        {role}
                                                                    </SelectItem>
                                                                )
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>

                                                <TableCell className="align-middle text-right pr-4">
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                                        disabled={!isManageable || isProcessing}
                                                        onClick={() => handleDeleteUser(user._id, user.name)}
                                                        title={isManageable ? "Revoke Access" : "Insufficient Clearance"}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Clearance Confirmation Modal */}
            <Dialog open={roleModal.isOpen} onOpenChange={(open) => !open && !isProcessing && setRoleModal({ isOpen: false, user: null, newRole: '' })}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="dark:text-slate-100 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                            Confirm Clearance Update
                        </DialogTitle>
                        <DialogDescription className="dark:text-slate-400">
                            You are modifying the system clearance level for <span className="font-semibold text-slate-900 dark:text-slate-200">{roleModal.user?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">{roleModal.user?.role}</span>
                            <span className="text-slate-400">➔</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 capitalize">{roleModal.newRole}</span>
                        </div>

                        {/* Explicit Warnings for Admin level changes */}
                        {roleModal.newRole === 'admin' && (
                            <div className="p-3 text-sm text-red-700 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg flex gap-2">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p><strong>Warning:</strong> You are granting Admin privileges. This user will have full, unrestricted access to the system, including the ability to manage other admins.</p>
                            </div>
                        )}

                        {roleModal.user?.role === 'admin' && roleModal.newRole !== 'admin' && (
                            <div className="p-3 text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex gap-2">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p><strong>Warning:</strong> You are demoting an Admin. They will immediately lose unrestricted access to the system.</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" disabled={isProcessing} onClick={() => setRoleModal({ isOpen: false, user: null, newRole: '' })} className="dark:text-slate-300 dark:hover:bg-slate-800">
                            Cancel
                        </Button>
                        <Button disabled={isProcessing} onClick={executeRoleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Change"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
