import Spinner from "./Spinner";

const Button = ({ children, variant = 'primary', loading = false, className = '', ...props }) => {
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        destructive: 'btn-destructive'
    };

    const loadingText = () => {
        // Return custom text or default
        if (typeof children === 'string' && children.toLowerCase().includes('delete')) {
            return 'Deleting...';
        }
        if (typeof children === 'string' && children.toLowerCase().includes('save')) {
            return 'Saving...';
        }
        if (typeof children === 'string' && children.toLowerCase().includes('create')) {
            return 'Creating...';
        }
        return 'Processing...';
    };

    return (
        <button 
            className={`${variantClasses[variant] || 'btn-primary'} ${className}`}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    <span>{loadingText()}</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;