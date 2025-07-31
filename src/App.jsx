import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./pages/AppLayout/AppLayout";
import ABCLayout from "./pages/ABC/ABCLayout";
import Diagram from "./components/Diagram/Diagram";
import OilLayout from "./pages/OilLayout/OilLayout";
import Login from "./components/Login/Login";
import AdminUsers from "./components/AdminUsers/AdminUser";
import { WellsContextProvider } from "./states/WellsContext";
import { WellsABCContextProvider } from "./states/WellsABCContext";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1f',
        color: '#ffffff'
      }}>
        Загрузка...
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          index
          element={
            <WellsContextProvider>
              <AppLayout user={user} onLogout={handleLogout} />
            </WellsContextProvider>
          }
        />
        <Route
          path="abc"
          element={
            <WellsABCContextProvider>
              <ABCLayout user={user} onLogout={handleLogout} />
            </WellsABCContextProvider>
          }
        />
        <Route 
          path="scheme" 
          element={<Diagram user={user} onLogout={handleLogout} />} 
        />
        <Route 
          path="oil" 
          element={<OilLayout user={user} onLogout={handleLogout} />} 
        />
        {/* Admin-only route */}
        {user.is_admin && (
          <Route 
            path="admin/users" 
            element={<AdminUsers user={user} onLogout={handleLogout} />} 
          />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;