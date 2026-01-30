import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface AdminAuthProps {
    onAuthenticated: () => void;
}

import { getApiBaseUrl } from '../utils/api-config';
const API_BASE_URL = getApiBaseUrl();

const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthenticated }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ password })
            });

            if (response.ok) {
                onAuthenticated();
            } else {
                const data = await response.json();
                setError(data.error || 'Invalid password');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Access</h1>
                        <p className="text-sm text-slate-600">Enter admin password to continue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                placeholder="Enter admin password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Login'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-500 mt-4">
                    Authorized access only. All activity is logged.
                </p>
            </div>
        </div>
    );
};

export default AdminAuth;
