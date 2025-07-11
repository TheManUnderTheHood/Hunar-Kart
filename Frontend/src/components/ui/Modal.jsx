import { X } from 'lucide-react';
import Card from './Card';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-lg"
                onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
            >
                <Card className="max-h-[80vh] flex flex-col">
                    <div className="flex items-start justify-between pb-4 border-b border-slate-700">
                        <h2 className="text-xl font-semibold text-white">{title}</h2>
                        <button 
                            onClick={onClose}
                            className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="mt-4 flex-1 overflow-y-auto">
                        {children}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Modal;