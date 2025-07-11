const Spinner = ({ size = "md" }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-16 w-16',
    }

    return (
        <div 
            className={`animate-spin rounded-full border-b-2 border-t-2 border-primary ${sizeClasses[size]}`}
            role="status"
            aria-label="loading"
        />
    )
}

export default Spinner