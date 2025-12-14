import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { assignVehicle } from '../../store/slices/vehiclesSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AssignVehicleModal = ({ isOpen, onClose, vehicle }) => {
  const dispatch = useDispatch();
  const { drivers } = useSelector((state) => state.drivers);
  const [selectedDriverId, setSelectedDriverId] = useState('');

  const availableDrivers = drivers.filter(d => d.status === 'active');

  const handleAssign = () => {
    if (!selectedDriverId) {
      toast.error('الرجاء اختيار سائق');
      return;
    }

    const driver = drivers.find(d => d.id === parseInt(selectedDriverId));
    if (driver && vehicle) {
      dispatch(assignVehicle({
        vehicleId: vehicle.id,
        driverId: driver.id,
        driverName: driver.name
      }));
      toast.success(`تم تخصيص المركبة للسائق ${driver.name}`);
      onClose();
      setSelectedDriverId('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && vehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">تخصيص مركبة لسائق</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">المركبة المحددة:</h3>
                <p className="text-gray-600">{vehicle.brand} {vehicle.model} - {vehicle.plateNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اختر السائق</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="input-field"
                >
                  <option value="">-- اختر سائق --</option>
                  {availableDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.phone}
                    </option>
                  ))}
                </select>
              </div>

              {availableDrivers.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">لا يوجد سائقين نشطين متاحين حالياً</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleAssign} 
                  className="flex-1 btn-primary py-3"
                  disabled={!selectedDriverId}
                >
                  تخصيص المركبة
                </button>
                <button onClick={onClose} className="flex-1 btn-secondary py-3">
                  إلغاء
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AssignVehicleModal;
