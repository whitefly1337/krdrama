import { Link, useLocation } from 'react-router-dom';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-7xl font-light text-zinc-600">404</h1>
                    <div className="h-0.5 w-16 bg-zinc-800 mx-auto"></div>
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl font-medium text-white">Page Not Found</h2>
                    <p className="text-zinc-400 leading-relaxed">
                        The page <span className="font-medium text-zinc-300">"{pageName}"</span> doesn't exist.
                    </p>
                </div>
                <div className="pt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
