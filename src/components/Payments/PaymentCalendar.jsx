import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiChevronRight, FiChevronLeft, FiDollarSign } from 'react-icons/fi';

const PaymentCalendar = ({ payments, onPaymentClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // أول يوم في الشهر
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // يوم البداية (0 = الأحد)
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // تجميع المدفوعات حسب التاريخ
    const paymentsByDate = {};
    payments.forEach(p => {
      if (!p.due_date) return;
      const date = p.due_date.split('T')[0];
      if (!paymentsByDate[date]) {
        paymentsByDate[date] = [];
      }
      paymentsByDate[date].push(p);
    });

    // إنشاء أيام التقويم
    const days = [];
    
    // أيام فارغة قبل بداية الشهر
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, payments: [] });
    }
    
    // أيام الشهر
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        date: dateStr,
        payments: paymentsByDate[dateStr] || [],
        isToday: new Date().toISOString().split('T')[0] === dateStr
      });
    }

    return { days, year, month };
  }, [currentDate, payments]);

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const dayNames = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronRight className="text-xl" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {monthNames[calendarData.month]} {calendarData.year}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronLeft className="text-xl" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="btn-secondary text-sm"
        >
          اليوم
        </button>
      </div>

      {/* أيام الأسبوع */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* أيام الشهر */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.days.map((dayData, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.01 }}
            className={`
              min-h-[100px] p-2 rounded-lg border transition-colors
              ${dayData.day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}
              ${dayData.isToday ? 'border-primary-500 border-2' : 'border-gray-200'}
            `}
          >
            {dayData.day && (
              <>
                <div className={`text-sm font-medium mb-1 ${dayData.isToday ? 'text-primary-600' : 'text-gray-700'}`}>
                  {dayData.day}
                </div>
                
                {dayData.payments.length > 0 && (
                  <div className="space-y-1">
                    {dayData.payments.slice(0, 3).map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => onPaymentClick && onPaymentClick(p)}
                        className={`
                          w-full text-right text-xs p-1 rounded truncate
                          ${p.status === 'paid' || p.status === 'completed' 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : p.status === 'overdue'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }
                        `}
                        title={`${p.driver_name} - ${parseFloat(p.amount).toLocaleString()} ر.س`}
                      >
                        <span className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(p.status)}`}></span>
                          <span className="truncate">{p.driver_name}</span>
                        </span>
                      </button>
                    ))}
                    {dayData.payments.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayData.payments.length - 3} أخرى
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-sm text-gray-600">مدفوع</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="text-sm text-gray-600">معلق</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-sm text-gray-600">متأخر</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentCalendar;
