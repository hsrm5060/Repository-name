import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiPlus, FiTrash2, FiTruck, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { createDebt, modifyDebt, fetchDebts } from '../../store/slices/debtsSlice';

// أنواع الديون
const DEBT_TYPES = [
  { value: 'advance', label: 'سلفة', color: 'bg-blue-100 text-blue-800' },
  { value: 'loan', label: 'قرض', color: 'bg-purple-100 text-purple-800' },
  { value: 'violation', label: 'مخالفات', color: 'bg-red-100 text-red-800' },
  { value: 'maintenance', label: 'صيانة', color: 'bg-orange-100 text-orange-800' },
  { value: 'insurance', label: 'تأمين', color: 'bg-green-100 text-green-800' },
  { value: 'fuel', label: 'وقود', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'other', label: 'أخرى', color: 'bg-gray-100 text-gray-800' }
];

const DebtModal = ({ isOpen, onClose, debt }) => {
  const dispatch = useDispatch();
  const { drivers } = useSelector((state) => state.drivers);
  const { vehicles } = useSelector((state) => state.vehicles);
  
  const [formData, setFormData] = useState({
    driverId: '',
    driverName: '',
    debtType: 'other',
    vehicleId: '',
    vehiclePlate: '',
    totalDebt: '',
    downPayment: '',
    dueDate: '',
    notes: '',
    installments: [{ amount: '', dueDate: '' }]
  });

  useEffect(() => {
    if (debt) {
      setFormData({
        driverId: debt.driver_id || debt.driverId,
        driverName: debt.driver_name || debt.driverName,
        debtType: debt.debt_type || 'other',
        vehicleId: debt.vehicle_id || '',
        vehiclePlate: debt.vehicle_plate || '',
        totalDebt: debt.total_debt || debt.totalDebt,
        downPayment: debt.down_payment || 0,
        dueDate: debt.due_date || debt.dueDate,
        notes: debt.notes || '',
        installments: (debt.installments || []).map(i => ({
          amount: i.amount,
          dueDate: i.due_date || i.dueDate
        }))
      });
    } else {
      // Reset form for new debt
      setFormData({
        driverId: '',
        driverName: '',
        debtType: 'other',
        vehicleId: '',
        vehiclePlate: '',
        totalDebt: '',
        downPayment: '',
        dueDate: '',
        notes: '',
        installments: [{ amount: '', dueDate: '' }]
      });
    }
  }, [debt]);

  const handleDriverChange = (e) => {
    const driverId = parseInt(e.target.value);
    const driver = drivers.find(d => d.id === driverId);
    setFormData({
      ...formData,
      driverId,
      driverName: driver ? driver.name : ''
    });
  };

  const handleVehicleChange = (e) => {
    const vehicleId = e.target.value ? parseInt(e.target.value) : '';
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setFormData({
      ...formData,
      vehicleId,
      vehiclePlate: vehicle ? vehicle.plate_number : ''
    });
  };

  const handleAddInstallment = () => {
    setFormData({
      ...formData,
      installments: [...formData.installments, { amount: '', dueDate: '' }]
    });
  };

  const handleRemoveInstallment = (index) => {
    const newInstallments = formData.installments.filter((_, i) => i !== index);
    setFormData({ ...formData, installments: newInstallments });
  };

  const handleInstallmentChange = (index, field, value) => {
    const newInstallments = [...formData.installments];
    newInstallments[index][field] = value;
    setFormData({ ...formData, installments: newInstallments });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.driverId || !formData.totalDebt || !formData.dueDate) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    // حساب المبلغ الفعلي بعد الدفعة المقدمة
    const downPayment = parseFloat(formData.downPayment || 0);
    const totalDebt = parseFloat(formData.totalDebt);
    const netDebt = totalDebt - downPayment;

    const totalInstallments = formData.installments.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    if (Math.abs(totalInstallments - netDebt) > 0.01) {
      toast.error(`مجموع الأقساط (${totalInstallments}) يجب أن يساوي المبلغ بعد الدفعة المقدمة (${netDebt})`);
      return;
    }

    const debtData = {
      driver_id: formData.driverId,
      driver_name: formData.driverName,
      debt_type: formData.debtType,
      vehicle_id: formData.vehicleId || null,
      vehicle_plate: formData.vehiclePlate || null,
      total_debt: totalDebt,
      down_payment: downPayment,
      paid_amount: debt ? parseFloat(debt.paid_amount || 0) : downPayment,
      remaining_amount: debt ? parseFloat(debt.remaining_amount || 0) : netDebt,
      status: debt ? debt.status : 'active',
      due_date: formData.dueDate,
      created_date: debt ? debt.created_date : new Date().toISOString().split('T')[0],
      notes: formData.notes,
      installments: formData.installments.map((inst, index) => ({
        month: `قسط ${index + 1}`,
        amount: parseFloat(inst.amount),
        dueDate: inst.dueDate,
        status: debt?.installments?.[index]?.status || 'pending',
        paidDate: debt?.installments?.[index]?.paid_date || null
      }))
    };

    try {
      if (debt) {
        await dispatch(modifyDebt({ id: debt.id, data: debtData })).unwrap();
        toast.success('تم تحديث الدين بنجاح');
      } else {
        await dispatch(createDebt(debtData)).unwrap();
        toast.success('تم إضافة الدين بنجاح');
      }
      dispatch(fetchDebts());
      onClose();
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ الدين');
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {debt ? 'تعديل الدين' : 'إضافة دين جديد'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* نوع الدين */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الدين <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {DEBT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, debtType: type.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.debtType === type.value
                      ? `${type.color} ring-2 ring-offset-1 ring-blue-500`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* اختيار السائق */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiUser className="inline w-4 h-4 ml-1" />
              السائق <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.driverId}
              onChange={handleDriverChange}
              required
              disabled={!!debt}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">اختر السائق</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>

          {/* اختيار المركبة (اختياري) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiTruck className="inline w-4 h-4 ml-1" />
              المركبة (اختياري)
            </label>
            <select
              value={formData.vehicleId}
              onChange={handleVehicleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">بدون مركبة</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate_number} - {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
            {formData.vehicleId && (
              <p className="mt-1 text-xs text-gray-500">
                سيتم ربط هذا الدين بالمركبة: {formData.vehiclePlate}
              </p>
            )}
          </div>

          {/* إجمالي الدين والدفعة المقدمة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                إجمالي الدين (ر.س) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.totalDebt}
                onChange={(e) => setFormData({ ...formData, totalDebt: e.target.value })}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدفعة المقدمة (ر.س)
              </label>
              <input
                type="number"
                value={formData.downPayment}
                onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                min="0"
                step="0.01"
                max={formData.totalDebt || 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* المبلغ المتبقي للتقسيط */}
          {formData.totalDebt && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">المبلغ المتبقي للتقسيط:</span>
                <span className="text-lg font-bold text-blue-600">
                  {(parseFloat(formData.totalDebt || 0) - parseFloat(formData.downPayment || 0)).toLocaleString()} ر.س
                </span>
              </div>
            </div>
          )}

          {/* تاريخ الاستحقاق */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ الاستحقاق النهائي <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* الأقساط */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                الأقساط <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddInstallment}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2 text-sm"
              >
                <FiPlus className="w-4 h-4" />
                إضافة قسط
              </button>
            </div>

            <div className="space-y-3">
              {formData.installments.map((installment, index) => (
                <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">المبلغ (ر.س)</label>
                    <input
                      type="number"
                      value={installment.amount}
                      onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">تاريخ الاستحقاق</label>
                    <input
                      type="date"
                      value={installment.dueDate}
                      onChange={(e) => handleInstallmentChange(index, 'dueDate', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {formData.installments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstallment(index)}
                      className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-2 text-sm text-gray-600">
              مجموع الأقساط: {formData.installments.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0).toFixed(2)} ر.س
            </div>
          </div>

          {/* الملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أضف أي ملاحظات إضافية..."
            />
          </div>

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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {debt ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebtModal;
