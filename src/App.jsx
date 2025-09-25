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
import { UserContext } from "./states/UserContext";
import { UniversalActivityTracker } from "./states/UniversalActivityTracker";
import { useNavigate } from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const AdminUsersWrapper = () => {
    const navigate = useNavigate();
    return <AdminUsers onBack={() => navigate(-1)} />;
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

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <UserContext.Provider value={{ user, onLogout: handleLogout }}>
        {/* Just wrap once with UniversalActivityTracker */}
        <UniversalActivityTracker>
          <Routes>
            <Route
              index
              element={
                <WellsContextProvider>
                  <AppLayout />
                </WellsContextProvider>
              }
            />
            <Route
              path="abc"
              element={
                <WellsABCContextProvider>
                  <ABCLayout />
                </WellsABCContextProvider>
              }
            />
            <Route
              path="scheme"
              element={<Diagram />}
            />
            <Route
              path="oil"
              element={<OilLayout />}
            />
            {user.is_admin && (
              <Route
                path="admin/users"
                element={<AdminUsersWrapper />}
              />
            )}
          </Routes>
        </UniversalActivityTracker>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;