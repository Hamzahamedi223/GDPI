import { Bell, ChevronsLeft, Search, LogOut, User, ShieldCheck } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import axios from "axios";

const Header = forwardRef(({ collapsed, setCollapsed }, ref) => {
    const [user, setUser] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    const fetchUserData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found; user not authorized.");
            return;
        }
        try {
            const res = await axios.get("http://localhost:5000/api/profile/profile", { headers: { Authorization: "Bearer " + token } });
            setUser(res.data);
        } catch (err) {
            console.error("Error fetching user data:", err);
        }
    };

    useEffect(() => {
        fetchUserData();
        // Set up an event listener for profile updates
        window.addEventListener('profileUpdated', fetchUserData);
        return () => {
            window.removeEventListener('profileUpdated', fetchUserData);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user_data");
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <header 
            ref={ref} 
            className="fixed top-0 left-0 right-0 z-40 flex h-[70px] items-center justify-between border-b border-[#d7ddcf] bg-white/95 px-4 shadow-sm backdrop-blur-lg md:px-6"
        >
            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-x-2">
            <div className="rounded-lg bg-[#22351f] p-1.5 shadow-lg">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>                <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-lg font-bold"
                            >
                                <span className="text-[#22351f]">GDPI</span>
                                <span className="text-[#6f7f35]"> Command</span>
                            </motion.span>
            </div>

            <div className="flex-1 flex justify-center items-center gap-x-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCollapsed(!collapsed)}
                    className="btn-ghost size-10 rounded-lg p-2 ml-32"
                >
                    <ChevronsLeft
                        size={20}
                        className={cn(
                            "transition-transform duration-300",
                            collapsed ? "rotate-180" : ""
                        )}
                    />
                </motion.button>
                <div className="relative hidden md:block w-full max-w-xl ml-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8872]" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher equipements, tickets, utilisateurs..."
                        className="w-full rounded-lg border border-[#cbd4c2] bg-[#fafbf8] py-2 pl-10 pr-4 text-sm text-[#172018] transition-all duration-200 placeholder:text-[#7b8872] focus:border-[#6f7f35] focus:outline-none focus:ring-2 focus:ring-[#d8e7ca]"
                    />
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-x-2 md:gap-x-4">
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-ghost size-10 relative"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                {notifications.length}
                            </span>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-80 rounded-lg border border-[#d7ddcf] bg-white shadow-lg"
                            >
                                <div className="border-b border-[#d7ddcf] p-4">
                                    <h3 className="font-medium text-[#172018]">Notifications</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notification, index) => (
                                            <div
                                                key={index}
                                                className="cursor-pointer border-b border-[#d7ddcf] p-4 hover:bg-[#f4f6f0]"
                                            >
                                                <p className="text-sm text-[#4c5948]">
                                                    {notification.message}
                                                </p>
                                                <p className="mt-1 text-xs text-[#7b8872]">
                                                    {notification.time}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-[#7b8872]">
                                            No notifications
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-x-2 rounded-lg p-2 transition-colors hover:bg-[#eef1e8]"
                    >
                        {user?.profilePicture ? (
                            <img
                                src={`http://localhost:5000${user.profilePicture}`}
                                alt="Profile"
                                className="size-10 rounded-full object-cover ring-2 ring-[#6f7f35]"
                            />
                        ) : (
                            <div className="flex size-10 items-center justify-center rounded-full bg-[#22351f]">
                                <span className="font-medium text-white">
                                    {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <span className="hidden text-sm font-semibold text-[#34402f] md:block">
                            {user?.username}
                        </span>
                    </motion.button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-56 rounded-lg border border-[#d7ddcf] bg-white shadow-lg"
                            >
                                <div className="border-b border-[#d7ddcf] p-4">
                                    <p className="text-sm font-bold text-[#172018]">
                                        {user?.username}
                                    </p>
                                    <p className="text-xs text-[#7b8872]">
                                        {user?.email}
                                    </p>
                                </div>

                                <div className="py-1">
                                    <button onClick={() => navigate('/dashboard/profile')} className="flex w-full items-center gap-x-2 px-4 py-2 text-sm font-medium text-[#34402f] hover:bg-[#eef1e8]">
                                        <User size={16} />
                                        Profil
                                    </button>

                                
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-[#eef1e8]"
                                    >
                                        <LogOut size={16} />
                                        Se déconnecter
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
});

Header.displayName = 'Header';

Header.propTypes = {
    collapsed: PropTypes.bool.isRequired,
    setCollapsed: PropTypes.func.isRequired,
};

export default Header;
