const Table = ({ headers, data, renderRow }) => {
    return (
        <div className="overflow-hidden border rounded-lg border-border bg-card shadow-lg dark:shadow-black/20">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-offset/50 dark:bg-background-offset/20">
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-text-secondary uppercase">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.length > 0 ? ( data.map(renderRow) ) : (
                            <tr><td colSpan={headers.length} className="px-6 py-16 text-center text-text-secondary">No data found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default Table;