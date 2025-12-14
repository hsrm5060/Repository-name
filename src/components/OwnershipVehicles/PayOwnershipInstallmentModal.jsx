import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiX, FiDollarSign, FiCheckCircle, FiTruck, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { payOwnershipInstallmentAPI, fetchOwnershipVehicles } from '../../store/slices/ownershipVehiclesSlice';

const PayOwnershipInstallmentModal = ({ isOpen, onClose, vehicle }) => {
  const dispatch = useDispatch();
  const [selectedInstallments, setSelectedInstallments] = useState([]);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen || !vehicle) return null;

  const pendingInstallments = vehicle.installments.filter(i => i.status !== 'paid');

  const handleToggleInstallment = (installmentId) => {
    setSelectedInstallments(prev => 
      prev.includes(installmentId)
        ? prev.filter(id => id !== installmentId)
        : [...prev, installmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInstallments.length === pendingInstallments.length) {
      setSelectedInstallments([]);
    } else {
      setSelectedInstallments(pendingInstallments.map(i => i.id));
    }
  };

  const totalSelectedAmount = vehicle.installments
    .filter(i => selectedInstallments.includes(i.id))
    .reduce((sum, i) => sum + i.amount, 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedInstallments.length === 0) {
      toast.error('الرجاء اختيار قسط واحد على الأقل');
      return;
    }

    const promises = selectedInstallments.map(installmentId => 
      dispatch(payOwnershipInstallmentAPI({
        vehicleId: vehicle.id,
        installmentId,
        paidDate: paymentDate
      })).unwrap()
    );

    Promise.all(promises)
      .then(() => {
        toast.success(`تم تسديد ${selectedInstallments.length} قسط بنجاح`);
        dispatch(fetchOwnershipVehicles());
        onClose();
      })
      .catch((error) => {
        toast.error('فشل تسديد الأقساط: ' + error.message);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">تسديد الأقساط</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* معلومات العقد */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FiTruck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">المركبة</p>
                  <p className="font-semibold text-gray-900">{vehicle.vehiclePlate}</p>
                  <p className="text-xs text-gray-600">{vehicle.vehicleType}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">السائق</p>
                  <p className="font-semibold text-gray-900">{vehicle.driverName}</p>
                  <p className="text-xs text-gray-600 font-mono">{vehicle.contractNumber}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-200">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">القسط الشهري</p>
                <p className="text-lg font-bold text-gray-900">{vehicle.monthlyInstallment.toLocaleString()} ر.س</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">المبلغ المتبقي</p>
                <p className="text-lg font-bold text-orange-600">{vehicle.remainingAmount.toLocaleString()} ر.س</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">نسبة الإنجاز</p>
                <p className="text-lg font-bold text-green-600">{vehicle.completionPercentage}%</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${vehicle.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* تاريخ الدفع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ الدفع <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* قائمة الأقساط */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                اختر الأقساط المراد تسديدها
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedInstallments.length === pendingInstallments.length ? 'إلغاء الكل' : 'تحديد الكل'}
              </button>
            </div>

            {pendingInstallments.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <FiCheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-green-800 font-semibold text-lg mb-2">تم تسديد جميع الأقساط!</p>
                <p className="text-green-700">تم إكمال عقد التمليك بنجاح</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pendingInstallments.map((installment, index) => {
                  const isOverdue = installment.status === 'overdue';
                  const isSelected = selectedInstallments.includes(installment.id);
                  const installmentIndex = vehicle.installments.findIndex(i => i.id === installment.id);

                  return (
                    <label
                      key={installment.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : isOverdue
                          ? 'border-red-200 bg-red-50 hover:border-red-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleInstallment(installment.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-gray-900">
                              القسط {installmentIndex + 1}
                            </span>
                            <span className="text-sm text-gray-600 mr-2">
                              ({installment.month})
                            </span>
                          </div>
                          {isOverdue && (
                            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                              متأخر
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            تاريخ الاستحقاق: {new Date(installment.dueDate).toLocaleDateString('ar-SA')}
                          </span>
                          <span className="font-bold text-gray-900 text-lg">
                            {installment.amount.toLocaleString()} ر.س
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* ملخص الدفع */}
          {selectedInstallments.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiDollarSign className="w-5 h-5 text-green-600" />
                ملخص الدفع
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">عدد الأقساط المحددة:</span>
                  <span className="font-semibold text-gray-900 text-lg">{selectedInstallments.length}</span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-green-200">
                  <span className="text-base font-medium text-gray-700">إجمالي المبلغ:</span>
                  <span className="text-3xl font-bold text-green-600">
                    {totalSelectedAmount.toLocaleString()} ر.س
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-green-200">
                  <span className="text-sm text-gray-700">المبلغ المتبقي بعد الدفع:</span>
                  <span className="font-semibold text-orange-600">
                    {(vehicle.remainingAmount - totalSelectedAmount).toLocaleString()} ر.س
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">نسبة الإنجاز الجديدة:</span>
                  <span className="font-semibold text-green-600">
                    {Math.round(((vehicle.paidAmount + totalSelectedAmount) / (vehicle.totalPrice - vehicle.downPayment)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* الأزرار */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={selectedInstallments.length === 0}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              <FiCheckCircle className="w-5 h-5" />
              تأكيد الدفع ({totalSelectedAmount.toLocaleString()} ر.س)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayOwnershipInstallmentModal;
