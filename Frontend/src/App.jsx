import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Artisans from './pages/Artisans';
import HandcraftedItems from './pages/HandcraftedItems';
import PlatformListings from './pages/PlatformListings';
import Sales from './pages/Sales';
import AgreementDocuments from './pages/AgreementDocuments';
import Operators from './pages/Operators';
import NotFound from './pages/NotFound';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-900/20">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AdminRoute = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'Admin') return <Navigate to="/" replace />;
    return <Outlet />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/artisans" element={<Artisans />} />
        <Route path="/items" element={<HandcraftedItems />} />
        <Route path="/listings" element={<PlatformListings />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/agreements" element={<AgreementDocuments />} />

        <Route element={<AdminRoute />}>
            <Route path="/operators" element={<Operators />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;