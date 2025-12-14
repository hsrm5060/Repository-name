import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiTruck, FiDollarSign, FiBell, FiSettings, FiCreditCard, FiAward, FiBarChart2, FiFileText, FiTrendingDown, FiTool, FiShield, FiMapPin, FiClipboard } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useBranding } from '../../contexts/BrandingContext';

const Sidebar = () => {
  const { branding } = useBranding();
  const menuItems = [
    { path: '/', icon: FiHome, label: 'لوحة التحكم' },
    { path: '/drivers', icon: FiUsers, label: 'السائقين' },
    { path: '/vehicles', icon: FiTruck, label: 'المركبات' },
    { path: '/trips', icon: FiMapPin, label: 'الرحلات' },
    { path: '/contracts', icon: FiClipboard, label: 'العقود' },
    { path: '/payments', icon: FiDollarSign, label: 'المدفوعات' },
    { path: '/debts', icon: FiCreditCard, label: 'الديون' },
    { path: '/ownership-vehicles', icon: FiAward, label: 'التمليك' },
    { path: '/expenses', icon: FiTrendingDown, label: 'المصروفات' },
    { path: '/maintenance', icon: FiTool, label: 'الصيانة' },
    { path: '/insurance', icon: FiShield, label: 'التأمين' },
    { path: '/licenses', icon: FiFileText, label: 'الرخص' },
    { path: '/analytics', icon: FiBarChart2, label: 'التحليلات' },
    { path: '/reports', icon: FiFileText, label: 'التقارير' },
    { path: '/notifications', icon: FiBell, label: 'الإشعارات' },
    { path: '/settings', icon: FiSettings, label: 'الإعدادات' },
  ];

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-gradient-to-b from-primary-600 to-primary-700 text-white shadow-xl h-screen flex flex-col"
    >
      <div className="p-5 border-b border-primary-500">
        {branding.logo ? (
          <div className="flex flex-col items-center">
            <img src={branding.logo} alt="Logo" className="h-12 mb-2" />
            <h1 className="text-lg font-bold text-center">{branding.company_name}</h1>
          </div>
        ) : (
          <h1 className="text-xl font-bold">{branding.company_name || 'نظام إدارة السائقين'}</h1>
        )}
        {branding.company_slogan && (
          <p className="text-xs text-primary-200 mt-1">{branding.company_slogan}</p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-primary-600 shadow-lg'
                    : 'hover:bg-primary-500'
                }`
              }
            >
              <item.icon className="text-xl" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
