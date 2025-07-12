import { AlertCircle } from 'lucide-react';

const FormError = ({ message }) => {
    if (!message) return null;

    return (
        <p className="flex items-center gap-1.5 mt-1.5 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            {message}
        </p>
    );
};

export default FormError;