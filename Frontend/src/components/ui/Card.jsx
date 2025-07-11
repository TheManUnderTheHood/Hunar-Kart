const Card = ({ children, className = '' }) => {
  return (
    <div className={`rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;