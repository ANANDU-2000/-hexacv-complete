import React from 'react';
import { X, AlertCircle, Wifi, FileText, CreditCard } from 'lucide-react';

export interface ErrorNotificationProps {
    type: 'network' | 'ai' | 'pdf' | 'payment' | 'validation' | 'generic';
    title: string;
    message: string;
    action?: {
        label: string;
        handler: () => void;
    };
    onDismiss: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
    type,
    title,
    message,
    action,
    onDismiss
}) => {
    const getIcon = () => {
        switch (type) {
            case 'network':
                return <Wifi size={20} />;
            case 'pdf':
                return <FileText size={20} />;
            case 'payment':
                return <CreditCard size={20} />;
            default:
                return <AlertCircle size={20} />;
        }
    };

    const getColorClasses = () => {
        switch (type) {
            case 'network':
                return 'bg-orange-50 border-orange-200 text-orange-900';
            case 'ai':
                return 'bg-blue-50 border-blue-200 text-blue-900';
            case 'payment':
                return 'bg-red-50 border-red-200 text-red-900';
            case 'validation':
                return 'bg-amber-50 border-amber-200 text-amber-900';
            default:
                return 'bg-red-50 border-red-200 text-red-900';
        }
    };

    return (
        <div
            className={`fixed top-4 right-4 z-[9999] max-w-md p-4 rounded-lg border-2 shadow-lg animate-in slide-in-from-top-2 duration-300 ${getColorClasses()}`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>
                
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold mb-1">{title}</h4>
                    <p className="text-xs leading-relaxed">{message}</p>
                    
                    {action && (
                        <button
                            onClick={action.handler}
                            className="mt-3 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-all"
                        >
                            {action.label}
                        </button>
                    )}
                </div>
                
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
                    aria-label="Dismiss"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default ErrorNotification;
