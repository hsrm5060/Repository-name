import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ 
  icon: Icon = FiInbox, 
  title, 
  description, 
  action,
  actionLabel,
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <Icon className="text-4xl text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">{description}</p>
      {(action || (actionLabel && onAction)) && (
        <button 
          onClick={action?.onClick || onAction} 
          className="btn-primary px-6 py-2 rounded-lg"
        >
          {action?.label || actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
