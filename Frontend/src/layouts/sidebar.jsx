import { Link, useLocation } from "react-router-dom";
import { getNavbarLinks } from "@/constants";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useState } from "react";
import { Hospital } from "lucide-react";

const Sidebar = forwardRef(({ collapsed, setCollapsed }, ref) => {
    const location = useLocation();
    const [navbarLinks, setNavbarLinks] = useState(getNavbarLinks());

    // Update navbar links when user data changes
    useEffect(() => {
        const handleStorageChange = () => {
            setNavbarLinks(getNavbarLinks());
        };

        // Listen for changes to localStorage
        window.addEventListener('storage', handleStorageChange);
        // Listen for custom event when user data is updated
        window.addEventListener('profileUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('profileUpdated', handleStorageChange);
        };
    }, []);

    return (
        <aside
            ref={ref}
            className={cn(
                "fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300",
                collapsed ? "md:w-20 -translate-x-full md:translate-x-0" : "translate-x-0"
            )}
        >
            {/* Top Section */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700">
                <motion.div 
                    className="flex items-center gap-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg">
                        <Hospital className="h-5 w-5 text-white" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-lg font-bold"
                            >
                                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Medi</span>
                                <span className="text-gray-800 dark:text-white">Tech</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Navigation */}
            <nav className="h-[calc(100vh-73px)] overflow-y-auto py-3 px-2">
                {navbarLinks.map((section) => (
                    <div key={section.title} className="mb-6">
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.h3
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                >
                                    {section.title}
                                </motion.h3>
                            )}
                        </AnimatePresence>
                        <ul className="space-y-1">
                            {section.links.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <motion.li
                                        key={link.path}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Link
                                            to={link.path}
                                            className={cn(
                                                "group flex items-center gap-x-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                                isActive
                                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20"
                                                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700"
                                            )}
                                        >
                                            <div className="relative">
                                                <link.icon
                                                    size={18}
                                                    className={cn(
                                                        "flex-shrink-0 transition-transform duration-200",
                                                        isActive ? "text-white" : "text-gray-500 dark:text-gray-400",
                                                        !collapsed && "group-hover:scale-110"
                                                    )}
                                                />
                                            </div>
                                            <AnimatePresence>
                                                {!collapsed && (
                                                    <motion.span
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -10 }}
                                                        className="truncate flex-1"
                                                    >
                                                        {link.label}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </Link>
                                    </motion.li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
