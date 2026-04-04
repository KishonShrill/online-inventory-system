import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';

const Header = () => {
    const cookies = new Cookies();
    const token = cookies.get("CDIIS-OIS");

    // Fallback to 'Guest' just in case the token expires while rendering
    const decoded = token ? jwtDecode(token) : { userName: 'Guest' };

    return (
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 z-10 shrink-0">
            {/* Left Side - Mobile Branding */}
            <div className="flex items-center">
                {/* Note: Since the Desktop Sidebar already says "CDIIS", 
                  you might want to add 'sm:hidden' to this h2 so it only 
                  shows on mobile. I left it visible for now to match your old code! 
                */}
                <h2 className="font-bold text-lg text-orange-500 tracking-tight">
                    CDIIS
                </h2>
            </div>

            {/* Right Side - Personalized Welcome */}
            <div className="flex items-center gap-4">
                <p className="font-semibold text-slate-800 text-sm">
                    Welcome, {decoded.userName}!
                </p>
            </div>
        </header>
    );
};

export default Header;
