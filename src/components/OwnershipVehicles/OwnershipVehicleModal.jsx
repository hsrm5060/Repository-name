import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { createOwnershipVehicle, modifyOwnershipVehicle, fetchOwnershipVehicles } from '../../store/slices/ownershipVehiclesSlice';

const OwnershipVehicleModal = ({ isOpen, onClose, vehicle }) => {
  const dispatch = useDispatch();
  const { drivers } = useSelector((state) => state.drivers);
  const { vehicles } = useSelector((state) => state.vehicles);
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    vehiclePlate: '',
    vehicleType: '',
    driverId: '',
    driverName: '',
    totalPrice: '',
    downPayment: '',
    monthlyInstallment: '',
    installmentPeriod: '',
    startDate: '',
    notes: '',
    contractNumber: ''
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleId: vehicle.vehicleId,
        vehiclePlate: vehicle.vehiclePlate,
        vehicleType: vehicle.vehicleType,
        driverId: vehicle.driverId,
        driverName: vehicle.driverName,
        totalPrice: vehicle.totalPrice,
        downPayment: vehicle.downPayment,
        monthlyInstallment: vehicle.monthlyInstallment,
        installmentPeriod: vehicle.installmentPeriod,
        startDate: vehicle.startDate,
        notes: vehicle.notes || '',
        contractNumber: vehicle.contractNumber
      });
    } else {
      // توليد رقم عقد تلقائي
      const contractNum = `OWN-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
      setFormData(prev => ({ ...prev, contractNumber: contractNum }));
    }
  }, [vehicle]);

  const handleVehicleChange = (e) => {
    const vehicleId = parseInt(e.target.value);
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (selectedVehicle) {
      setFormData({
        ...formData,
        vehicleId,
        vehiclePlate: selectedVehicle.plateNumber,
        vehicleType: `${selectedVehicle.make} ${selectedVehicle.model} ${selectedVehicle.year}`
      });
    }
  };

  const handleDriverChange = (e) => {
    const driverId = parseInt(e.target.value);
    const driver = drivers.find(d => d.id === driverId);
    setFormData({
      ...formData,
      driverId,
      driverName: driver ? driver.name : ''
    });
  };

  const calculateEndDate = (startDate, months) => {
    if (!startDate || !months) return '';
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + parseInt(months));
    return date.toISOString().split('T')[0];
  };

  const generateInstallments = (startDate, monthlyAmount, period) => {
    const installments = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < period; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + i);
      dueDate.setDate(28); // آخر يوم آمن في الشهر
      
      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                         'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      
      installments.push({
        id: i + 1,
        month: `${monthNames[dueDate.getMonth()]} ${dueDate.getFullYear()}`,
        amount: parseFloat(monthlyAmount),
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        paidDate: null
      });
    }
    
    return installments;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.vehicleId || !formData.driverId || !formData.totalPrice || 
        !formData.downPayment || !formData.monthlyInstallment || 
        !formData.installmentPeriod || !formData.startDate) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const totalPrice = parseFloat(formData.totalPrice);
    const downPayment = parseFloat(formData.downPayment);
    const monthlyInstallment = parseFloat(formData.monthlyInstallment);
    const period = parseInt(formData.installmentPeriod);

    if (downPayment >= totalPrice) {
      toast.error('الدفعة المقدمة يجب أن تكون أقل من قيمة المركبة');
      return;
    }

    const remainingAfterDown = totalPrice - downPayment;
    const totalInstallments = monthlyInstallment * period;

    if (Math.abs(totalInstallments - remainingAfterDown) > 100) {
      toast.error(`مجموع الأقساط (${totalInstallments.toLocaleString()}) لا يساوي المبلغ المتبقي (${remainingAfterDown.toLocaleString()})`);
      return;
    }

    const endDate = calculateEndDate(formData.startDate, period);
    const installments = vehicle ? vehicle.installments : generateInstallments(
      formData.startDate, 
      monthlyInstallment, 
      period
    );

    const vehicleData = {
      ...formData,
      totalPrice,
      downPayment,
      remainingAmount: vehicle ? vehicle.remainingAmount : remainingAfterDown,
      paidAmount: vehicle ? vehicle.paidAmount : 0,
      monthlyInstallment,
      installmentPeriod: period,
      endDate,
      status: vehicle ? vehicle.status : 'active',
      installments,
      completionPercentage: vehicle ? vehicle.completionPercentage : 0
    };

    if (vehicle) {
      dispatch(modifyOwnershipVehicle({ id: vehicle.id, data: vehicleData }))
        .unwrap()
        .then(() => {
          toast.success('تم تحديث العقد بنجاح');
          dispatch(fetchOwnershipVehicles());
          onClose();
        })
        .catch((error) => {
          toast.error('فشل تحديث العقد: ' + error.message);
        });
    } else {
      dispatch(createOwnershipVehicle(vehicleData))
        .unwrap()
        .then(() => {
          toast.success('تم إضافة العقد بنجاح');
          dispatch(fetchOwnershipVehicles());
          onClose();
        })
        .catch((error) => {
          toast.error('فشل إضافة العقد: ' + error.message);
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {vehicle ? 'تعديل عقد التمليك' : 'إضافة عقد تمليك جديد'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* رقم العقد */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم العقد <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contractNumber}
              onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="OWN-2024-001"
            />
          </div>

          {/* اختيار المركبة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المركبة <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.vehicleId}
              onChange={handleVehicleChange}
              required
              disabled={!!vehicle}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">اختر المركبة</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} - {v.make} {v.model} {v.year}
                </option>
              ))}
            </select>
          </div>

          {/* اختيار السائق */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              السائق <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.driverId}
              onChange={handleDriverChange}
              required
              disabled={!!vehicle}
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

          {/* المبالغ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                قيمة المركبة (ر.س) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.totalPrice}
                onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                required
                min="0"
                step="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="80000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدفعة المقدمة (ر.س) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.downPayment}
                onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                required
                min="0"
                step="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="20000"
              />
            </div>
          </div>

          {/* الأقساط */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القسط الشهري (ر.س) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.monthlyInstallment}
                onChange={(e) => setFormData({ ...formData, monthlyInstallment: e.target.value })}
                required
                min="0"
                step="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الأشهر <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.installmentPeriod}
                onChange={(e) => setFormData({ ...formData, installmentPeriod: e.target.value })}
                required
                min="1"
                max="60"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="24"
              />
            </div>
          </div>

          {/* حساب المبلغ المتبقي */}
          {formData.totalPrice && formData.downPayment && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">المبلغ المتبقي للتقسيط:</span>
                <span className="text-lg font-bold text-blue-600">
                  {(parseFloat(formData.totalPrice) - parseFloat(formData.downPayment)).toLocaleString()} ر.س
                </span>
              </div>
              {formData.monthlyInstallment && formData.installmentPeriod && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200">
                  <span className="text-sm text-gray-700">مجموع الأقساط:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {(parseFloat(formData.monthlyInstallment) * parseInt(formData.installmentPeriod)).toLocaleString()} ر.س
                  </span>
                </div>
              )}
            </div>
          )}

          {/* تاريخ البدء */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ بدء العقد <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.startDate && formData.installmentPeriod && (
              <p className="mt-2 text-sm text-gray-600">
                تاريخ الانتهاء المتوقع: {calculateEndDate(formData.startDate, formData.installmentPeriod) && 
                  new Date(calculateEndDate(formData.startDate, formData.installmentPeriod)).toLocaleDateString('ar-SA')}
              </p>
            )}
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
              {vehicle ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnershipVehicleModal;
