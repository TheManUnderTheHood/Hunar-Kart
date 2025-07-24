import { useState } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, ArrowUpDown, Package, Sparkles } from 'lucide-react';

const Table = ({ headers, data, renderRow, searchable = true, sortable = true, title, subtitle }) => {
    const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredRow, setHoveredRow] = useState(null);

    // Enhanced sorting logic
    const handleSort = (field, index) => {
        if (!sortable) return;
        
        const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ field, direction, index });
    };

    // Get sorted data
    const sortedData = sortConfig.field 
        ? [...data].sort((a, b) => {
            const aValue = a[sortConfig.field] || '';
            const bValue = b[sortConfig.field] || '';
            
            if (sortConfig.direction === 'asc') {
                return aValue.toString().localeCompare(bValue.toString());
            }
            return bValue.toString().localeCompare(aValue.toString());
        })
        : data;

    // Get filtered data
    const filteredData = searchTerm 
        ? sortedData.filter(item => 
            Object.values(item).some(value => 
                value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        : sortedData;

    const getSortIcon = (index) => {
        if (sortConfig.index !== index) return <ArrowUpDown className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />;
        return sortConfig.direction === 'asc' ? 
            <ChevronUp className="h-4 w-4 text-primary" /> : 
            <ChevronDown className="h-4 w-4 text-primary" />;
    };

    return (
        <div className="space-y-6">
            {/* Enhanced header section */}
            {(title || searchable) && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {title && (
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                                <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
                                {subtitle && (
                                    <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {searchable && (
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background-offset border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            />
                            {searchTerm && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="text-text-secondary hover:text-text-primary transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Enhanced table container */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/95 to-card/80 shadow-xl shadow-black/5 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Results count */}
                {searchTerm && (
                    <div className="px-6 py-3 bg-primary/5 border-b border-border/30">
                        <p className="text-sm text-text-secondary">
                            {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} found for "{searchTerm}"
                        </p>
                    </div>
                )}
                
                <div className="relative overflow-x-auto">
                    <table className="w-full">
                        {/* Enhanced header */}
                        <thead className="bg-gradient-to-r from-background-offset/80 to-background-offset/60 backdrop-blur-sm border-b border-border/30">
                            <tr>
                                {headers.map((header, index) => (
                                    <th 
                                        key={index} 
                                        scope="col" 
                                        className={`group/header px-6 py-4 text-left ${sortable ? 'cursor-pointer select-none' : ''} transition-all duration-200 hover:bg-primary/5`}
                                        onClick={() => sortable && handleSort(header.toLowerCase(), index)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold tracking-wider text-text-secondary uppercase group-hover/header:text-text-primary transition-colors">
                                                {header}
                                            </span>
                                            {sortable && getSortIcon(index)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        
                        {/* Enhanced body */}
                        <tbody className="divide-y divide-border/30">
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <tr 
                                        key={index}
                                        className="group/row transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:shadow-sm"
                                        onMouseEnter={() => setHoveredRow(index)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                    >
                                        {renderRow(item, index, hoveredRow === index)}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={headers.length} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full">
                                                <Package className="h-8 w-8 text-primary/60" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-lg font-semibold text-text-primary mb-2">
                                                    {searchTerm ? 'No matching records found' : 'No data available'}
                                                </h3>
                                                <p className="text-text-secondary">
                                                    {searchTerm 
                                                        ? `Try adjusting your search term "${searchTerm}"` 
                                                        : 'There are no records to display at the moment.'}
                                                </p>
                                                {searchTerm && (
                                                    <button
                                                        onClick={() => setSearchTerm('')}
                                                        className="mt-3 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors duration-200"
                                                    >
                                                        Clear search
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Enhanced footer with stats */}
                {filteredData.length > 0 && (
                    <div className="px-6 py-3 bg-background-offset/30 border-t border-border/30 flex items-center justify-between text-sm text-text-secondary">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary/60" />
                            <span>Showing {filteredData.length} of {data.length} records</span>
                        </div>
                        {sortConfig.field && (
                            <div className="flex items-center gap-2">
                                <span>Sorted by {headers[sortConfig.index]}</span>
                                {sortConfig.direction === 'asc' ? 
                                    <ChevronUp className="h-4 w-4" /> : 
                                    <ChevronDown className="h-4 w-4" />
                                }
                            </div>
                        )}
                    </div>
                )}

                {/* Subtle animated border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-[1px] rounded-2xl bg-card/95"></div>
                </div>
            </div>
        </div>
    );
};

export default Table;