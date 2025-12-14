import { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiClock, FiAlertCircle, FiCalendar, FiDollarSign, FiTruck, FiTag, FiCreditCard, FiList } from 'react-icons/fi';
import { debtsAPI } from '../../services/api';

// طرق الدفع
const PAYMENT_METHODS = {
  cash: { label: 'نقدي', icon: '💵' },
  bank_transfer: { label: 'تحويل بنكي', icon: '🏦' },
  check: { label: 'شيك', icon: '📝' },
  card: { label: 'بطاقة', icon: '💳' },
  other: { label: 'أخرى', icon: '📋' }
};

// أنواع الديون
const DEBT_TYPES = {
  advance: { label: 'سلفة', color: 'bg-blue-100 text-blue-800', icon: '💰' },
  loan: { label: 'قرض', color: 'bg-purple-100 text-purple-800', icon: '🏦' },
  violation: { label: 'مخالفات', color: 'bg-red-100 text-red-800', icon: '🚨' },
  maintenance: { label: 'صيانة', color: 'bg-orange-100 text-orange-800', icon: '🔧' },
  insurance: { label: 'تأمين', color: 'bg-green-100 text-green-800', icon: '🛡️' },
  fuel: { label: 'وقود', color: 'bg-yellow-100 text-yellow-800', icon: '⛽' },
  other: { label: 'أخرى', color: 'bg-gray-100 text-gray-800', icon: '📋' }
};

const DebtDetailsModal = ({ isOpen, onClose, debt }) => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('installments'); // installments or history

  useEffect(() => {
    if (isOpen && debt?.id) {
      fetchPaymentHistory();
    }
  }, [isOpen, debt?.id]);

  const fetchPaymentHistory = async () => {
    if (!debt?.id) return;
    setLoadingHistory(true);
    try {
      const response = await debtsAPI.getPaymentHistory(debt.id);
      setPaymentHistory(response.data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen || !debt) return null;

  // تحويل الأسماء من snake_case إلى camelCase للتوافق
  const debtData = {
    driverId: debt.driver_id || debt.driverId,
    driverName: debt.driver_name || debt.driverName,
    debtType: debt.debt_type || 'other',
    vehicleId: debt.vehicle_id,
    vehiclePlate: debt.vehicle_plate,
    totalDebt: parseFloat(debt.total_debt || debt.totalDebt || 0),
    downPayment: parseFloat(debt.down_payment || debt.downPayment || 0),
    paidAmount: parseFloat(debt.paid_amount || debt.paidAmount || 0),
    remainingAmount: parseFloat(debt.remaining_amount || debt.remainingAmount || 0),
    status: debt.status,
    dueDate: debt.due_date || debt.dueDate,
    createdDate: debt.created_date || debt.createdDate,
    notes: debt.notes,
    installments: (debt.installments || []).map(i => ({
      id: i.id,
      amount: parseFloat(i.amount || 0),
      dueDate: i.due_date || i.dueDate,
      paidDate: i.paid_date || i.paidDate,
      status: i.status
    }))
  };

  const debtType = DEBT_TYPES[debtData.debtType] || DEBT_TYPES.other;

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
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">تفاصيل الدين</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* نوع الدين */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${debtType.color}`}>
              <FiTag className="w-4 h-4" />
              {debtType.icon} {debtType.label}
            </span>
            {debtData.vehiclePlate && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
                <FiTruck className="w-4 h-4" />
                {debtData.vehiclePlate}
              </span>
            )}
          </div>

          {/* معلومات السائق والمركبة */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات السائق</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">اسم السائق</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{debtData.driverName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم السائق</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">#{debtData.driverId}</p>
              </div>
              {debtData.vehiclePlate && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">المركبة المرتبطة</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{debtData.vehiclePlate}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ملخص الدين */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiDollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">إجمالي الدين</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{debtData.totalDebt.toLocaleString()} ر.س</p>
            </div>

            {debtData.downPayment > 0 && (
              <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FiDollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">الدفعة المقدمة</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">{debtData.downPayment.toLocaleString()} ر.س</p>
              </div>
            )}

            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">المبلغ المسدد</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{debtData.paidAmount.toLocaleString()} ر.س</p>
            </div>

            <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <FiAlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">المبلغ المتبقي</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">{debtData.remainingAmount.toLocaleString()} ر.س</p>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>نسبة السداد</span>
              <span className="font-semibold">{Math.round((debtData.paidAmount / debtData.totalDebt) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all flex items-center justify-end px-2"
                style={{ width: `${(debtData.paidAmount / debtData.totalDebt) * 100}%` }}
              >
                {debtData.paidAmount > 0 && (
                  <span className="text-xs text-white font-semibold">
                    {Math.round((debtData.paidAmount / debtData.totalDebt) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* التواريخ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiCalendar className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(debtData.createdDate).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiCalendar className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-600">تاريخ الاستحقاق النهائي</p>
              </div>
              <p className={`text-lg font-semibold ${debtData.status === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(debtData.dueDate).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* الملاحظات */}
          {debtData.notes && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">الملاحظات</h4>
              <p className="text-gray-700">{debtData.notes}</p>
            </div>
          )}

          {/* تبويبات الأقساط وسجل المدفوعات */}
          <div>
            <div className="flex gap-2 mb-4 border-b">
              <button
                onClick={() => setActiveTab('installments')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'installments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiList className="inline w-4 h-4 ml-1" />
                الأقساط ({debtData.installments.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiCreditCard className="inline w-4 h-4 ml-1" />
                سجل المدفوعات ({paymentHistory.length})
              </button>
            </div>

            {activeTab === 'installments' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">القسط</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تاريخ الاستحقاق</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تاريخ السداد</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {debtData.installments.map((installment, index) => (
                      <tr key={installment.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          القسط {index + 1}
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
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">الإجمالي</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        {debtData.installments.reduce((sum, i) => sum + i.amount, 0).toLocaleString()} ر.س
                      </td>
                      <td colSpan="3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiCreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>لا يوجد سجل مدفوعات بعد</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">طريقة الدفع</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">رقم المرجع</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paymentHistory.map((payment) => {
                          const method = PAYMENT_METHODS[payment.payment_method] || PAYMENT_METHODS.other;
                          return (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {new Date(payment.payment_date).toLocaleDateString('ar-SA')}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                {parseFloat(payment.amount).toLocaleString()} ر.س
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                <span className="inline-flex items-center gap-1">
                                  {method.icon} {method.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {payment.reference_number || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {payment.notes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">الإجمالي</td>
                          <td className="px-4 py-3 text-sm font-bold text-green-600">
                            {paymentHistory.reduce((sum, p) => sum + parseFloat(p.amount), 0).toLocaleString()} ر.س
                          </td>
                          <td colSpan="3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* إحصائيات الأقساط */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">أقساط مسددة</p>
              <p className="text-2xl font-bold text-green-600">
                {debtData.installments.filter(i => i.status === 'paid').length}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">أقساط قيد الانتظار</p>
              <p className="text-2xl font-bold text-yellow-600">
                {debtData.installments.filter(i => i.status === 'pending').length}
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">أقساط متأخرة</p>
              <p className="text-2xl font-bold text-red-600">
                {debtData.installments.filter(i => i.status === 'overdue').length}
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

export default DebtDetailsModal;
