const Card = ({ children, className = '' }) => {
  return (
    <div 
      className={`
        relative rounded-xl bg-card p-6 shadow-lg dark:shadow-black/20
        border border-border
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};
export default Card;