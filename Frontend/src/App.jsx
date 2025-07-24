import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import { setupInterceptors } from './api/axiosConfig';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Pages
import HomePage from './pages/HomePage'; // Import the new HomePage
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Artisans from './pages/Artisans';
import ArtisanDetail from './pages/ArtisanDetail';
import HandcraftedItems from './pages/HandcraftedItems';
import ItemDetail from './pages/ItemDetail';
import PlatformListings from './pages/PlatformListings';
import Sales from './pages/Sales';
import AgreementDocuments from './pages/AgreementDocuments';
import Operators from './pages/Operators';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the login page, but save the current location they were
    // trying to go to so we can send them there after they login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main
            key={location.pathname}
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8"
            style={{ animation: 'contentFadeInUp 0.5s ease-out forwards' }}
        >
            <Outlet />
        </main>
      </div>
    </div>
  );
};

const AdminRoute = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'Admin') return <Navigate to="/dashboard" replace />; // Redirect non-admins to dashboard
    return <Outlet />;
};

function App() {
  const authContext = useAuth();

  useEffect(() => {
    setupInterceptors(authContext);
  }, [authContext]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} /> {/* Public Homepage Route */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes for Logged-in Users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/artisans" element={<Artisans />} />
        <Route path="/artisans/:artisanId" element={<ArtisanDetail />} />
        <Route path="/items" element={<HandcraftedItems />} />
        <Route path="/items/:itemId" element={<ItemDetail />} />
        <Route path="/listings" element={<PlatformListings />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/agreements" element={<AgreementDocuments />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Protected Admin-only Routes */}
        <Route element={<AdminRoute />}>
            <Route path="/operators" element={<Operators />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
export default App;