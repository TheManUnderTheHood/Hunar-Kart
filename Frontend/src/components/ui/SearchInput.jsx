import { Search } from 'lucide-react';

const SearchInput = ({ value, onChange, placeholder, className = '' }) => {
    return (
        <div className={`relative w-full max-w-sm ${className}`}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder || 'Search...'}
                className="block w-full rounded-md border-0 bg-slate-900/50 py-2.5 pl-10 pr-4 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 transition-all duration-300 focus:bg-slate-900 focus:ring-2 focus:ring-inset focus:ring-primary-focus"
            />
        </div>
    );
};

export default SearchInput;