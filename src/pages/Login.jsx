import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // استدعاء API للتحقق من بيانات الدخول
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // حفظ Token في localStorage
        localStorage.setItem('token', data.token);
        
        // تحديث Redux state
        dispatch(login({ 
          user: { name: data.user?.name || 'المستخدم', username: credentials.username }, 
          role: data.user?.role || 'admin',
          token: data.token
        }));
        
        toast.success('تم تسجيل الدخول بنجاح!');
        navigate('/');
      } else {
        toast.error(data.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      toast.error('حدث خطأ في الاتصال بالسيرفر');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">نظام إدارة السائقين</h1>
          <p className="text-gray-600">قم بتسجيل الدخول للمتابعة</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
            <div className="relative">
              <FiUser className="absolute right-3 top-3 text-gray-400" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="input-field pr-10"
                placeholder="2414239299"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <FiLock className="absolute right-3 top-3 text-gray-400" />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="input-field pr-10"
                placeholder="Aa123456@"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="w-full btn-primary py-3 text-lg font-semibold">
            تسجيل الدخول
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <strong>بيانات الدخول:</strong><br />
            المستخدم: 2414239299 | كلمة المرور: Aa123456@
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
