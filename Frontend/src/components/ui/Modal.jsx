import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {

    useEffect(() => {
        if (isOpen) {

            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isOpen]); 

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
                <div className="relative max-h-[80vh] flex flex-col rounded-xl bg-background p-6 shadow-xl border border-border">
                    <div className="flex items-start justify-between pb-4 border-b border-border">
                        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
                        <button 
                            onClick={onClose}
                            className="p-1 rounded-full text-text-secondary hover:bg-background-offset hover:text-text-primary transition-colors"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="mt-4 flex-1 overflow-y-auto pr-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;