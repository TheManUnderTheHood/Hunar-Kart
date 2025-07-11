const Card = ({ children, className = '' }) => {
  return (
    <div 
      className={`
        relative rounded-xl bg-slate-800/80 p-6 shadow-xl backdrop-blur-sm
        transition-all duration-300 hover:shadow-primary/20 
        before:absolute before:-inset-px before:rounded-xl 
        before:border before:border-slate-700 before:transition-all before:duration-300
        hover:before:border-primary/50
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;