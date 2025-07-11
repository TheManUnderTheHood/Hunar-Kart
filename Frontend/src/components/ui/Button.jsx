const Button = ({ children, variant = 'primary', ...props }) => {
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        destructive: 'btn-destructive'
    };

    return (
        <button className={variantClasses[variant] || 'btn-primary'} {...props}>
            {children}
        </button>
    );
};

export default Button;