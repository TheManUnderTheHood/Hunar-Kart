import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import useTheme from '../hooks/useTheme';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SpotlightCard from '../components/ui/SpotlightCard';
import ThemeToggle from '../components/ui/ThemeToggle';
import Spinner from '../components/ui/Spinner';
import { Gem, Palette, Users, Globe, ArrowRight, Sparkles, Star, Heart } from 'lucide-react';

// --- Sub-components for better organization ---

const HomePageHeader = () => (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50 shadow-lg">
        <nav className="container mx-auto flex items-center justify-between p-4">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="relative">
                    <Gem className="h-8 w-8 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                    <div className="absolute inset-0 h-8 w-8 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
                </div>
                <span className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors duration-300">HunarKart</span>
            </Link>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link to="/login">
                    <Button variant="primary" className="gap-2 shadow-lg hover:shadow-primary/25 transition-all duration-300 relative overflow-hidden group">
                        <span className="relative z-10">Sign In</span>
                        <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-700"></div>
                    </Button>
                </Link>
            </div>
        </nav>
    </header>
);

const HeroSection = () => (
    <section className="relative pt-32 pb-20 text-center bg-gradient-to-br from-primary/10 via-background to-primary/5 overflow-hidden">
         {/* Enhanced floating background elements */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/15 to-primary/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-l from-primary/10 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full animate-pulse-slow"></div>
            
            {/* Scattered sparkle effects */}
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 bg-primary/30 rounded-full animate-twinkle"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 4}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                    }}
                ></div>
            ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto w-fit mb-6 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow"></div>
                <Sparkles className="h-16 w-16 text-primary drop-shadow-2xl relative z-10 animate-bounce-slow" />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-text-primary via-primary to-text-primary bg-clip-text text-transparent animate-gradient">
                Celebrating Art, Empowering Artisans
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-text-secondary mb-10 leading-relaxed">
                Discover authentic, handcrafted treasures from talented artisans across the nation. HunarKart is your gateway to a world of creativity and tradition.
            </p>
        </div>
    </section>
);

const FeaturesSection = () => {
    const features = [
        { 
            icon: Palette, 
            title: "Authentic Handicrafts", 
            description: "Every piece tells a story. Shop unique, genuine items directly from the creators.",
            gradient: "from-orange-500/10 to-red-500/10"
        },
        { 
            icon: Users, 
            title: "Empowering Artisans", 
            description: "We provide a platform for artisans to showcase their skills and reach a global audience.",
            gradient: "from-blue-500/10 to-purple-500/10"
        },
        { 
            icon: Globe, 
            title: "Global & Local Reach", 
            description: "Connecting local talent with art lovers everywhere, fostering cultural appreciation.",
            gradient: "from-green-500/10 to-teal-500/10"
        }
    ];

    return (
        <section className="py-24 bg-background-offset relative overflow-hidden">
            {/* Animated Background pattern */}
            <div className="absolute inset-0 opacity-5 animate-pan-background" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 2px, transparent 0), radial-gradient(circle at 75% 75%, currentColor 2px, transparent 0)`,
                backgroundSize: '80px 80px',
            }}></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
                        Why Choose HunarKart?
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/50 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {features.map((feature, index) => (
                        <SpotlightCard key={index} className={`text-center group hover:scale-105 transition-all duration-500 bg-gradient-to-br ${feature.gradient} border-2 border-transparent hover:border-primary/20`}>
                            <div className="mx-auto mb-6 w-fit p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-500 relative overflow-hidden">
                                <feature.icon className="h-10 w-10 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent transform translate-x-[-150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-700"></div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                            <p className="text-text-secondary leading-relaxed">{feature.description}</p>
                        </SpotlightCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

const TopArtisansSection = () => {
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopArtisans = async () => {
            try {
                // Fetch a small, public list of artisans for the homepage
                const response = await apiClient.get('/artisans?limit=8'); // Fetch a few more in case of bad data
                setArtisans(response.data.data.artisans || []);
            } catch (err) {
                console.error("Failed to fetch top artisans:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTopArtisans();
    }, []);

    return (
        <section className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
                        Meet Our Talented Artisans
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/50 mx-auto rounded-full"></div>
                </div>
                
                {loading ? (
                    <div className="flex justify-center">
                        <div className="relative">
                            <Spinner size="lg" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse"></div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {artisans.slice(0, 4).map((artisan, index) => (
                            <Card key={artisan._id} className="group overflow-hidden text-center transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:scale-105 hover:-translate-y-2 bg-gradient-to-br from-background to-background-offset border-2 border-transparent hover:border-primary/20">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                                    <img
                                        src={artisan.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${artisan.name}`}
                                        alt={artisan.name}
                                        className="h-32 w-32 rounded-full mx-auto object-cover border-4 border-border group-hover:border-primary transition-all duration-500 relative z-10 group-hover:scale-110"
                                    />
                                    <div className="absolute top-2 right-2 bg-primary/10 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                        <Star className="h-4 w-4 text-primary" />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-text-primary group-hover:text-primary transition-colors duration-300">
                                        {artisan.name}
                                    </h3>
                                    <p className="text-sm text-text-secondary flex items-center justify-center gap-1" title={artisan.address}>
                                        <Globe className="h-3 w-3" />
                                        From {artisan.address.split(',').pop().trim()}
                                    </p>
                                </div>
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

const Footer = () => (
    <footer className="bg-gradient-to-r from-background-offset to-background border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(45deg, currentColor 25%, transparent 25%), linear-gradient(-45deg, currentColor 25%, transparent 25%)`,
            backgroundSize: '20px 20px',
        }}></div>
        
        <div className="container mx-auto py-12 px-4 text-center relative z-10">
            <div className="flex justify-center items-center gap-3 mb-6 group">
                <div className="relative">
                    <Gem className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-primary/20 blur-lg group-hover:blur-xl transition-all duration-300"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
                    HunarKart
                </span>
            </div>
            
            <p className="mb-6 text-lg text-text-secondary">
                Fostering creativity, preserving heritage.
            </p>
            
            <div className="flex justify-center items-center gap-2 mb-4 text-text-secondary">
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                <span>Made with love for artisans worldwide</span>
            </div>
            
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto mb-4"></div>
            
            <p className="text-sm text-text-secondary">
                © {new Date().getFullYear()} HunarKart. All rights reserved.
            </p>
        </div>
    </footer>
);


// --- Main HomePage Component ---

const HomePage = () => {
    useEffect(() => {
        document.body.classList.add('homepage-body');
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
            }
            @keyframes float-delayed {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-30px) rotate(-5deg); }
            }
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
            @keyframes bounce-slow {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            @keyframes pulse-slow {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 0.8; }
            }
            @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            @keyframes pan-background {
                0% { background-position: 0% 0%; }
                100% { background-position: 100% 100%; }
            }
            .animate-float { animation: float 6s ease-in-out infinite; }
            .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite 2s; }
            .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
            .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
            .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
            .animate-gradient { 
                background-size: 200% 200%;
                animation: gradient 5s ease infinite;
            }
            .animate-pan-background {
                animation: pan-background 30s linear infinite;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.body.classList.remove('homepage-body');
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className={`bg-background text-text-primary min-h-screen`}>
            <HomePageHeader />
            <main>
                <HeroSection />
                <FeaturesSection />
                <TopArtisansSection />
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
