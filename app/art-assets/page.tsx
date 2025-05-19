'use client';

import { useState } from 'react';

const sampleImages = [
  {
    key: 'village_scene',
    label: 'Village Scene',
    url: '/images/village_scene.jpg',
  },
  {
    key: 'sci_fi_base',
    label: 'Sci-Fi Base',
    url: '/images/sci_fi_base.jpg',
  },
  {
    key: 'futuristic_city',
    label: 'Futuristic City',
    url: '/images/futuristic_city.jpg',
  },
  {
    key: 'desert_ruins',
    label: 'Desert Ruins',
    url: '/images/desert_ruins.jpg',
  },
];

export default function ImageStylePage() {
  const [selectedKey, setSelectedKey] = useState(sampleImages[0].key);
  const [customStyle, setCustomStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleGenerate = async () => {
    setLoading(true);
    setResults([]);

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageKey: selectedKey,
        customStyle: customStyle.trim() || null,
      }),
    });

    const data = await response.json();
    setResults(data.images || []);
    setLoading(false);
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Krafton Image Style Generator</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {sampleImages.map((img) => (
          <button
            key={img.key}
            onClick={() => setSelectedKey(img.key)}
            className={`rounded border-2 ${
              selectedKey === img.key ? 'border-blue-600' : 'border-gray-300'
            }`}
          >
            <img src={img.url} alt={img.label} className="w-full h-32 object-cover rounded" />
            <p className="text-center text-sm mt-1">{img.label}</p>
          </button>
        ))}
      </div>

      <input
        className="w-full p-2 border rounded mb-4"
        type="text"
        placeholder="Type a style prompt (e.g., Ghibli style, cinematic lighting)"
        value={customStyle}
        onChange={(e) => setCustomStyle(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-6 py-2 rounded mb-6 disabled:opacity-50"
        disabled={loading}
        onClick={handleGenerate}
      >
        {loading ? 'Generating...' : 'Generate Styled Images'}
      </button>

      {results.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
          {results.map((img, index) => (
            <div key={index} className="border rounded p-2">
              <img src={img.url} alt={img.style} className="w-full rounded mb-2" />
              <p className="text-sm text-center">{img.style}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
