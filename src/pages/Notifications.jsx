import { useSelector, useDispatch } from 'react-redux';
import { markNotificationAsRead, markAllNotificationsAsRead, fetchNotifications } from '../store/slices/notificationsSlice';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiInfo, FiCheckCircle, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <FiAlertCircle className="text-orange-500 text-2xl" />;
      case 'info': return <FiInfo className="text-blue-500 text-2xl" />;
      case 'success': return <FiCheckCircle className="text-green-500 text-2xl" />;
      default: return <FiInfo className="text-gray-500 text-2xl" />;
    }
  };

  const handleMarkAsRead = (id) => {
    dispatch(markNotificationAsRead(id))
      .unwrap()
      .then(() => {
        toast.success('تم تحديد الإشعار كمقروء');
      })
      .catch((error) => {
        toast.error('فشل تحديث الإشعار: ' + error.message);
      });
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead())
      .unwrap()
      .then(() => {
        toast.success('تم تحديد جميع الإشعارات كمقروءة');
      })
      .catch((error) => {
        toast.error('فشل تحديث الإشعارات: ' + error.message);
      });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">الإشعارات</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'لا توجد إشعارات جديدة'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn-primary flex items-center gap-2">
            <FiCheck /> تحديد الكل كمقروء
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card ${!notification.is_read ? 'border-r-4 border-primary-500 bg-blue-50' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{notification.title}</h3>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      تحديد كمقروء
                    </button>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{notification.message}</p>
                <p className="text-sm text-gray-500">{notification.date}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
