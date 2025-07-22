const Card = ({ children, className = '' }) => {
  return (
    <div 
      className={`
        relative rounded-xl bg-card/90 dark:bg-card/80 p-6 shadow-xl backdrop-blur-sm
        border border-border
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default Card;