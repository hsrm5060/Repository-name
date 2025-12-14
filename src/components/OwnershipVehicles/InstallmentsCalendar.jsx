import { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiDollarSign } from 'react-icons/fi';

const InstallmentsCalendar = ({ vehicles }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // استخراج جميع الأقساط
  const allInstallments = useMemo(() => {
    const installments = [];
    vehicles.forEach(vehicle => {
      if (vehicle.installments) {
        vehicle.installments.forEach(inst => {
          installments.push({
            ...inst,
            vehicle_plate: vehicle.vehicle_plate,
            driver_name: vehicle.driver_name,
            contract_number: vehicle.contract_number
          });
        });
      }
    });
    return installments;
  }, [vehicles]);

  // الحصول على أيام الشهر
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    
    // أيام فارغة في البداية
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, installments: [] });
    }

    // أيام الشهر
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayInstallments = allInstallments.filter(inst => {
        const instDate = new Date(inst.due_date);
        return instDate.getFullYear() === year && 
               instDate.getMonth() === month && 
               instDate.getDate() === day;
      });
      days.push({ day, date: dateStr, installments: dayInstallments });
    }

    return days;
  }, [currentDate, allInstallments]);

  const monthName = currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const getDayClass = (dayData) => {
    if (!dayData.day) return 'bg-gray-50';
    
    const hasOverdue = dayData.installments.some(i => i.status === 'pending' && new Date(i.due_date) < today);
    const hasPending = dayData.installments.some(i => i.status === 'pending' && new Date(i.due_date) >= today);
    const hasPaid = dayData.installments.some(i => i.status === 'paid');

    if (hasOverdue) return 'bg-red-100 hover:bg-red-200';
    if (hasPending) return 'bg-yellow-100 hover:bg-yellow-200';
    if (hasPaid) return 'bg-green-100 hover:bg-green-200';
    return 'bg-white hover:bg-gray-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiCalendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">تقويم الأقساط</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiChevronRight className="w-5 h-5" />
          </button>
          <span className="font-medium min-w-[150px] text-center">{monthName}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* أسماء الأيام */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* أيام الشهر */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayData, index) => (
          <div
            key={index}
            className={`min-h-[80px] p-1 rounded-lg border ${getDayClass(dayData)} ${
              isToday(dayData.day) ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {dayData.day && (
              <>
                <div className="text-sm font-medium text-gray-700 mb-1">{dayData.day}</div>
                <div className="space-y-1">
                  {dayData.installments.slice(0, 2).map((inst, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-1 rounded truncate ${
                        inst.status === 'paid' ? 'bg-green-200 text-green-800' :
                        new Date(inst.due_date) < today ? 'bg-red-200 text-red-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}
                      title={`${inst.vehicle_plate} - ${inst.amount} ر.س`}
                    >
                      <FiDollarSign className="w-3 h-3 inline" />
                      {inst.vehicle_plate}
                    </div>
                  ))}
                  {dayData.installments.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayData.installments.length - 2}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* مفتاح الألوان */}
      <div className="flex gap-4 mt-4 pt-4 border-t text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-200 rounded"></div>
          <span className="text-gray-600">مدفوع</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-200 rounded"></div>
          <span className="text-gray-600">قادم</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-200 rounded"></div>
          <span className="text-gray-600">متأخر</span>
        </div>
      </div>
    </div>
  );
};

export default InstallmentsCalendar;
