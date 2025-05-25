// Layout.jsx
import { Outlet } from "react-router-dom";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "@/hooks/use-click-outside";
import Sidebar from "@/layouts/sidebar";
import Header from "@/layouts/header";
import { cn } from "@/utils/cn";
import { useRef, useState, useEffect } from "react";

const Layout = () => {
    const isDesktopDevice = useMediaQuery("(min-width: 768px)");
    const [collapsed, setCollapsed] = useState(!isDesktopDevice);
    const sidebarRef = useRef(null);
    const menuButtonRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useClickOutside([sidebarRef, menuButtonRef], () => {
        if (!isDesktopDevice && !collapsed) {
            setCollapsed(true);
        }
    });

    return (
        <div className="min-h-screen bg-slate-100 transition-colors">
            {/* Overlay */}
            <div 
                className={cn(
                    "fixed inset-0 bg-black/50 transition-opacity duration-300 z-40",
                    !collapsed && isDesktopDevice ? "opacity-0 pointer-events-none" : 
                    !collapsed ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setCollapsed(true)}
            />
            
            <Sidebar ref={sidebarRef} collapsed={collapsed} />
            
            <div 
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    collapsed ? "md:ml-[70px]" : "md:ml-[240px]",
                    isMounted ? "opacity-100" : "opacity-0"
                )}
            >
                <Header 
                    ref={menuButtonRef}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />
                <main className="h-[calc(100vh-70px)] overflow-y-auto overflow-x-hidden p-4 md:p-6 mt-[70px]">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout