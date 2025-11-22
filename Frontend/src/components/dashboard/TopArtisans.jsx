import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { User, Award, TrendingUp } from 'lucide-react';

const TopArtisans = React.memo(({ sales = [], artisans = [], isLoading = false, error = null, maxArtisans = 5 }) => {
    // Memoize the top artisans calculation for better performance
    const topArtisans = useMemo(() => {
        if (!sales.length || !artisans.length) return [];

        // Create a map for faster artisan lookup
        const artisanMap = new Map(artisans.map(artisan => [artisan._id, artisan]));
        
        // Accumulate revenue and sales count per artisan
        const artisanRevenue = sales.reduce((acc, sale) => {
            try {
                const artisanId = sale?.artisanID?._id;
                if (!artisanId || typeof sale.totalRevenue !== 'number') return acc;
                // Initialize entry if not present
                if (!acc[artisanId]) {
                    const artisan = artisanMap.get(artisanId);
                    acc[artisanId] = {
                        id: artisanId,
                        name: artisan?.name || 'Unknown Artisan',
                        revenue: 0,
                        salesCount: 0,
                        averageOrderValue: 0,
                    };
                }

                //Update revenue and counts
                acc[artisanId].revenue += sale.totalRevenue;
                acc[artisanId].salesCount += 1;
                acc[artisanId].averageOrderValue = acc[artisanId].revenue / acc[artisanId].salesCount;
                
                return acc;
            } catch (err) {
                console.warn('Error processing sale data:', err, sale);
                return acc;
            }
        }, {});

        // Convert to array, sort by revenue, and take the top N
        return Object.values(artisanRevenue)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, maxArtisans);
    }, [sales, artisans, maxArtisans]);

    // Memoize currency formatter
    const formatToINR = useMemo(() => 
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }),
        []
    );

    // Loading state
    if (isLoading) {
        return (
            <Card className="col-span-1" role="status" aria-label="Loading top performing artisans">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Award className="text-amber-400" aria-hidden="true" />
                    Top Performing Artisans
                </h2>
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-3 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-background-offset rounded-full"></div>
                                <div>
                                    <div className="h-4 bg-background-offset rounded w-24 mb-1"></div>
                                    <div className="h-3 bg-background-offset rounded w-16"></div>
                                </div>
                            </div>
                            <div className="h-4 bg-background-offset rounded w-20"></div>
                        </div>
                    ))}
                </div>
                <span className="sr-only">Loading artisan data...</span>
            </Card>
        );
    }

    // UI : Error state
    if (error) {
        return (
            <Card className="col-span-1" role="alert">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Award className="text-amber-400" aria-hidden="true" />
                    Top Performing Artisans
                </h2>
                <div className="text-center py-8">
                    <p className="text-sm text-red-600 mb-2">
                        {typeof error === 'string' ? error : 'Unable to load artisan data'}
                    </p>
                    <p className="text-xs text-text-secondary">
                        Please try refreshing the page or contact support if the problem persists.
                    </p>
                </div>
            </Card>
        );
    }

    // UI : Empty state
    if (!topArtisans.length) {
        return (
            <Card className="col-span-1">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Award className="text-amber-400" aria-hidden="true" />
                    Top Performing Artisans
                </h2>
                <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-text-secondary mx-auto mb-3" aria-hidden="true" />
                    <p className="text-sm text-text-secondary mb-1">No sales data available</p>
                    <p className="text-xs text-text-secondary">
                        Artisan rankings will appear here once sales are recorded.
                    </p>
                </div>
            </Card>
        );
    }

    // MAIN UI : Ranked list Artisan list
    return (
        <Card className="col-span-1">
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Award className="text-amber-400" aria-hidden="true" />
                Top Performing Artisans
                <span className="text-sm font-normal text-text-secondary ml-auto">
                    Top {topArtisans.length}
                </span>
            </h2>
            
            <div className="space-y-2" role="list">
                {topArtisans.map((artisan, index) => (
                    <article 
                        key={artisan.id} 
                        className="flex items-center justify-between p-3 hover:bg-background-offset rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border-subtle"
                        role="listitem"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="relative">
                                <div className="p-2 bg-background-offset rounded-full">
                                    <User className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                                </div>
                                {index < 3 && (
                                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white ${
                                        index === 0 ? 'bg-yellow-500' : 
                                        index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                                    }`}>
                                        {index + 1}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link 
                                    to={`/artisans/${artisan.id}`} 
                                    className="font-medium text-text-primary hover:text-primary transition-colors truncate block"
                                    title={artisan.name}
                                >
                                    {artisan.name}
                                </Link>
                                <div className="flex items-center gap-3 text-xs text-text-secondary">
                                    <span>{artisan.salesCount} sales</span>
                                    <span>•</span>
                                    <span title={`Average order value: ${formatToINR.format(artisan.averageOrderValue)}`}>
                                        Avg: {formatToINR.format(artisan.averageOrderValue)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-text-primary">
                                {formatToINR.format(artisan.revenue)}
                            </div>
                            <div className="text-xs text-text-secondary">
                                Total Revenue
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {sales.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border-subtle">
                    <p className="text-xs text-text-secondary text-center">
                        Ranked by total revenue from {sales.length} sales transactions
                    </p>
                </div>
            )}
        </Card>
    );
});

TopArtisans.displayName = 'TopArtisans';

// Prop Validation for component inputs
TopArtisans.propTypes = {
    sales: PropTypes.arrayOf(
        PropTypes.shape({
            artisanID: PropTypes.shape({
                _id: PropTypes.string.isRequired,
            }),
            totalRevenue: PropTypes.number,
        })
    ),
    artisans: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        })
    ),
    isLoading: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    maxArtisans: PropTypes.number,
};

export default TopArtisans;
