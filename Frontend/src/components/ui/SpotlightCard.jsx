import { useEffect, useRef, useCallback, useState } from 'react';

const SpotlightCard = ({ 
    children, 
    className = '', 
    spotlightColor = 'rgba(14, 165, 233, 0.15)',
    spotlightSize = 350,
    intensity = 0.15,
    animationDuration = 300,
    borderGlow = false,
    disabled = false,
    onClick,
    ...rest 
}) => {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const animationFrameRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        if (disabled) return;
        
        const cardElement = cardRef.current;
        if (!cardElement) return;

        // Cancel any pending animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        // Use RAF for smooth performance
        animationFrameRef.current = requestAnimationFrame(() => {
            const rect = cardElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            cardElement.style.setProperty('--mouse-x', `${x}px`);
            cardElement.style.setProperty('--mouse-y', `${y}px`);
        });
    }, [disabled]);

    const handleMouseEnter = useCallback(() => {
        if (!disabled) {
            setIsHovered(true);
        }
    }, [disabled]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        // Clean up any pending animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    useEffect(() => {
        const cardElement = cardRef.current;
        if (!cardElement || disabled) return;

        cardElement.addEventListener('mousemove', handleMouseMove, { passive: true });
        cardElement.addEventListener('mouseenter', handleMouseEnter, { passive: true });
        cardElement.addEventListener('mouseleave', handleMouseLeave, { passive: true });

        return () => {
            cardElement.removeEventListener('mousemove', handleMouseMove);
            cardElement.removeEventListener('mouseenter', handleMouseEnter);
            cardElement.removeEventListener('mouseleave', handleMouseLeave);
            
            // Clean up animation frame on unmount
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [handleMouseMove, handleMouseEnter, handleMouseLeave, disabled]);

    // Generate CSS custom properties for dynamic styling
    const dynamicStyles = {
        '--spotlight-color': spotlightColor,
        '--spotlight-size': `${spotlightSize}px`,
        '--animation-duration': `${animationDuration}ms`,
        '--mouse-x': '50%',
        '--mouse-y': '50%'
    };

    const baseClasses = `
        relative rounded-xl bg-card/80 p-6 shadow-xl backdrop-blur-sm group
        border border-border transition-all duration-${animationDuration}
        ${disabled ? 'cursor-default' : onClick ? 'cursor-pointer' : ''}
        ${!disabled ? 'hover:shadow-2xl hover:scale-[1.02]' : ''}
        ${className}
    `.trim();

    return (
        <div 
            ref={cardRef}
            className={baseClasses}
            style={dynamicStyles}
            onClick={disabled ? undefined : onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick && !disabled ? 0 : undefined}
            onKeyDown={onClick && !disabled ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(e);
                }
            } : undefined}
            aria-disabled={disabled}
            {...rest}
        >
            {/* Main spotlight effect */}
            <div
                className={`
                    absolute -inset-px rounded-xl transition-opacity
                    ${disabled ? 'opacity-0' : isHovered ? 'opacity-100' : 'opacity-0'}
                `}
                style={{ 
                    background: `radial-gradient(var(--spotlight-size) circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 80%)`,
                    transitionDuration: `var(--animation-duration)`
                }}
            />
            
            {/* Optional border glow effect */}
            {borderGlow && !disabled && (
                <div
                    className={`
                        absolute -inset-[1px] rounded-xl transition-opacity
                        ${isHovered ? 'opacity-60' : 'opacity-0'}
                    `}
                    style={{ 
                        background: `radial-gradient(var(--spotlight-size) circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 60%)`,
                        transitionDuration: `var(--animation-duration)`,
                        filter: 'blur(1px)'
                    }}
                />
            )}
            
            {/* Content container */}
            <div className="relative z-10">
                {children}
            </div>
            
            {/* Optional loading state overlay */}
            {disabled && (
                <div className="absolute inset-0 rounded-xl bg-card/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
                    <div className="text-muted-foreground text-sm">Loading...</div>
                </div>
            )}
        </div>
    );
};

// Preset variants for common use cases
SpotlightCard.variants = {
    primary: {
        spotlightColor: 'rgba(14, 165, 233, 0.15)', // Blue
        borderGlow: true
    },
    success: {
        spotlightColor: 'rgba(34, 197, 94, 0.15)', // Green
        borderGlow: true
    },
    warning: {
        spotlightColor: 'rgba(251, 191, 36, 0.15)', // Yellow
        borderGlow: true
    },
    danger: {
        spotlightColor: 'rgba(239, 68, 68, 0.15)', // Red
        borderGlow: true
    },
    purple: {
        spotlightColor: 'rgba(147, 51, 234, 0.15)', // Purple
        borderGlow: true
    },
    subtle: {
        spotlightColor: 'rgba(100, 116, 139, 0.1)', // Gray
        spotlightSize: 250,
        intensity: 0.1
    }
};

export default SpotlightCard;