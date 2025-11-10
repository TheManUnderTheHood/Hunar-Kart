    import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    } from "recharts";
    import Card from "../ui/Card";
    import useTheme from "../../hooks/useTheme"; // We still need this to know the current theme

    const SalesChart = ({ data }) => {
    const { theme } = useTheme(); // Get the current theme: 'light' or 'dark'

    // --- NEW: Define explicit color schemes in JavaScript ---
    // These hex codes match the slate colors from your tailwind.css for perfect consistency.
    const lightModeColors = {
        grid: "#e2e8f0", // slate-200
        text: "#64748b", // slate-500
        fill: "#0ea5e9", // sky-500
        background: "#ffffff", // white
        textPrimary: "#1e293b", // slate-800
        hoverFill: "#0ea5e91a", // sky-500 with 10% opacity
    };

    const darkModeColors = {
        grid: "#334155", // slate-700
        text: "#94a3b8", // slate-400
        fill: "#0ea5e9", // sky-500
        background: "#1e293b", // slate-800
        textPrimary: "#f8fafc", // slate-50
        hoverFill: "#0ea5e91a", // sky-500 with 10% opacity
    };

    // Select the correct color scheme based on the current theme
    const currentChartColors =
        theme === "light" ? lightModeColors : darkModeColors;

    // Data processing logic remains the same
    const chartData = data.reduce((acc, sale) => {
        const month = new Date(sale.date).toLocaleString("default", {
        month: "short",
        year: "numeric",
        });
        const existingMonth = acc.find((item) => item.name === month);
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
        <h2 className="text-xl font-semibold text-text-primary mb-4">
            Monthly Revenue (₹)
        </h2>
        {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
                {/* Apply the correct colors directly from our JS object */}
                <CartesianGrid
                strokeDasharray="3 3"
                stroke={currentChartColors.grid}
                />
                <XAxis
                dataKey="name"
                stroke={currentChartColors.text}
                fontSize={12}
                />
                <YAxis
                stroke={currentChartColors.text}
                fontSize={12}
                tickFormatter={(value) =>
                    `₹${new Intl.NumberFormat("en-IN").format(value)}`
                }
                />
                <Tooltip
                cursor={{ fill: currentChartColors.hoverFill }}
                contentStyle={{
                    background: currentChartColors.background,
                    border: `1px solid ${currentChartColors.grid}`,
                    borderRadius: "0.5rem",
                    color: currentChartColors.textPrimary,
                    boxShadow:
                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: currentChartColors.text }}
                formatter={(value) =>
                    new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    minimumFractionDigits: 0,
                    }).format(value)
                }
                />
                <Legend
                wrapperStyle={{
                    fontSize: "14px",
                    color: currentChartColors.text,
                }}
                />
                <Bar
                dataKey="Revenue"
                fill={currentChartColors.fill}
                radius={[4, 4, 0, 0]}
                />
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
