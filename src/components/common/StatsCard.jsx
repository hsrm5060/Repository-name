import { motion } from 'framer-motion';

const StatsCard = ({ icon: Icon, label, value, color, trend, trendValue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`${color} p-4 rounded-xl shadow-lg`}>
          <Icon className="text-white text-2xl" />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${color} opacity-50`}></div>
    </motion.div>
  );
};

export default StatsCard;
