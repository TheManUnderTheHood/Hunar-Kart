import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-lg"
                style={{ animation: 'scaleIn 0.2s ease-out' }}
                onClick={(e) => e.stopPropagation()} 
            >
                <div 
                    className="
                      relative max-h-[80vh] flex flex-col rounded-xl bg-slate-800/90 p-6 shadow-xl backdrop-blur-md
                      border border-slate-700
                    "
                >
                    <div className="flex items-start justify-between pb-4 border-b border-slate-700">
                        <h2 className="text-xl font-semibold text-white">{title}</h2>
                        <button 
                            onClick={onClose}
                            className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="mt-4 flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;