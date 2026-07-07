import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';
import { User, Mail, LogOut, Bell, Moon, ShieldCheck, Settings2 } from 'lucide-react';

import { toggleDarkMode } from '../redux/actions/darkModeActions';

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const Settings = () => {
    const cookies = new Cookies();
    const token = cookies.get("CDIIS-OIS");
    const decoded = token ? jwtDecode(token) : { userName: 'Guest', userEmail: 'N/A' };

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const darkMode = useSelector(state => state.darkMode?.enabled || false);

    const handleLogout = () => {
        if (confirm("Are you sure you want to securely sign out?")) {
            cookies.remove("CDIIS-OIS", { path: "/" });
            window.location.pathname = '/';
        }
    };

    return (
        < div className="container mx-auto min-h-[calc(100vh-64px)] p-6 md:p-10 font-sans transition-colors duration-200" >
            <title>CDIIS OIS - System Preferences</title>

            <div className="max-w-4xl mx-auto">

                {/* Page Header */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
                        <Settings2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl max-md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">System Preferences</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 max-md:text-sm">Manage your administrator profile and application settings.</p>
                    </div>
                </div>

                <div className="space-y-6">

                    {/* Profile Information Card */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm gap-0 dark:bg-slate-900">
                        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-inner border-2 border-white dark:border-slate-800 ring-2 ring-slate-100 dark:ring-slate-900">
                                    {decoded.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <CardTitle className="text-xl dark:text-slate-100">Admin Profile</CardTitle>
                                    <CardDescription className="flex items-center gap-1.5 mt-1 dark:text-slate-400">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        Identity Verified
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Authorized User
                                    </Label>
                                    <Input
                                        type="text" readOnly defaultValue={decoded.userName}
                                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium focus-visible:ring-0 cursor-default"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Official Email Address
                                    </Label>
                                    <Input
                                        type="email" readOnly defaultValue={decoded.userEmail}
                                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium focus-visible:ring-0 cursor-default"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Application Settings Card */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm gap-0 dark:bg-slate-900">
                        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg dark:text-slate-100">Application Settings</CardTitle>
                            <CardDescription className="dark:text-slate-400">Customize your monitoring experience.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">

                            {/* Notification Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">System Notifications</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Receive alerts when deployed assets are overdue.</p>
                                    </div>
                                </div>
                                <Switch defaultChecked id="notifications" />
                            </div>

                            {/* Dark Mode Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <Moon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Dark Interface</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Switch the CDIIS dashboard to a low-light theme.</p>
                                    </div>
                                </div>
                                <Switch
                                    id="dark-mode"
                                    checked={darkMode}
                                    onCheckedChange={() => dispatch(toggleDarkMode())}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 shadow-sm overflow-hidden">
                        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-red-900 dark:text-red-400">Terminate Session</h4>
                                <p className="text-sm text-red-700 dark:text-red-300/80 mt-1">Securely sever your connection to the CDIIS network.</p>
                            </div>
                            <Button
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white w-full sm:w-auto shadow-sm"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out Securely
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div >
    );
};

export default Settings;
