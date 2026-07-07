import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';

const Header = () => {
    const cookies = new Cookies();
    const token = cookies.get("CDIIS-OIS");

    // Fallback to 'Guest' just in case the token expires while rendering
    const decoded = token ? jwtDecode(token) : { userName: 'Guest' };

    return (
        < header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between px-6 z-10 shrink-0 transition-colors duration-200" >

            {/* Left Side - Mobile Branding */}
            < div className="flex items-center" >
                {/* Note: Since the Desktop Sidebar already says "CDIIS", 
                  you might want to add 'sm:hidden' to this h2 so it only 
                  shows on mobile. I left it visible for now to match your old code! 
                */}
                < h2 className="font-bold text-lg text-orange-500 dark:text-orange-400 tracking-tight" >
                    CDIIS
                </h2 >
            </div >

            {/* Right Side - Personalized Welcome */}
            < div className="flex items-center gap-4" >
                {/* Added dark:text-slate-200 for the welcome text */}
                < p className="font-semibold text-slate-800 dark:text-slate-200 text-sm" >
                    Welcome, {decoded.userName}!
                </p >
            </div >

        </header >
    );
};

export default Header;
