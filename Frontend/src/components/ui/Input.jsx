const Input = ({ id, type = "text", placeholder, className = '', ...props }) => {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      className={`block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-4 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6 ${className}`}
      {...props}
    />
  );
};

export default Input;