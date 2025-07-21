import { useEffect, useRef } from 'react';

const SpotlightCard = ({ children, className = '' }) => {
    const cardRef = useRef(null);

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
        cardElement.addEventListener('mousemove', handleMouseMove);
        return () => cardElement.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div 
            ref={cardRef}
            className={`
                relative rounded-xl bg-card/80 p-6 shadow-xl backdrop-blur-sm group
                border border-border
                ${className}
            `}
        >
            <div
                className="absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ 'background': 'radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(14, 165, 233, 0.15), transparent 80%)' }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
};

export default SpotlightCard;