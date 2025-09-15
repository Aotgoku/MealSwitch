import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorDisplay = ({ error, setError }) => {
    if (!error) return null;

    return (
        <div className="error-container">
            <AlertCircle className="error-icon" />
            <h3>Analysis Failed</h3>
            <p>{error}</p>
            <button onClick={() => setError(null)} className="dismiss-button">
                <X />
                Dismiss
            </button>
        </div>
    );
};

export default ErrorDisplay;