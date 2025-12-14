import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiPieChart, FiBarChart2, FiDollarSign } from 'react-icons/fi';

const PaymentCharts = ({ payments }) => {
  const chartData = useMemo(() => {
    // إحصائيات حسب الشهر (آخر 6 أشهر)
    const monthlyData = {};
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = { paid: 0, pending: 0, overdue: 0, total: 0 };
    }

    payments.forEach(p => {
      if (!p.due_date) return;
      const month = p.due_date.substring(0, 7);
      if (monthlyData[month]) {
        const amount = parseFloat(p.amount || 0);
        monthlyData[month].total += amount;
        if (p.status === 'paid' || p.status === 'completed') {
          monthlyData[month].paid += amount;
        } else if (p.status === 'overdue') {
          monthlyData[month].overdue += amount;
        } else {
          monthlyData[month].pending += amount;
        }
      }
    });

    // إحصائيات حسب الخطة
    const planData = {
      daily: { count: 0, total: 0, paid: 0 },
      weekly: { count: 0, total: 0, paid: 0 },
      monthly: { count: 0, total: 0, paid: 0 },
      yearly: { count: 0, total: 0, paid: 0 },
    };

    payments.forEach(p => {
      if (planData[p.plan]) {
        planData[p.plan].count++;
        planData[p.plan].total += parseFloat(p.amount || 0);
        if (p.status === 'paid' || p.status === 'completed') {
          planData[p.plan].paid += parseFloat(p.amount || 0);
        }
      }
    });

    // إحصائيات الحالة
    const statusData = {
      paid: payments.filter(p => p.status === 'paid' || p.status === 'completed').length,
      pending: payments.filter(p => p.status === 'pending').length,
      overdue: payments.filter(p => p.status === 'overdue').length,
    };

    return { monthlyData, planData, statusData };
  }, [payments]);

  const monthNames = {
    '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
    '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
    '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
  };

  const getMonthName = (key) => {
    const month = key.split('-')[1];
    return monthNames[month] || month;
  };

  // حساب أعلى قيمة للرسم البياني
  const maxMonthlyValue = Math.max(
    ...Object.values(chartData.monthlyData).map(d => d.total),
    1
  );

  const totalStatus = chartData.statusData.paid + chartData.statusData.pending + chartData.statusData.overdue;

  return (
    <div className="space-y-6">
      {/* رسم بياني شهري */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiBarChart2 className="text-primary-600" />
          المدفوعات الشهرية (آخر 6 أشهر)
        </h3>
        
        <div className="flex items-end justify-between gap-2 h-48">
          {Object.entries(chartData.monthlyData).map(([month, data], index) => (
            <div key={month} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center gap-1 h-40">
                {/* الأعمدة */}
                <div className="w-full flex gap-0.5 items-end h-32">
                  {/* مدفوع */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.paid / maxMonthlyValue) * 100}%` }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-1 bg-green-500 rounded-t min-h-[4px]"
                    title={`مدفوع: ${data.paid.toLocaleString()} ر.س`}
                  />
                  {/* معلق */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.pending / maxMonthlyValue) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.05 }}
                    className="flex-1 bg-yellow-500 rounded-t min-h-[4px]"
                    title={`معلق: ${data.pending.toLocaleString()} ر.س`}
                  />
                  {/* متأخر */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.overdue / maxMonthlyValue) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                    className="flex-1 bg-red-500 rounded-t min-h-[4px]"
                    title={`متأخر: ${data.overdue.toLocaleString()} ر.س`}
                  />
                </div>
                {/* القيمة */}
                <p className="text-xs text-gray-500 font-medium">
                  {(data.total / 1000).toFixed(0)}k
                </p>
              </div>
              {/* اسم الشهر */}
              <p className="text-xs text-gray-600 mt-2">{getMonthName(month)}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-500"></span>
            <span className="text-sm text-gray-600">مدفوع</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-yellow-500"></span>
            <span className="text-sm text-gray-600">معلق</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span className="text-sm text-gray-600">متأخر</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* رسم دائري للحالات */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiPieChart className="text-primary-600" />
            توزيع الحالات
          </h3>
          
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* الدائرة */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* مدفوع */}
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="20"
                  strokeDasharray={`${(chartData.statusData.paid / totalStatus) * 251.2} 251.2`}
                  className="transition-all duration-1000"
                />
                {/* معلق */}
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="20"
                  strokeDasharray={`${(chartData.statusData.pending / totalStatus) * 251.2} 251.2`}
                  strokeDashoffset={`${-(chartData.statusData.paid / totalStatus) * 251.2}`}
                  className="transition-all duration-1000"
                />
                {/* متأخر */}
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray={`${(chartData.statusData.overdue / totalStatus) * 251.2} 251.2`}
                  strokeDashoffset={`${-((chartData.statusData.paid + chartData.statusData.pending) / totalStatus) * 251.2}`}
                  className="transition-all duration-1000"
                />
              </svg>
              {/* النص في المنتصف */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-gray-800">{totalStatus}</p>
                <p className="text-sm text-gray-500">إجمالي</p>
              </div>
            </div>
          </div>

          {/* التفاصيل */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-gray-700">مدفوع</span>
              </div>
              <div className="text-left">
                <span className="font-bold text-green-600">{chartData.statusData.paid}</span>
                <span className="text-gray-500 text-sm mr-1">
                  ({((chartData.statusData.paid / totalStatus) * 100 || 0).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-gray-700">معلق</span>
              </div>
              <div className="text-left">
                <span className="font-bold text-yellow-600">{chartData.statusData.pending}</span>
                <span className="text-gray-500 text-sm mr-1">
                  ({((chartData.statusData.pending / totalStatus) * 100 || 0).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-gray-700">متأخر</span>
              </div>
              <div className="text-left">
                <span className="font-bold text-red-600">{chartData.statusData.overdue}</span>
                <span className="text-gray-500 text-sm mr-1">
                  ({((chartData.statusData.overdue / totalStatus) * 100 || 0).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* إحصائيات حسب الخطة */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-primary-600" />
            الأداء حسب الخطة
          </h3>
          
          <div className="space-y-4">
            {[
              { key: 'daily', name: 'يومي', color: 'purple' },
              { key: 'weekly', name: 'أسبوعي', color: 'blue' },
              { key: 'monthly', name: 'شهري', color: 'green' },
              { key: 'yearly', name: 'سنوي', color: 'orange' },
            ].map(plan => {
              const data = chartData.planData[plan.key];
              const percentage = data.total > 0 ? (data.paid / data.total) * 100 : 0;
              
              return (
                <div key={plan.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{plan.name}</span>
                    <span className="text-sm text-gray-500">
                      {data.paid.toLocaleString()} / {data.total.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full rounded-full bg-${plan.color}-500`}
                      style={{ 
                        backgroundColor: plan.color === 'purple' ? '#a855f7' :
                                        plan.color === 'blue' ? '#3b82f6' :
                                        plan.color === 'green' ? '#22c55e' : '#f97316'
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{data.count} دفعة</span>
                    <span>{percentage.toFixed(0)}% محصّل</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentCharts;
