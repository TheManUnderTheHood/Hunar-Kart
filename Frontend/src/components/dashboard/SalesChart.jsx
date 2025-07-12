import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';

const SalesChart = ({ data }) => {
    
    // Process the sales data to be chart-friendly
    const chartData = data.reduce((acc, sale) => {
        const month = new Date(sale.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        
        const existingMonth = acc.find(item => item.name === month);
        
        if (existingMonth) {
            existingMonth.Revenue += sale.totalRevenue;
        } else {
            acc.push({
                name: month,
                Revenue: sale.totalRevenue,
            });
        }
        return acc;
    }, []);
    
    // Optional: Sort data by date for a chronological chart
    chartData.sort((a, b) => {
        const dateA = new Date(`01 ${a.name}`);
        const dateB = new Date(`01 ${b.name}`);
        return dateA - dateB;
    });

    return (
        <Card className="col-span-1 lg:col-span-3">
            <h2 className="text-xl font-semibold text-white mb-4">Monthly Revenue (₹)</h2>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-700)" />
                        <XAxis dataKey="name" stroke="var(--color-slate-400)" fontSize={12} />
                        <YAxis 
                            stroke="var(--color-slate-400)" 
                            fontSize={12} 
                            tickFormatter={(value) => `₹${new Intl.NumberFormat('en-IN').format(value)}`} 
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(var(--color-sky-500-rgb), 0.1)' }}
                            contentStyle={{
                                background: 'var(--color-slate-800)',
                                border: '1px solid var(--color-slate-700)',
                                borderRadius: '0.5rem',
                            }}
                            labelStyle={{ color: 'var(--color-slate-300)' }}
                            formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value)}
                        />
                        <Legend wrapperStyle={{fontSize: "14px"}} />
                        <Bar dataKey="Revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-400">
                    Not enough data to display chart.
                </div>
            )}
        </Card>
    );
};

export default SalesChart;