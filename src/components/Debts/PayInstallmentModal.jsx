import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiX, FiDollarSign, FiCheckCircle, FiCreditCard, FiHash } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { payDebtInstallment, fetchDebts } from '../../store/slices/debtsSlice';

// طرق الدفع
const PAYMENT_METHODS = [
  { value: 'cash', label: 'نقدي', icon: '💵' },
  { value: 'bank_transfer', label: 'تحويل بنكي', icon: '🏦' },
  { value: 'check', label: 'شيك', icon: '📝' },
  { value: 'card', label: 'بطاقة', icon: '💳' },
  { value: 'other', label: 'أخرى', icon: '📋' }
];

const PayInstallmentModal = ({ isOpen, onClose, debt }) => {
  const dispatch = useDispatch();
  const [paymentMode, setPaymentMode] = useState('full'); // full or partial
  const [selectedInstallments, setSelectedInstallments] = useState([]);
  const [partialAmount, setPartialAmount] = useState('');
  const [selectedPartialInstallment, setSelectedPartialInstallment] = useState(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !debt) return null;

  // تحويل البيانات للتوافق
  const debtData = {
    id: debt.id,
    driverName: debt.driver_name || debt.driverName,
    totalDebt: parseFloat(debt.total_debt || debt.totalDebt || 0),
    paidAmount: parseFloat(debt.paid_amount || debt.paidAmount || 0),
    remainingAmount: parseFloat(debt.remaining_amount || debt.remainingAmount || 0),
    installments: (debt.installments || []).map(i => ({
      id: i.id,
      amount: parseFloat(i.amount || 0),
      dueDate: i.due_date || i.dueDate,
      status: i.status
    }))
  };

  const pendingInstallments = debtData.installments.filter(i => i.status !== 'paid');

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

  const totalSelectedAmount = debtData.installments
    .filter(i => selectedInstallments.includes(i.id))
    .reduce((sum, i) => sum + i.amount, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentMode === 'full') {
      if (selectedInstallments.length === 0) {
        toast.error('الرجاء اختيار قسط واحد على الأقل');
        return;
      }

      try {
        for (const installmentId of selectedInstallments) {
          await dispatch(payDebtInstallment({
            debtId: debtData.id,
            installmentId,
            paidDate: paymentDate,
            paymentMethod,
            referenceNumber: referenceNumber || null,
            notes: notes || null,
            isPartial: false
          })).unwrap();
        }

        toast.success(`تم تسديد ${selectedInstallments.length} قسط بنجاح`);
        dispatch(fetchDebts());
        onClose();
      } catch (error) {
        toast.error('حدث خطأ أثناء تسديد الأقساط');
      }
    } else {
      // الدفع الجزئي
      if (!selectedPartialInstallment) {
        toast.error('الرجاء اختيار قسط للدفع الجزئي');
        return;
      }

      const amount = parseFloat(partialAmount);
      const installment = pendingInstallments.find(i => i.id === selectedPartialInstallment);
      
      if (!amount || amount <= 0) {
        toast.error('الرجاء إدخال مبلغ صحيح');
        return;
      }

      if (amount > installment.amount) {
        toast.error('المبلغ أكبر من قيمة القسط');
        return;
      }

      try {
        await dispatch(payDebtInstallment({
          debtId: debtData.id,
          installmentId: selectedPartialInstallment,
          paidDate: paymentDate,
          paymentMethod,
          referenceNumber: referenceNumber || null,
          notes: notes || null,
          isPartial: true,
          partialAmount: amount
        })).unwrap();

        toast.success(`تم دفع ${amount.toLocaleString()} ر.س بنجاح`);
        dispatch(fetchDebts());
        onClose();
      } catch (error) {
        toast.error('حدث خطأ أثناء الدفع الجزئي');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">تسديد الأقساط</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* معلومات الدين */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">السائق</p>
                <p className="text-lg font-semibold text-gray-900">{debtData.driverName}</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600">المبلغ المتبقي</p>
                <p className="text-lg font-bold text-orange-600">{debtData.remainingAmount.toLocaleString()} ر.س</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${(debtData.paidAmount / debtData.totalDebt) * 100}%` }}
              />
            </div>
          </div>

          {/* تاريخ الدفع وطريقة الدفع */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCreditCard className="inline w-4 h-4 ml-1" />
                طريقة الدفع
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.icon} {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* رقم المرجع (للتحويل البنكي أو الشيك) */}
          {(paymentMethod === 'bank_transfer' || paymentMethod === 'check' || paymentMethod === 'card') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiHash className="inline w-4 h-4 ml-1" />
                رقم المرجع / رقم العملية
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={paymentMethod === 'check' ? 'رقم الشيك' : 'رقم العملية'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* ملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              placeholder="أي ملاحظات إضافية..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* نوع الدفع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع الدفع</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('full');
                  setSelectedPartialInstallment(null);
                  setPartialAmount('');
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  paymentMode === 'full'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                دفع كامل للقسط
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('partial');
                  setSelectedInstallments([]);
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  paymentMode === 'partial'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                دفع جزئي
              </button>
            </div>
          </div>

          {/* قائمة الأقساط */}
          <div>
            {pendingInstallments.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <FiCheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-green-800 font-semibold">تم تسديد جميع الأقساط</p>
              </div>
            ) : paymentMode === 'full' ? (
              <>
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
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pendingInstallments.map((installment) => {
                    const isOverdue = installment.status === 'overdue';
                    const isSelected = selectedInstallments.includes(installment.id);

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
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900">
                              القسط {debtData.installments.findIndex(i => i.id === installment.id) + 1}
                            </span>
                            {isOverdue && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                متأخر
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              تاريخ الاستحقاق: {new Date(installment.dueDate).toLocaleDateString('ar-SA')}
                            </span>
                            <span className="font-bold text-gray-900">
                              {installment.amount.toLocaleString()} ر.س
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              /* الدفع الجزئي */
              <>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  اختر القسط للدفع الجزئي
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                  {pendingInstallments.map((installment) => {
                    const isOverdue = installment.status === 'overdue';
                    const isSelected = selectedPartialInstallment === installment.id;

                    return (
                      <label
                        key={installment.id}
                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : isOverdue
                            ? 'border-red-200 bg-red-50 hover:border-red-300'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="partialInstallment"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedPartialInstallment(installment.id);
                            setPartialAmount('');
                          }}
                          className="w-5 h-5 text-orange-600"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900">
                              القسط {debtData.installments.findIndex(i => i.id === installment.id) + 1}
                            </span>
                            {isOverdue && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                متأخر
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              تاريخ الاستحقاق: {new Date(installment.dueDate).toLocaleDateString('ar-SA')}
                            </span>
                            <span className="font-bold text-gray-900">
                              {installment.amount.toLocaleString()} ر.س
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {selectedPartialInstallment && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المبلغ المراد دفعه
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        placeholder="أدخل المبلغ"
                        min="1"
                        max={pendingInstallments.find(i => i.id === selectedPartialInstallment)?.amount || 0}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <span className="text-gray-600">ر.س</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      الحد الأقصى: {pendingInstallments.find(i => i.id === selectedPartialInstallment)?.amount.toLocaleString()} ر.س
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ملخص الدفع */}
          {paymentMode === 'full' && selectedInstallments.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">عدد الأقساط المحددة:</span>
                </div>
                <span className="font-semibold text-gray-900">{selectedInstallments.length}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-green-200">
                <span className="text-sm font-medium text-gray-700">إجمالي المبلغ:</span>
                <span className="text-2xl font-bold text-green-600">
                  {totalSelectedAmount.toLocaleString()} ر.س
                </span>
              </div>
            </div>
          )}

          {paymentMode === 'partial' && selectedPartialInstallment && partialAmount && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FiDollarSign className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-700">دفع جزئي للقسط:</span>
                </div>
                <span className="font-semibold text-gray-900">
                  القسط {debtData.installments.findIndex(i => i.id === selectedPartialInstallment) + 1}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                <span className="text-sm font-medium text-gray-700">المبلغ:</span>
                <span className="text-2xl font-bold text-orange-600">
                  {parseFloat(partialAmount).toLocaleString()} ر.س
                </span>
              </div>
            </div>
          )}

          {/* الأزرار */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={
                (paymentMode === 'full' && selectedInstallments.length === 0) ||
                (paymentMode === 'partial' && (!selectedPartialInstallment || !partialAmount))
              }
              className={`flex-1 px-4 py-2 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                paymentMode === 'partial' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <FiCheckCircle className="w-5 h-5" />
              {paymentMode === 'partial' ? 'تأكيد الدفع الجزئي' : 'تأكيد الدفع'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayInstallmentModal;
