import React from 'react';
import { AppShell } from "./components/layout/AppShell";
import { SystemOverview } from "./pages/SystemOverview";
import { api } from "./api/client";
import { PlantOverview } from "./pages/PlantOverview";
import { DeviceList } from "./pages/DeviceList";
import { DeviceDetail } from "./pages/DeviceDetail";
import { Alarms } from "./pages/Alarms";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { Analytics } from "./pages/Analytics";
import { Login } from "./pages/Login";

function App() {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = React.useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return !!localStorage.getItem("auth_token");
  });

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

  const handleBackFromDevice = () => {
    setSelectedDeviceId(null);
  };

  const handleSelectSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    setActiveTab("plants");
  };

  const handleNavigateToAlarms = () => {
    setActiveTab("alarms");
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };


  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
  };

  // Validate session on mount
  React.useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      try {
        await api.getMe();
      } catch (error) {
        console.error("Session invalid", error);
        handleLogout();
      }
    };

    if (isAuthenticated) {
      checkSession();
    }
  }, [isAuthenticated]);


  const renderContent = () => {
    // If a device is selected, show device detail
    if (selectedDeviceId && (activeTab === "devices" || activeTab === "plants")) {
      return <DeviceDetail deviceId={selectedDeviceId} onBack={handleBackFromDevice} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <SystemOverview
            onSelectSite={handleSelectSite}
            onNavigateToAlarms={handleNavigateToAlarms}
          />
        );
      case 'plants':
        return (
          <PlantOverview
            siteId={selectedSiteId || undefined}
            onSelectDevice={handleSelectDevice}
          />
        );
      case 'devices':
        return <DeviceList onSelectDevice={handleSelectDevice} />;
      case 'alarms':
        return <Alarms />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <SystemOverview onSelectSite={handleSelectSite} onNavigateToAlarms={handleNavigateToAlarms} />;
    }
  };

  // Reset selections when changing tabs
  React.useEffect(() => {
    if (activeTab !== "devices" && activeTab !== "plants") {
      setSelectedDeviceId(null);
    }
    if (activeTab !== "plants") {
      setSelectedSiteId(null);
    }
  }, [activeTab]);

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      {renderContent()}
    </AppShell>
  );
}

export default App;

