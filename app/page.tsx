'use client'

import { useState } from 'react';
import { ipGuide } from '../data/ipGuide';
import { visualAssets, musicAssets } from '../data/assets';

export default function Home() {
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'complete'>('idle');
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'How can I help you today?' }]);
  const [selectedIPGuides, setSelectedIPGuides] = useState<string[]>([]);
  const [recommendedVisuals, setRecommendedVisuals] = useState<string[]>([]);
  const [recommendedMusics, setRecommendedMusics] = useState<string[]>([]);

  const handleSyncClick = () => {
    setSyncStatus('syncing');
  
    setTimeout(() => {
      setSyncStatus('complete');
    }, 2000); // 2 seconds fake sync time
  };
  

  const handleSend = async () => {
    if (!chatInput.trim()) return;
  
    const userMessage = chatInput.trim();
  
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setLoading(true);  // <-- Start loading
  
    try {
      const [ipRes, assetRes, recRes] = await Promise.all([
        fetch('/api/ipguide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMessage }) }),
        fetch('/api/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMessage }) }),
        fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMessage }) }),
      ]);
  
      const ipData = await ipRes.json();
      const assetData = await assetRes.json();
      const recData = await recRes.json();
  
      const matchedTitles = ipGuide.filter(doc => ipData.reply.includes(doc.title)).map(doc => doc.title);
      setSelectedIPGuides(matchedTitles);
  
      const visualMatches = visualAssets.filter(asset => assetData.reply.includes(asset.name)).map(asset => asset.name);
      const musicMatches = musicAssets.filter(asset => assetData.reply.includes(asset.name)).map(asset => asset.name);
      setRecommendedVisuals(visualMatches);
      setRecommendedMusics(musicMatches);
  
      setMessages(prev => [...prev, { role: 'assistant', content: recData.reply }]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Error: Couldn't fetch recommendation. Please try again." }]);
    } finally {
      setLoading(false);  // <-- End loading
    }
  };
  

  // ✨ Render Part
  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left Sidebar - IP Guide */}
      <aside className="w-1/5 bg-gray-900 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">IP Guide</h2>
        <div className="space-y-6">
          {ipGuide.filter(doc => selectedIPGuides.length === 0 || selectedIPGuides.includes(doc.title)).map(doc => (
            <div key={doc.id} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold">{doc.title}</h3>
              <p className="text-sm text-gray-300 mt-2 whitespace-pre-line">{doc.content}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Center Area - Chatbox and Recommendations */}
      <main className="flex flex-col flex-1 p-6">
        <div className="flex-1 overflow-y-auto mb-4">
          <h1 className="text-3xl font-bold mb-6"></h1>
          <div className="flex justify-end mb-4">
            {syncStatus === 'idle' && (
              <button
                onClick={handleSyncClick}
                className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md"
              >
                Sync with Perforce
              </button>
            )}
            {syncStatus === 'syncing' && (
              <div className="flex items-center space-x-2 text-yellow-400 font-semibold">
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-ping"></div>
                <span>Syncing...</span>
              </div>
            )}
            {syncStatus === 'complete' && (
              <div className="flex items-center space-x-2 text-green-400 font-semibold">
                <span>✅ Sync Complete</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {messages.map((message, index) => (
              message.role === 'assistant' ? (
                <div
                  key={index}
                  className="p-6 shadow-lg flex flex-col items-center text-center space-y-4 animate-fadeIn"
                >
                  <img
                    src="/assets/mnemo-logo.png"
                    alt="Mnemo AI"
                    className="w-24 h-24 rounded-full shadow-lg animate-pulse"
                  />
                  <p className="text-lg text-gray-100 whitespace-pre-line">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-700"
                >
                  <p>{message.content}</p>
                </div>
              )
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="p-6 rounded-lg bg-yellow-800 animate-pulse text-center">
                <p>Thinking...</p>
              </div>
            )}
          </div>

        </div>

        {/* Chat Input */}
        <div className="mt-auto flex">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your request here..."
            className="flex-1 p-4 h-24 rounded-l-lg bg-gray-800 border-t border-l border-b border-gray-700 focus:outline-none resize-none"
          />
          <button
            onClick={handleSend}
            className="bg-green-600 hover:bg-green-700 p-4 rounded-r-lg font-bold"
          >
            Send
          </button>
        </div>
      </main>

      {/* Right Sidebar - Recommended Assets */}
      <aside className="w-1/5 bg-gray-900 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Recommended Assets</h2>

        <h3 className="text-lg font-semibold mt-4">Visuals</h3>
        <div className="space-y-4">
          {visualAssets.filter(asset => recommendedVisuals.length === 0 || recommendedVisuals.includes(asset.name)).map(asset => (
            <div key={asset.id} className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold">{asset.name}</h4>
              <p className="text-xs text-gray-400">{asset.creatorStudio}</p>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-semibold mt-8">Music</h3>
        <div className="space-y-4">
          {musicAssets.filter(asset => recommendedMusics.length === 0 || recommendedMusics.includes(asset.name)).map(asset => (
            <div key={asset.id} className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold">{asset.name}</h4>
              <p className="text-xs text-gray-400">{asset.creatorStudio}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
