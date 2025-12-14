import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTruck, FiCalendar } from 'react-icons/fi';

const ContractTypeModal = ({ isOpen, onClose, onSelectType }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">إضافة عقد جديد</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">اختر نوع العقد الذي تريد إنشاءه</p>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectType('ownership')}
                  className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-shadow"
                >
                  <FiTruck className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-lg font-bold">عقد تمليك</h3>
                  <p className="text-sm opacity-90 mt-1">تمليك مركبة لسائق بأقساط</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectType('rental')}
                  className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-shadow"
                >
                  <FiCalendar className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-lg font-bold">عقد إيجار</h3>
                  <p className="text-sm opacity-90 mt-1">إيجار مركبة بدفعات دورية</p>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContractTypeModal;
