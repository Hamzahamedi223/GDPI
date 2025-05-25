import { useTheme } from "@/hooks/use-theme";
import { Bell, ChevronsLeft, Moon, Search, Sun, LogOut, User, Settings, Hospital } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import axios from "axios";

const Header = forwardRef(({ collapsed, setCollapsed }, ref) => {
    const { theme, setTheme } = useTheme();
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
            className="fixed top-0 left-0 right-0 z-40 flex h-[70px] items-center justify-between bg-white/95 backdrop-blur-lg px-4 md:px-6 shadow-sm border-b border-gray-100 dark:bg-slate-900/95 dark:border-slate-800"
        >
            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-x-2">
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg">
                        <Hospital className="h-5 w-5 text-white" />
                    </div>                <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-lg font-bold"
                            >
                                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Medi</span>
                                <span className="text-gray-800 dark:text-white">Tech</span>
                            </motion.span>
            </div>

            <div className="flex-1 flex justify-center items-center gap-x-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCollapsed(!collapsed)}
                    className="btn-ghost size-10 rounded-lg p-2 hover:bg-gray-100 ml-32"
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search patients, appointments, reports..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700"
                            >
                                <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                                    <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notification, index) => (
                                            <div
                                                key={index}
                                                className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-100 dark:border-slate-700"
                                            >
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {notification.time}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
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
                        className="flex items-center gap-x-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors"
                    >
                        {user?.profilePicture ? (
                            <img
                                src={`http://localhost:5000${user.profilePicture}`}
                                alt="Profile"
                                className="size-10 rounded-full object-cover ring-2 ring-blue-500"
                            />
                        ) : (
                            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                                <span className="font-medium text-white">
                                    {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {user?.username}
                        </span>
                    </motion.button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700"
                            >
                                <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user?.username}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {user?.email}
                                    </p>
                                </div>

                                <div className="py-1">
                                    <button onClick={() => navigate('/dashboard/profile')} className="w-full flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                                        <User size={16} />
                                        Profil
                                    </button>

                                
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-slate-700"
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
