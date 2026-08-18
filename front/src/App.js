import React, { useState } from 'react';

function App() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const imgbbKey = process.env.REACT_APP_IMGBB_API_KEY;

  const [status, setStatus] = useState('Idle');

  const testApiConnection = async () => {
    setStatus('Connecting...');
    try {
      const response = await fetch(`${apiUrl}/health`); // Adjust endpoint as needed
      if (response.ok) {
        setStatus('Connected Successfully!');
      } else {
        setStatus('API Responded with an Error.');
      }
    } catch (error) {
      setStatus('Failed to Connect to API.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          POESSA Employee Digital ID
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Environment Configuration Loaded
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">API URL</label>
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 break-all">
                {apiUrl || 'Not Defined'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ImgBB API Key</label>
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 break-all">
                {imgbbKey ? `${imgbbKey.substring(0, 6)}••••••••••••••••` : 'Not Defined'}
              </div>
            </div>

            <div>
              <button
                onClick={testApiConnection}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Test API Connection
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              Status: <span className="font-semibold text-gray-800">{status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
