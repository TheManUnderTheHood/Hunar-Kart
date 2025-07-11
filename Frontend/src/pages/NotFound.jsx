import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
            <h1 className="text-9xl font-extrabold text-primary tracking-widest">404</h1>
            <div className="bg-slate-800 px-2 text-sm rounded rotate-12 absolute">
                Page Not Found
            </div>
            <p className="mt-4 text-lg text-slate-400">
                Sorry, we couldn't find the page you're looking for.
            </p>
            <div className="mt-6">
                <Link to="/">
                    <Button>
                        Go Home
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;