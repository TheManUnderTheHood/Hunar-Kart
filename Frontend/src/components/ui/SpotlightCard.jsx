import { useState, useEffect, useRef } from 'react';

const SpotlightCard = ({ children, className = '' }) => {
    const cardRef = useRef(null);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        const cardElement = cardRef.current;
        if (!cardElement) return;

        const handleMouseMove = (e) => {
            const rect = cardElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            cardElement.style.setProperty('--mouse-x', `${x}px`);
            cardElement.style.setProperty('--mouse-y', `${y}px`);
        };

        const handleMouseEnter = () => setOpacity(1);
        const handleMouseLeave = () => setOpacity(0);
        
        cardElement.addEventListener('mousemove', handleMouseMove);
        cardElement.addEventListener('mouseenter', handleMouseEnter);
        cardElement.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            cardElement.removeEventListener('mousemove', handleMouseMove);
            cardElement.removeEventListener('mouseenter', handleMouseEnter);
            cardElement.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div 
            ref={cardRef}
            className={`
                relative rounded-xl bg-slate-800/80 p-6 shadow-xl backdrop-blur-sm
                transition-all duration-300 group
                before:absolute before:-inset-px before:rounded-xl 
                before:border before:border-slate-700
                ${className}
            `}
            style={{ '--mouse-x': '0px', '--mouse-y': '0px' }} // Initial CSS variables
        >
            <div
                className="absolute -inset-px rounded-xl transition-opacity duration-300 group-hover:opacity-100"
                style={{ opacity, 'background': 'radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(var(--color-sky-500-rgb), 0.15), transparent 80%)' }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
};

export default SpotlightCard;