import React, { useState } from 'react';
import { Briefcase, Bot, Loader2 } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { TextArea } from './components/TextArea';
import { submitApplication } from './services/api';

function App() {
  const [cv, setCv] = useState<File | null>(null);
  const [knowledge, setKnowledge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cv) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await submitApplication(cv, knowledge);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Job Application Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your CV and let our AI assistant help you apply to thousands of jobs automatically.
            Powered by advanced AI to ensure personalized applications.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <Bot className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Start Your Job Search Journey
            </h2>
          </div>

          <FileUpload
            label="Upload your CV"
            accept=".pdf,.doc,.docx"
            onChange={(file) => setCv(file)}
          />

          <TextArea
            label="Additional Knowledge Base"
            value={knowledge}
            onChange={setKnowledge}
            placeholder="Add any specific information you'd like the AI to consider when filling out job applications..."
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
              Application process started successfully! We'll handle the submissions automatically.
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !cv}
              className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-all
                ${isSubmitting || !cv
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Start Automated Applications'
              )}
            </button>
          </div>

          {cv && (
            <div className="text-sm text-gray-600 text-center">
              Ready to process: {cv.name}
            </div>
          )}
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Our AI assistant will help you apply to relevant positions while maintaining
          personalization for each application.
        </div>
      </div>
    </div>
  );
}

export default App;