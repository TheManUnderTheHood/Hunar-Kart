import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import useTheme from '../../hooks/useTheme';

const SalesChart = ({ data }) => {
    const { theme } = useTheme();
    const [chartColors, setChartColors] = useState({ grid: '', text: '', fill: '' });

    useEffect(() => {
        const rootStyles = getComputedStyle(document.documentElement);
        setChartColors({
            grid: `hsl(${rootStyles.getPropertyValue('--theme-border').trim()})`,
            text: `hsl(${rootStyles.getPropertyValue('--theme-text-secondary').trim()})`,
            fill: `hsl(${rootStyles.getPropertyValue('--color-primary').trim()})`,
            background: `hsl(${rootStyles.getPropertyValue('--theme-background-offset').trim()})`,
            textPrimary: `hsl(${rootStyles.getPropertyValue('--theme-text-primary').trim()})`
        });
    }, [theme]);
    
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
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                        <XAxis dataKey="name" stroke={chartColors.text} fontSize={12} />
                        <YAxis stroke={chartColors.text} fontSize={12} tickFormatter={(value) => `₹${new Intl.NumberFormat('en-IN').format(value)}`} />
                        <Tooltip
                            cursor={{ fill: 'hsla(var(--color-primary), 0.1)' }}
                            contentStyle={{
                                background: chartColors.background,
                                border: `1px solid ${chartColors.grid}`,
                                borderRadius: '0.5rem',
                                color: chartColors.textPrimary,
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            }}
                            labelStyle={{ color: chartColors.text }}
                            formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value)}
                        />
                        <Legend wrapperStyle={{fontSize: "14px", color: chartColors.text}} />
                        <Bar dataKey="Revenue" fill={chartColors.fill} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-[300px] text-text-secondary">Not enough data to display chart.</div>
            )}
        </Card>
    );
};
export default SalesChart;