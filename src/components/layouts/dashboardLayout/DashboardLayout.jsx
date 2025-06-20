import React, { useState, useEffect } from "react";
import Sidebar, { MobileMenuButton } from "./Sidebar";

function DashboardLayout({ children }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if the screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Default tabs - can be overridden by passing tabs prop to the Dashboard component
  const defaultTabs = [
    { id: "overview", label: "Tổng quan", icon: null },
  ];

  // Get tabs from children's component type (Dashboard.tabs) or use default tabs
  const tabs = children.type.tabs || defaultTabs;
  
  return (
    <div className="relative flex flex-col h-screen md:flex-row bg-gray-50">
      <MobileMenuButton sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobile={isMobile}
        tabs={tabs}
      />
      
      <div className="flex-1 w-full overflow-auto">
        {/* Clone children and pass props */}
        {React.cloneElement(children, { 
          activeTab: activeTab,
          setActiveTab: setActiveTab,
          tabs: tabs
        })}
      </div>
    </div>
  );
}

export default DashboardLayout;