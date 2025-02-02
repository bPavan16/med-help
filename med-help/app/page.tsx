'use client';

import { useState } from 'react';
import { analyzeMedicine } from './utils/gemini';

interface MedicineResult {
  medicine_name: string;
  type: string;
  generic_name: string;
  manufacturer: string;
  formulations: {
    form: string;
    strengths: string[];
  }[];
  uses: string[];
  dosage: string;
  warnings: string[];
  side_effects: string[];
  storage: string;
  important_note: string;
}

export default function Home() {
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MedicineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchText.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);
    setProgress('Analyzing medicine...');

    try {
      const result = await analyzeMedicine(searchText, setProgress);

      setResults(result);
      console.log('Medicine result:', result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to analyze medicine');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-800 mb-4">
            Med-Help
          </h1>
          <p className="text-xl text-blue-700 max-w-xl mx-auto">
            Search for any medicine to learn more about it
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Enter medicine name..."
                className="flex-1 px-4 py-2 text-black rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {progress && (
              <div className="mt-4 text-center animate-pulse">
                <p className="text-blue-600">{progress}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="max-w-2xl mx-auto p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {results && (
          <div className="max-w-10xl mx-auto text-black bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">{searchText}</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">General Information</h3>
                <p><span className="font-medium">Type:</span> {results.type}</p>
                <p><span className="font-medium">Generic Name:</span> {results.generic_name}</p>
                <p><span className="font-medium">Manufacturer:</span> {results.manufacturer}</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-700 mb-2">Formulations</h3>
                {results.formulations.map((form, idx) => (
                  <div key={idx} className="mb-2">
                    <p>{form.form}: {form.strengths.join(', ')}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-semibold text-blue-700 mb-2">Uses</h3>
                <ul className="list-disc list-inside">
                  {results.uses.map((use, idx) => (
                    <li key={idx}>{use}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-blue-700 mb-2">Side Effects</h3>
                <ul className="list-disc list-inside">
                  {results.side_effects.map((effect, idx) => (
                    <li key={idx}>{effect}</li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-semibold text-blue-700 mb-2">Dosage</h3>
                <p>{results.dosage}</p>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-semibold text-blue-700 mb-2">Warnings</h3>
                <ul className="list-disc list-inside">
                  {results.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-semibold text-blue-700 mb-2">Storage</h3>
                <p>{results.storage}</p>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-semibold text-blue-700 mb-2">Important Note</h3>
                <p>{results.important_note}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}