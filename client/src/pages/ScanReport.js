import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Loader2, Clock, List, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function ScanReport() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { isAuthenticated } = useAuth();

  const API_URL = "https://apollo-api-wmzs.onrender.com/api/analyze-report";
  const SAVE_REPORT_URL = "https://apollo-api-wmzs.onrender.com/api/save-report";

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("report", file);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: { 
          "Accept": "application/json",
          "Authorization": Bearer ${token}
        },
      });
      
      if (!response.ok) throw new Error("Failed to analyze the report. Please try again.");
      
      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!analysisResult) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(SAVE_REPORT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": Bearer ${token}
        },
        body: JSON.stringify(analysisResult),
      });
      
      if (!response.ok) throw new Error("Failed to save the report. Please try again.");
      
      // Show success message or handle successful save
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Scan Report Analysis</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Select File
              </button>
            </div>
            {file && (
              <div className="mt-4 flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600">{file.name}</span>
              </div>
            )}
          </div>
        </div>

        {file && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
            >
              {isUploading ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Analyzing...
                </div>
              ) : (
                "Analyze Report"
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-500 mr-3 mt-1" />
              <div>
                <h3 className="font-medium">Processing Time</h3>
                <p className="text-gray-600">{analysisResult.processingTime} seconds</p>
              </div>
            </div>

            <div className="flex items-start">
              <List className="h-5 w-5 text-gray-500 mr-3 mt-1" />
              <div>
                <h3 className="font-medium">Key Findings</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {analysisResult.findings?.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={handleSaveReport}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanReport;
