import { FiX, FiCheckCircle, FiClock, FiAlertCircle, FiCalendar, FiDollarSign, FiTruck, FiUser, FiFileText } from 'react-icons/fi';

const OwnershipDetailsModal = ({ isOpen, onClose, vehicle }) => {
  if (!isOpen || !vehicle) return null;

  const getInstallmentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getInstallmentStatusText = (status) => {
    switch (status) {
      case 'paid': return 'مسدد';
      case 'overdue': return 'متأخر';
      default: return 'قيد الانتظار';
    }
  };

  const getInstallmentStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <FiCheckCircle className="w-4 h-4" />;
      case 'overdue': return <FiAlertCircle className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">تفاصيل عقد التمليك</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* معلومات العقد */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiFileText className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">معلومات العقد</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">رقم العقد</p>
                <p className="text-lg font-semibold text-gray-900 font-mono mt-1">{vehicle.contractNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">تاريخ البدء</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {new Date(vehicle.startDate).toLocaleDateString('ar-SA')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">تاريخ الانتهاء</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {new Date(vehicle.endDate).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </div>

          {/* معلومات المركبة والسائق */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiTruck className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">معلومات المركبة</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">رقم اللوحة</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{vehicle.vehiclePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">نوع المركبة</p>
                  <p className="text-base text-gray-900 mt-1">{vehicle.vehicleType}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FiUser className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">معلومات السائق</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">اسم السائق</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{vehicle.driverName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">رقم السائق</p>
                  <p className="text-base text-gray-900 mt-1">#{vehicle.driverId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* الملخص المالي */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiDollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">قيمة المركبة</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{vehicle.totalPrice.toLocaleString()} ر.س</p>
            </div>

            <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FiCheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">الدفعة المقدمة</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">{vehicle.downPayment.toLocaleString()} ر.س</p>
            </div>

            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">المبلغ المسدد</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{vehicle.paidAmount.toLocaleString()} ر.س</p>
            </div>

            <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <FiAlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">المبلغ المتبقي</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">{vehicle.remainingAmount.toLocaleString()} ر.س</p>
            </div>
          </div>

          {/* معلومات الأقساط */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">القسط الشهري</p>
                <p className="text-3xl font-bold text-blue-600">{vehicle.monthlyInstallment.toLocaleString()} ر.س</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">عدد الأشهر</p>
                <p className="text-3xl font-bold text-gray-900">{vehicle.installmentPeriod} شهر</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">نسبة الإنجاز</p>
                <p className="text-3xl font-bold text-green-600">{vehicle.completionPercentage}%</p>
              </div>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span className="font-semibold">تقدم السداد</span>
              <span className="font-bold text-lg">{vehicle.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className={`h-6 rounded-full transition-all flex items-center justify-end px-3 ${
                  vehicle.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  vehicle.status === 'defaulted' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}
                style={{ width: `${vehicle.completionPercentage}%` }}
              >
                {vehicle.completionPercentage > 10 && (
                  <span className="text-xs text-white font-bold">{vehicle.completionPercentage}%</span>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>البداية</span>
              <span>النهاية</span>
            </div>
          </div>

          {/* الملاحظات */}
          {vehicle.notes && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FiFileText className="w-4 h-4" />
                الملاحظات
              </h4>
              <p className="text-gray-700">{vehicle.notes}</p>
            </div>
          )}

          {/* جدول الأقساط */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الأقساط الشهرية</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الشهر</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تاريخ الاستحقاق</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تاريخ السداد</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehicle.installments.map((installment, index) => (
                    <tr key={installment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {installment.month}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {installment.amount.toLocaleString()} ر.س
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(installment.dueDate).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {installment.paidDate 
                          ? new Date(installment.paidDate).toLocaleDateString('ar-SA')
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getInstallmentStatusColor(installment.status)}`}>
                          {getInstallmentStatusIcon(installment.status)}
                          {getInstallmentStatusText(installment.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="2" className="px-4 py-3 text-sm font-semibold text-gray-900">الإجمالي</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      {vehicle.installments.reduce((sum, i) => sum + i.amount, 0).toLocaleString()} ر.س
                    </td>
                    <td colSpan="3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* إحصائيات الأقساط */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
              <p className="text-sm text-gray-600 mb-1">أقساط مسددة</p>
              <p className="text-3xl font-bold text-green-600">
                {vehicle.installments.filter(i => i.status === 'paid').length}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
              <p className="text-sm text-gray-600 mb-1">أقساط قيد الانتظار</p>
              <p className="text-3xl font-bold text-yellow-600">
                {vehicle.installments.filter(i => i.status === 'pending').length}
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
              <p className="text-sm text-gray-600 mb-1">أقساط متأخرة</p>
              <p className="text-3xl font-bold text-red-600">
                {vehicle.installments.filter(i => i.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnershipDetailsModal;
