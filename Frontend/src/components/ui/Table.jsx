const Table = ({ headers, data, renderRow }) => {
    return (
        <div className="overflow-hidden rounded-xl bg-card/95 shadow-xl shadow-black/5 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
            {/* Subtle animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-primary/3 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="relative overflow-x-auto">
                <table className="min-w-full divide-y divide-border/30">
                    {/* Enhanced header */}
                    <thead className="bg-gradient-to-r from-background-offset/80 to-background-offset/60 backdrop-blur-sm">
                        <tr>
                            {headers.map((header, index) => (
                                <th 
                                    key={index} 
                                    scope="col" 
                                    className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-text-secondary uppercase transition-colors duration-200 hover:text-text-primary"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    
                    {/* Enhanced body */}
                    <tbody className="bg-card divide-y divide-border/20">
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <tr 
                                    key={index}
                                    className="transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:shadow-sm group"
                                >
                                    {renderRow(item, index)}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m-2 0h2" />
                                            </svg>
                                        </div>
                                        <p className="text-text-secondary font-medium">No data found.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Subtle bottom border effect */}
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        </div>
    );
};

export default Table;