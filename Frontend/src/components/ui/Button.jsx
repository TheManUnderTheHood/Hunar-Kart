import { forwardRef } from 'react';
import Spinner from "./Spinner";

// Enhanced Button Component
const Button = forwardRef(({ 
    children, 
    variant = 'primary', 
    size = 'md',
    loading = false, 
    loadingText,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = '', 
    type = 'button',
    ...props 
}, ref) => {
    const variantClasses = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary/20',
        ghost: 'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-accent/20',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/20',
        outline: 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-accent/20',
        link: 'text-primary underline-offset-4 hover:underline focus:ring-primary/20 bg-transparent'
    };

    const sizeClasses = {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8 text-lg',
        icon: 'h-10 w-10'
    };

    const getLoadingText = () => {
        if (loadingText) return loadingText;
        
        // Auto-detect based on children text
        if (typeof children === 'string') {
            const text = children.toLowerCase();
            if (text.includes('delete') || text.includes('remove')) return 'Deleting...';
            if (text.includes('save') || text.includes('update')) return 'Saving...';
            if (text.includes('create') || text.includes('add')) return 'Creating...';
            if (text.includes('submit')) return 'Submitting...';
            if (text.includes('send')) return 'Sending...';
            if (text.includes('upload')) return 'Uploading...';
            if (text.includes('download')) return 'Downloading...';
            if (text.includes('login') || text.includes('sign in')) return 'Signing in...';
            if (text.includes('logout') || text.includes('sign out')) return 'Signing out...';
        }
        return 'Loading...';
    };

    const isDisabled = loading || disabled;
    
    const baseClasses = `
        inline-flex items-center justify-center whitespace-nowrap rounded-md 
        font-medium ring-offset-background transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'cursor-wait' : isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    `.trim();

    const combinedClasses = `
        ${baseClasses}
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
    `.trim();

    return (
        <button 
            ref={ref}
            type={type}
            className={combinedClasses}
            disabled={isDisabled}
            aria-busy={loading}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" className="animate-spin" />
                    <span>{getLoadingText()}</span>
                </div>
            ) : (
                <>
                    {leftIcon && <span className="mr-2">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="ml-2">{rightIcon}</span>}
                </>
            )}
        </button>
    );
});

Button.displayName = 'Button';

// Button group component for related actions
const ButtonGroup = forwardRef(({ 
    children, 
    className = '',
    orientation = 'horizontal',
    size = 'md',
    variant = 'primary',
    ...props 
}, ref) => {
    const orientationClasses = {
        horizontal: 'flex-row [&>button:not(:first-child)]:ml-0 [&>button:not(:first-child)]:rounded-l-none [&>button:not(:last-child)]:rounded-r-none [&>button:not(:first-child)]:border-l-0',
        vertical: 'flex-col [&>button:not(:first-child)]:mt-0 [&>button:not(:first-child)]:rounded-t-none [&>button:not(:last-child)]:rounded-b-none [&>button:not(:first-child)]:border-t-0'
    };

    return (
        <div
            ref={ref}
            className={`inline-flex ${orientationClasses[orientation]} ${className}`}
            role="group"
            {...props}
        >
            {children}
        </div>
    );
});

ButtonGroup.displayName = 'ButtonGroup';

export { ButtonGroup };
export default Button;