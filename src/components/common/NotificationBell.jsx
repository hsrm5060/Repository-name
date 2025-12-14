import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiBell, FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  generateNotifications 
} from '../../store/slices/notificationsSlice';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // جلب الإشعارات عند التحميل
    dispatch(fetchNotifications());
    
    // توليد إشعارات جديدة
    dispatch(generateNotifications());
    
    // تحديث الإشعارات كل 5 دقائق
    const interval = setInterval(() => {
      dispatch(generateNotifications());
      dispatch(fetchNotifications());
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleMarkAsRead = async (id) => {
    await dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead());
    dispatch(fetchNotifications());
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error':
        return <FiAlertCircle className="text-red-500" />;
      case 'warning':
        return <FiAlertCircle className="text-orange-500" />;
      case 'success':
        return <FiCheck className="text-green-500" />;
      default:
        return <FiInfo className="text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative">
      {/* زر الإشعارات */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* قائمة الإشعارات */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* خلفية شفافة للإغلاق */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* القائمة */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col"
            >
              {/* رأس القائمة */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-l from-blue-500 to-blue-600">
                <div className="flex items-center gap-2">
                  <FiBell className="w-5 h-5 text-white" />
                  <h3 className="text-base font-bold text-white">الإشعارات</h3>
                  {unreadCount > 0 && (
                    <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-white hover:text-blue-100 font-medium bg-blue-700 px-2 py-1 rounded"
                  >
                    تحديد كمقروء
                  </button>
                )}
              </div>

              {/* قائمة الإشعارات */}
              <div className="overflow-y-auto flex-1 max-h-[350px]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <FiBell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">لا توجد إشعارات</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer border-r-4 ${
                          !notification.is_read 
                            ? 'bg-blue-50 border-r-blue-500' 
                            : 'border-r-transparent'
                        }`}
                        onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.created_at).toLocaleString('ar-SA')}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* تذييل القائمة */}
              <div className="p-2 border-t border-gray-200 bg-gray-50 flex gap-2">
                {notifications.length > 10 && (
                  <span className="text-xs text-gray-500 flex-1 text-center py-1">
                    +{notifications.length - 10} إشعار آخر
                  </span>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center text-xs text-white bg-gray-600 hover:bg-gray-700 py-1.5 rounded font-medium"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
