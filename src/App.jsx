import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { BrandingProvider } from './contexts/BrandingContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import DriverProfile from './pages/DriverProfile';
import Vehicles from './pages/Vehicles';
import VehicleProfile from './pages/VehicleProfile';
import Payments from './pages/Payments';
import Debts from './pages/Debts';
import OwnershipVehicles from './pages/OwnershipVehicles';
import Expenses from './pages/Expenses';
import Maintenance from './pages/Maintenance';
import Insurance from './pages/Insurance';
import Licenses from './pages/Licenses';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Trips from './pages/Trips';
import DriversContracts from './pages/DriversContracts';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrandingProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="drivers/:id" element={<DriverProfile />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="vehicles/:id" element={<VehicleProfile />} />
          <Route path="payments" element={<Payments />} />
          <Route path="debts" element={<Debts />} />
          <Route path="ownership-vehicles" element={<OwnershipVehicles />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="insurance" element={<Insurance />} />
          <Route path="licenses" element={<Licenses />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="trips" element={<Trips />} />
          <Route path="contracts" element={<DriversContracts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        </Routes>
      </Router>
    </BrandingProvider>
  );
}

export default App;
