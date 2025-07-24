import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { User, Award } from 'lucide-react';

const TopArtisans = React.memo(({ sales, artisans, isLoading, error }) => {
    // Calculate revenue per artisan
    const artisanRevenue = sales.reduce((acc, sale) => {
        const artisanId = sale.artisanID._id;
        if (!acc[artisanId]) {
            // Find the artisan's name from the artisans list
            const artisan = artisans.find(a => a._id === artisanId);
            acc[artisanId] = {
                id: artisanId,
                name: artisan ? artisan.name : 'Unknown Artisan',
                revenue: 0,
                salesCount: 0,
            };
        }
        acc[artisanId].revenue += sale.totalRevenue;
        acc[artisanId].salesCount += 1;
        return acc;
    }, {});

    // Convert to array, sort by revenue, and take the top 5
    const topArtisans = Object.values(artisanRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    const formatToINR = (num) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(num);

    if (isLoading) {
        return (
            <Card className="col-span-1">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Award className="text-amber-400" />
                    Loading Top Performing Artisans...
                </h2>
                <p className="text-sm text-text-secondary text-center py-8">Please wait while we load the data.</p>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="col-span-1">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Award className="text-amber-400" />
                    Error Loading Top Performing Artisans
                </h2>
                <p className="text-sm text-text-secondary text-center py-8">There was an error loading the data. Please try again later.</p>
            </Card>
        );
    }

    return (
        <Card className="col-span-1">
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Award className="text-amber-400" />
                Top Performing Artisans
            </h2>
            <div className="space-y-4">
                {topArtisans.length > 0 ? (
                    topArtisans.map((artisan) => (
                        <div key={artisan.id} className="flex items-center justify-between p-3 hover:bg-background-offset rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-background-offset rounded-full">
                                    <User className="h-5 w-5 text-text-secondary" aria-label="User icon" />
                                </div>
                                <div>
                                    <Link to={`/artisans/${artisan.id}`} className="font-medium text-text-primary hover:underline">
                                        {artisan.name}
                                    </Link>
                                    <p className="text-xs text-text-secondary">{artisan.salesCount} sales</p>
                                </div>
                            </div>
                            <div className="font-semibold text-text-primary">
                                {formatToINR(artisan.revenue)}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-text-secondary text-center py-8">
                        No sales data available to rank artisans. Please check back later.
                    </p>
                )}
            </div>
        </Card>
    );
});

TopArtisans.propTypes = {
    sales: PropTypes.arrayOf(
        PropTypes.shape({
            artisanID: PropTypes.shape({
                _id: PropTypes.string.isRequired,
            }).isRequired,
            totalRevenue: PropTypes.number.isRequired,
        })
    ).isRequired,
    artisans: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
    isLoading: PropTypes.bool,
    error: PropTypes.bool,
};

TopArtisans.defaultProps = {
    isLoading: false,
    error: false,
};

export default TopArtisans;
