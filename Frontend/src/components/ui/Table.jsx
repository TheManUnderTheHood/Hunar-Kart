const Table = ({ headers, data, renderRow }) => {
    return (
        <div className="overflow-hidden border rounded-lg border-slate-700">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                        <tr>
                            {headers.map((header) => (
                                <th key={header} scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-slate-300 uppercase">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-slate-800/50 divide-y divide-slate-700">
                        {data.length > 0 ? (
                           data.map(renderRow)
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="px-6 py-4 text-center text-slate-400">
                                    No data found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;