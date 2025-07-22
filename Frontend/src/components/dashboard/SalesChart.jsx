import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';

const SalesChart = ({ data }) => {
    
    const chartData = data.reduce((acc, sale) => {
        const month = new Date(sale.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        const existingMonth = acc.find(item => item.name === month);
        if (existingMonth) {
            existingMonth.Revenue += sale.totalRevenue;
        } else {
            acc.push({ name: month, Revenue: sale.totalRevenue });
        }
        return acc;
    }, []);
    
    chartData.sort((a, b) => new Date(`01 ${a.name}`) - new Date(`01 ${b.name}`));

    return (
        <Card className="col-span-1 lg:col-span-3">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Monthly Revenue (₹)</h2>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
                        <XAxis dataKey="name" stroke="var(--theme-text-secondary)" fontSize={12} />
                        <YAxis 
                            stroke="var(--theme-text-secondary)" 
                            fontSize={12} 
                            tickFormatter={(value) => `₹${new Intl.NumberFormat('en-IN').format(value)}`} 
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--color-primary) / 0.1)' }}
                            contentStyle={{
                                background: 'var(--theme-background-offset)',
                                border: '1px solid var(--theme-border)',
                                borderRadius: '0.5rem',
                                color: 'var(--theme-text-primary)',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            }}
                            labelStyle={{ color: 'var(--theme-text-secondary)' }}
                            formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value)}
                        />
                        <Legend wrapperStyle={{fontSize: "14px", color: "var(--theme-text-secondary)"}} />
                        <Bar dataKey="Revenue" fill="hsl(var(--color-primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-[300px] text-text-secondary">
                    Not enough data to display chart.
                </div>
            )}
        </Card>
    );
};

export default SalesChart;