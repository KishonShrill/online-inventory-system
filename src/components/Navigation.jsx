import { NavLink } from "react-router-dom";
import { Home, Package, CheckSquare, Users, Settings } from "lucide-react";
import { Role } from "../helpers/_variables";

const Navigation = ({ decoded }) => {
    // Build navigation items dynamically based on clearance level
    const navItems = [
        { name: 'Dashboard', link: '/app/dashboard', icon: Home },
        { name: 'Inventory', link: '/app/inventory', icon: Package },
        ...(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER
            ? [{ name: 'Verification', link: '/app/item-check', icon: CheckSquare }]
            : []),
        { name: 'Records', link: '/app/records', icon: Users },
        { name: 'Settings', link: '/app/settings', icon: Settings },
    ];

    return (
        <nav className="w-full h-16 bg-white border-t border-slate-200 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-50">
            <ul className="flex items-center justify-around h-full px-2 m-0 list-none">
                {navItems.map(item => (
                    <li key={item.name} className="flex-1 flex justify-center h-full">
                        <NavLink
                            to={item.link}
                            className={({ isActive }) => `
                                flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200
                                ${isActive
                                    ? "text-blue-600"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
                                }
                            `}
                            title={item.name}
                        >
                            <item.icon
                                className={`w-5 h-5 ${/* Add a slight bounce on active */ ''}`}
                                strokeWidth={2.5}
                            />
                            {/* Tiny label for better mobile UX, standard in modern apps */}
                            <span className="text-[10px] font-semibold tracking-wide">
                                {item.name}
                            </span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navigation;
