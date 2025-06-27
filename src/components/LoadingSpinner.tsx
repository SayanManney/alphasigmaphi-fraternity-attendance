
import React from 'react';

export const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f6d192' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900"></div>
    </div>
  );
};
