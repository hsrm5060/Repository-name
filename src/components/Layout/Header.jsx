import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../common/NotificationBell';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">مرحباً، {user?.username || 'المستخدم'}</h2>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <FiUser className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{user?.role || 'مدير'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FiLogOut />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
