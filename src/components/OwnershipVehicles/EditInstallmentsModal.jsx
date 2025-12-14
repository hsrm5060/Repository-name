import { useState, useEffect } from 'react';
import { FiX, FiSave, FiPlus, FiTrash2, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const EditInstallmentsModal = ({ isOpen, onClose, vehicle, onUpdate }) => {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle?.installments) {
      setInstallments(vehicle.installments.map(inst => ({
        ...inst,
        due_date: inst.due_date ? inst.due_date.split('T')[0] : ''
      })));
    }
  }, [vehicle]);

  const handleInstallmentChange = (index, field, value) => {
    const updated = [...installments];
    updated[index] = { ...updated[index], [field]: value };
    setInstallments(updated);
  };

  const addInstallment = () => {
    const lastInst = installments[installments.length - 1];
    const nextDate = lastInst?.due_date 
      ? new Date(new Date(lastInst.due_date).setMonth(new Date(lastInst.due_date).getMonth() + 1))
      : new Date();
    
    setInstallments([...installments, {
      id: null,
      month: installments.length + 1,
      amount: vehicle?.monthly_installment || 0,
      due_date: nextDate.toISOString().split('T')[0],
      status: 'pending',
      paid_date: null
    }]);
  };

  const removeInstallment = (index) => {
    if (installments[index].status === 'paid') {
      toast.error('لا يمكن حذف قسط مدفوع');
      return;
    }
    setInstallments(installments.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/ownership/${vehicle.id}/installments`, { installments });
      toast.success('تم تحديث جدول الأقساط بنجاح');
      onUpdate?.();
      onClose();
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = installments.reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
  const paidAmount = installments.filter(i => i.status === 'paid').reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">تعديل جدول الأقساط</h2>
            <p className="text-sm text-gray-600">{vehicle?.vehicle_plate} - {vehicle?.driver_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* ملخص */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">عدد الأقساط</p>
              <p className="text-xl font-bold text-blue-600">{installments.length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">المدفوع</p>
              <p className="text-xl font-bold text-green-600">{paidAmount.toLocaleString()} ر.س</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">الإجمالي</p>
              <p className="text-xl font-bold text-orange-600">{totalAmount.toLocaleString()} ر.س</p>
            </div>
          </div>

          {/* جدول الأقساط */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الشهر</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">المبلغ</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">تاريخ الاستحقاق</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">تاريخ الدفع</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {installments.map((inst, index) => (
                  <tr key={index} className={inst.status === 'paid' ? 'bg-green-50' : ''}>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={inst.month}
                        onChange={(e) => handleInstallmentChange(index, 'month', e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-center"
                        disabled={inst.status === 'paid'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <FiDollarSign className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          value={inst.amount}
                          onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)}
                          className="w-28 pr-7 pl-2 py-1 border rounded"
                          disabled={inst.status === 'paid'}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <FiCalendar className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="date"
                          value={inst.due_date}
                          onChange={(e) => handleInstallmentChange(index, 'due_date', e.target.value)}
                          className="w-40 pr-7 pl-2 py-1 border rounded"
                          disabled={inst.status === 'paid'}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={inst.status}
                        onChange={(e) => handleInstallmentChange(index, 'status', e.target.value)}
                        className={`px-3 py-1 border rounded text-sm ${
                          inst.status === 'paid' ? 'bg-green-100 text-green-800' :
                          inst.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                        disabled={inst.status === 'paid'}
                      >
                        <option value="pending">معلق</option>
                        <option value="paid">مدفوع</option>
                        <option value="overdue">متأخر</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {inst.status === 'paid' && (
                        <span className="text-sm text-gray-600">
                          {inst.paid_date ? new Date(inst.paid_date).toLocaleDateString('ar-SA') : '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeInstallment(index)}
                        disabled={inst.status === 'paid'}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* زر إضافة قسط */}
          <button
            onClick={addInstallment}
            className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            إضافة قسط جديد
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInstallmentsModal;
