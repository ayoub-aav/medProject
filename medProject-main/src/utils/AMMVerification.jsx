import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const checkAMMFraud = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:5000/validate_amm', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking AMM fraud:', error);
    throw error;
  }
};

const AMMVerification = ({ ammNumber, onValidation }) => {
  const [validation, setValidation] = useState({
    status: null,
    probability: null,
    loading: false,
    error: null
  });

  const validateAMM = async (file) => {
    setValidation(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await checkAMMFraud(file);
      const newValidation = {
        status: result.status,
        probability: result.probability,
        loading: false,
        error: null
      };
      
      setValidation(newValidation);
      if (onValidation) {
        onValidation(newValidation);
      }
      return result;
    } catch (error) {
      const errorValidation = {
        status: 'ERROR',
        probability: null,
        loading: false,
        error: error.message
      };
      
      setValidation(errorValidation);
      if (onValidation) {
        onValidation(errorValidation);
      }
      return { status: 'ERROR', probability: 0 };
    }
  };

  return (
    <div className="mt-2">
      <label className="block text-gray-700 text-sm font-medium mb-1">AMM Verification</label>
      <div className="flex items-center">
        <input
          type="text"
          value={ammNumber}
          readOnly
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
        />
        <label 
          htmlFor="amm-pdf-upload" 
          className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <Upload size={16} className="mr-1" />
          Upload PDF
        </label>
        <input
          id="amm-pdf-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            await validateAMM(file);
          }}
        />
      </div>

      {validation.loading && (
        <p className="mt-1 text-xs text-blue-600">Validating AMM document...</p>
      )}
      {validation.status && !validation.loading && (
        <p className={`mt-1 text-xs ${
          validation.status === 'VALID' ? 'text-green-600' : 'text-red-600'
        }`}>
          AMM Status: {validation.status} (Confidence: {(validation.probability * 100).toFixed(1)}%)
        </p>
      )}
      {validation.error && !validation.loading && (
        <p className="mt-1 text-xs text-red-600">Validation error: {validation.error}</p>
      )}

      {validation.status === 'FRAUD' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mt-2">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                AMM document validation failed - potential fraud detected
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AMMVerification;