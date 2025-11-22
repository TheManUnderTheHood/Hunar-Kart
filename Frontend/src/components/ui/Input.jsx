// Input component
const Input = ({ id, type = "text", placeholder, className = '', ...props }) => {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      
      // Base styling for consistent UI across the platform
      className={`
        block w-full rounded-md border-0 bg-background-offset/50 py-2.5 px-4 text-text-primary 
        shadow-sm ring-1 ring-inset ring-border placeholder:text-text-secondary/60
        transition-all duration-300
        focus:bg-background-offset focus:ring-2 focus:ring-inset focus:ring-primary
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
      {...props}
    />
  );
};
export default Input;
