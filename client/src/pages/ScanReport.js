import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Loader2, Clock, List, Save } from 'lucide-react';

function ScanReport() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const API_URL = "https://apollo-api-wmzs.onrender.com/api/analyze-report";
  const SAVE_REPORT_URL = "https://apollo-api-wmzs.onrender.com/api/save-report";

  const handleFileChange = (event) => {
    if (event.target.files?.length > 0) {
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
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to analyze the report. Please try again.");

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setAnalysisResult(null); // Reset analysis result if the request fails
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveReport = async () => {
    const token = localStorage.getItem("token"); // Retrieve token from storage

    if (!token) {
      alert("You need to log in to save the report.");
      window.location.href = "/login"; // Redirect to login page
      return;
    }

    try {
      const response = await fetch(SAVE_REPORT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Use stored auth token
        },
        body: JSON.stringify(analysisResult),
      });

      if (!response.ok) throw new Error("Failed to save the report. Please try again.");

      alert("Report saved successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Medical Report Analyzer</h1>
        <p className="text-gray-600 mb-8">Upload your medical report and get an AI-powered analysis in simple terms.</p>

        <div className="space-y-4 mb-8">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.txt" />
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => fileInputRef.current?.click()}>
            <Upload size={20} /> Choose File
          </button>
          {file && <p className="text-sm text-gray-600 flex items-center gap-2"><FileText size={16} /> Selected File: {file.name}</p>}
          <button className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (<><Loader2 className="animate-spin" size={20} /> Processing...</>) : (<>Analyze Report</>)}
          </button>
        </div>

        {error && <p className="text-red-600 flex items-center gap-2"><AlertCircle size={18} /> {error}</p>}

        {analysisResult && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Analysis Result</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="flex items-center gap-2 text-gray-700 mb-4">
                <FileText size={18} /><span className="font-medium">Extracted Text:</span> {analysisResult?.text || "No text extracted."}
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="flex items-center gap-2 font-medium text-gray-800"><List size={18} /> Key Findings</h3>
                  <ul className="list-disc list-inside text-gray-700 pl-2">
                    {analysisResult?.analysis?.keyFindings?.length > 0 
                      ? analysisResult.analysis.keyFindings.map((finding, index) => (<li key={`finding-${index}`} className="mb-1">{finding}</li>))
                      : <li>No key findings available.</li>}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="flex items-center gap-2 font-medium text-gray-800"><Clock size={18} /> Recommendations</h3>
                  <ul className="list-disc list-inside text-gray-700 pl-2">
                    {analysisResult?.analysis?.recommendations?.length > 0
                      ? analysisResult.analysis.recommendations.map((rec, index) => (<li key={`recommendation-${index}`} className="mb-1">{rec}</li>))
                      : <li>No recommendations available.</li>}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="flex items-center gap-2 font-medium text-gray-800"><AlertCircle size={18} /> Urgent Concerns</h3>
                  <ul className="list-disc list-inside text-gray-700 pl-2">
                    {analysisResult?.analysis?.urgentConcerns?.length > 0
                      ? analysisResult.analysis.urgentConcerns.map((concern, index) => (<li key={`concern-${index}`} className="mb-1">{concern}</li>))
                      : <li>No urgent concerns.</li>}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800">Simplified Explanation</h3>
                  <p className="text-gray-700">{analysisResult?.analysis?.simplifiedExplanation || "No explanation available."}</p>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors" onClick={handleSaveReport}>
              <Save size={20} /> Save Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanReport;