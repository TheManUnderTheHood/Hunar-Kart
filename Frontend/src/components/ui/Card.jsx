import { forwardRef } from 'react';

// Enhanced Card Component
const Card = forwardRef(({ 
    children, 
    className = '',
    padding = 'md',
    shadow = 'md',
    border = true,
    hover = false,
    clickable = false,
    background = 'card',
    as: Component = 'div',
    ...props 
}, ref) => {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
    };

    const shadowClasses = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-lg dark:shadow-black/20',
        lg: 'shadow-xl dark:shadow-black/25',
        xl: 'shadow-2xl dark:shadow-black/30'
    };

    const backgroundClasses = {
        card: 'bg-card',
        background: 'bg-background',
        muted: 'bg-muted',
        accent: 'bg-accent',
        transparent: 'bg-transparent'
    };

    const baseClasses = `
        relative rounded-xl
        ${border ? 'border border-border' : ''}
        ${backgroundClasses[background] || backgroundClasses.card}
        ${paddingClasses[padding] || paddingClasses.md}
        ${shadowClasses[shadow] || shadowClasses.md}
        ${hover ? 'transition-all duration-200 hover:shadow-xl hover:scale-[1.02]' : ''}
        ${clickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2' : ''}
    `.trim();

    const combinedClasses = `${baseClasses} ${className}`.trim();

    return (
        <Component 
            ref={ref}
            className={combinedClasses}
            tabIndex={clickable ? 0 : undefined}
            role={clickable ? 'button' : undefined}
            onKeyDown={clickable ? (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && props.onClick) {
                    e.preventDefault();
                    props.onClick(e);
                }
            } : undefined}
            {...props}
        >
            <div className="relative z-10">{children}</div>
        </Component>
    );
});

Card.displayName = 'Card';

// Card sub-components for better composition
const CardHeader = forwardRef(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`flex flex-col space-y-1.5 pb-6 ${className}`}
        {...props}
    />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef(({ className = '', as: Component = 'h3', ...props }, ref) => (
    <Component
        ref={ref}
        className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef(({ className = '', ...props }, ref) => (
    <p
        ref={ref}
        className={`text-sm text-muted-foreground ${className}`}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`${className}`}
        {...props}
    />
));
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`flex items-center pt-6 ${className}`}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';

// Attach sub-components to Card
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;