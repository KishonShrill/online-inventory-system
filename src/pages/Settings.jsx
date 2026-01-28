
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';
import '../styles/settings.scss'
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '../redux/actions/darkModeActions';
import {  
  User,
  Mail,
  LogOut,
  Bell,
  Moon,
} from 'lucide-react';



const Settings = () => {
    const cookies = new Cookies()
    const token = cookies.get("CDIIS-OIS")
    const decoded = jwtDecode(token)
    const navigate = useNavigate()
    const darkMode = useSelector(state => state.darkMode.enabled);
    const dispatch = useDispatch();

    const logout = () => {
        cookies.remove("CDIIS-OIS", { path: "/" });
        window.location.pathname = '/';
    }

    return (
        <>
            <title>CDIIS OIS - Settings</title>
            <div className='max-w-4xl mx-auto space-y-8'>
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold">
                            A
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Admin Account</h2>
                            <p className="text-slate-500 text-sm">Manage your profile information</p>
                        </div>
                    </div>
    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <User size={16} className="text-slate-400"/> Username
                            </label>
                            <input 
                                type="text"
                                readOnly
                                defaultValue={decoded.userName} 
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Mail size={16} className="text-slate-400"/> Email Address
                            </label>
                            <input 
                                type="email" 
                                readOnly
                                defaultValue={decoded.userEmail}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                            />
                        </div>
                    </div>
                </div>   
    
                {/* System Preferences */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">System Settings</h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                            <div className="flex gap-4">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg h-fit">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">Email Notifications</h4>
                                    <p className="text-xs text-slate-500 mt-1">Receive updates when items are overdue.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
    
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4">
                                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg h-fit">
                                    <Moon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">Dark Mode</h4>
                                    <p className="text-xs text-slate-500 mt-1">Switch between light and dark themes.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
    
                {/* Danger Zone */}
                <div className="border border-red-100 bg-red-50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div>
                        <h4 className="font-bold text-red-800">Sign Out Session</h4>
                        <p className="text-xs text-red-600 mt-1">Securely log out of your administrator account.</p>
                     </div>
                     <button 
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 hover:bg-red-100 text-red-700 rounded-lg text-sm font-semibold transition-colors"
                        onClick={() => logout()}>
                        <LogOut size={16} /> Sign Out
                     </button>
                </div>
            </div>
        </>
    );
};

export default Settings
