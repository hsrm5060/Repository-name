import { FiX, FiDollarSign, FiCalendar, FiTruck, FiUser, FiFileText, FiCreditCard } from 'react-icons/fi';

const ExpenseDetailsModal = ({ isOpen, onClose, expense }) => {
  if (!isOpen || !expense) return null;

  const categoryLabels = {
    fuel: 'وقود',
    maintenance: 'صيانة',
    insurance: 'تأمين',
    license: 'رخص',
    fine: 'غرامات',
    salary: 'رواتب',
    rent: 'إيجار',
    other: 'أخرى'
  };

  const paymentMethods = {
    cash: 'نقدي',
    bank_transfer: 'تحويل بنكي',
    credit_card: 'بطاقة ائتمان',
    check: 'شيك'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FiDollarSign className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">تفاصيل المصروف</h2>
                <p className="text-red-100 text-sm mt-1">{expense.expense_number}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Amount Card */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 mb-6 border-2 border-red-200">
            <div className="text-center">
              <p className="text-red-600 text-sm font-medium mb-2">المبلغ الإجمالي</p>
              <p className="text-4xl font-bold text-red-700">
                {parseFloat(expense.amount).toLocaleString()} ر.س
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiFileText className="text-gray-600" />
                <p className="text-sm text-gray-600 font-medium">الفئة</p>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {categoryLabels[expense.category]}
              </p>
            </div>

            {/* Date */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiCalendar className="text-gray-600" />
                <p className="text-sm text-gray-600 font-medium">التاريخ</p>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(expense.expense_date).toLocaleDateString('ar-SA')}
              </p>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiCreditCard className="text-gray-600" />
                <p className="text-sm text-gray-600 font-medium">طريقة الدفع</p>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {paymentMethods[expense.payment_method]}
              </p>
            </div>

            {/* Paid To */}
            {expense.paid_to && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FiUser className="text-gray-600" />
                  <p className="text-sm text-gray-600 font-medium">المدفوع لـ</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">{expense.paid_to}</p>
              </div>
            )}

            {/* Vehicle */}
            {expense.vehicle_plate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FiTruck className="text-gray-600" />
                  <p className="text-sm text-gray-600 font-medium">المركبة</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {expense.vehicle_plate}
                </p>
                {expense.vehicle_make && (
                  <p className="text-sm text-gray-600 mt-1">
                    {expense.vehicle_make} {expense.vehicle_model}
                  </p>
                )}
              </div>
            )}

            {/* Driver */}
            {expense.driver_name && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FiUser className="text-gray-600" />
                  <p className="text-sm text-gray-600 font-medium">السائق</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">{expense.driver_name}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {expense.description && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium mb-2">الوصف</p>
              <p className="text-gray-800 leading-relaxed">{expense.description}</p>
            </div>
          )}

          {/* Notes */}
          {expense.notes && (
            <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium mb-2">ملاحظات</p>
              <p className="text-yellow-900 leading-relaxed">{expense.notes}</p>
            </div>
          )}

          {/* Created By */}
          {expense.created_by_name && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                تم الإضافة بواسطة: <span className="font-medium">{expense.created_by_name}</span>
              </p>
              {expense.created_at && (
                <p className="text-xs text-gray-500 mt-1">
                  في: {new Date(expense.created_at).toLocaleString('ar-SA')}
                </p>
              )}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailsModal;
