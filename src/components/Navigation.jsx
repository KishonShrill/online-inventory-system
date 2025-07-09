import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, ChevronLeft, Home, Package, Users, Settings, CheckSquare } from "lucide-react";
import { Role } from "../helpers/_variables";

import '../styles/navigation.scss'


const Navigation = ({ decoded }) => {
    const currentPage = useLocation().pathname

    const navItems = [
        { name: 'Dashboard', link: '/app/dashboard', icon: Home },
        { name: 'Inventory', link: '/app/inventory', icon: Package },
        ...(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER
            ? [{ name: 'Item Check', link: '/app/item-check', icon: CheckSquare }]
            : []),
        { name: 'Borrow Records', link: '/app/records', icon: Users },
        { name: 'Settings', link: '/app/settings', icon: Settings },
    ];

    return (
        <nav className="navigation">
            <ul className="navigation__list" style={{ listStyle: "none" }}>
                {navItems.map(item => (
                    <li className="navigation__link" key={item.name}>
                        <Link
                            className={`navigation__link sidebar-link-button ${currentPage === item.link ? 'active' : 'hoverable'}`}
                            to={item.link}
                        >
                            <item.icon size={24} className={`sidebar-icon ${currentPage === item.link ? 'active' : 'hoverable'}`} />
                            {/* <span
                                className={`sidebar-link-span`}
                            >
                                {item.name}
                            </span> */}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
};

export default Navigation;