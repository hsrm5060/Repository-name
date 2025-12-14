import { useMemo } from 'react';
import { FiTrendingUp, FiDollarSign } from 'react-icons/fi';

const PaymentChart = ({ vehicles }) => {
  // حساب بيانات الرسم البياني - آخر 12 شهر
  const chartData = useMemo(() => {
    const months = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' });
      
      let paid = 0;
      let expected = 0;
      
      vehicles.forEach(vehicle => {
        if (vehicle.installments) {
          vehicle.installments.forEach(inst => {
            const instDate = new Date(inst.due_date);
            const instMonth = `${instDate.getFullYear()}-${String(instDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (instMonth === monthKey) {
              expected += parseFloat(inst.amount) || 0;
              if (inst.status === 'paid') {
                paid += parseFloat(inst.amount) || 0;
              }
            }
          });
        }
      });
      
      months.push({ monthKey, monthName, paid, expected });
    }
    
    return months;
  }, [vehicles]);

  const maxValue = Math.max(...chartData.map(d => Math.max(d.paid, d.expected)), 1);

  // حساب الإجماليات
  const totals = useMemo(() => {
    return chartData.reduce((acc, d) => ({
      paid: acc.paid + d.paid,
      expected: acc.expected + d.expected
    }), { paid: 0, expected: 0 });
  }, [chartData]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiTrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">تتبع الدفعات - آخر 12 شهر</h3>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">المدفوع</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-gray-600">المتوقع</span>
          </div>
        </div>
      </div>

      {/* الرسم البياني */}
      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center relative" style={{ height: '200px' }}>
                {/* العمود المتوقع (خلفية) */}
                <div
                  className="absolute bottom-0 w-full bg-gray-200 rounded-t transition-all"
                  style={{ height: `${(data.expected / maxValue) * 100}%` }}
                />
                {/* العمود المدفوع (أمامي) */}
                <div
                  className="absolute bottom-0 w-3/4 bg-green-500 rounded-t transition-all z-10"
                  style={{ height: `${(data.paid / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 transform -rotate-45 origin-center whitespace-nowrap">
                {data.monthName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* الإجماليات */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
            <FiDollarSign className="w-4 h-4" />
            <span className="text-sm">إجمالي المدفوع</span>
          </div>
          <p className="text-xl font-bold text-green-700">{totals.paid.toLocaleString()} ر.س</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
            <FiDollarSign className="w-4 h-4" />
            <span className="text-sm">إجمالي المتوقع</span>
          </div>
          <p className="text-xl font-bold text-gray-700">{totals.expected.toLocaleString()} ر.س</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentChart;
