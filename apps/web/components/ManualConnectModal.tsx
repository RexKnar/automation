import React, { useState } from 'react';
import { useManualMetaConnection } from '../hooks/useMeta';

interface ManualConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ManualConnectModal: React.FC<ManualConnectModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const { mutateAsync: connectManually, isPending: isLoading } = useManualMetaConnection();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!token.trim()) {
            setError('Access Token is required');
            return;
        }

        try {
            await connectManually(token);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to connect');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Manual Connection
                </h2>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Enter a valid Facebook Access Token. You can generate one from the{' '}
                    <a 
                        href="https://developers.facebook.com/tools/explorer" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        Graph API Explorer
                    </a>.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Access Token
                        </label>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="EAAG..."
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Connecting...' : 'Connect'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
