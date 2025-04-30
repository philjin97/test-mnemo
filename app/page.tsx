'use client'

import { useState } from 'react';
import { ipGuide } from '../data/ipGuide';
import { visualAssets, musicAssets } from '../data/assets';

export default function Home() {
  const [chatInput, setChatInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'complete'>('idle');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [loading, setLoading] = useState(false);  
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
      const [ipRes, assetRes] = await Promise.all([
        fetch('/api/ipguide', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ message: userMessage }) 
        }),
        fetch('/api/assets', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ message: userMessage }) 
        }),
      ]);
      
      const ipData = await ipRes.json();
      const assetData = await assetRes.json();

      const recRes = await fetch('/api/recommend', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          message: userMessage, 
          selectedAssets: assetData.reply, 
        }) 
      });
      
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
                Data update available
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
                <span>✅ Data up to date</span>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-6">
            {/* ✨ Static Welcome Message at the Top */}
            <div className="flex flex-col items-center text-center space-y-4">
              <img
                src="/assets/mnemo-logo.png"
                alt="Mnemo AI"
                className="w-24 h-24 rounded-full shadow-lg animate-pulse"
              />
              <p className="text-2xl text-gray-200 font-semibold">
                Welcome to the (IP) creative engine room!
              </p>
            </div>

            {/* ✨ Chat Messages (afterwards) */}
            <div className="flex flex-col space-y-4">
              {/* User Messages (Left) */}
              <div className="flex flex-col items-start space-y-2">
                {messages.filter(m => m.role === 'user').map((message, index) => (
                  <div
                    key={`user-${index}`}
                    className="bg-gray-700 p-4 rounded-lg max-w-xs"
                  >
                    <p>{message.content}</p>
                  </div>
                ))}
              </div>

              {/* Assistant Messages (Right) */}
              <div className="flex flex-col items-end space-y-2">
                {messages.filter(m => m.role === 'assistant').map((message, index) => (
                  <div
                    key={`assistant-${index}`}
                    className="bg-blue-900 p-4 rounded-lg max-w-xs text-right"
                  >
                    <p>{message.content}</p>
                  </div>
                ))}
              </div>

              {/* Loading */}
              {loading && (
                <div className="text-center text-white font-semibold mt-4">
                  Loading...
                </div>
              )}
            </div>
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

        {/* Visuals Section */}
        <h3 className="text-lg font-semibold mt-4">Visuals</h3>
        <div className="space-y-4">
        {visualAssets
        .filter(asset => recommendedVisuals.length === 0 || recommendedVisuals.includes(asset.name))
        .map(asset => (
          <div key={asset.id} className="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
            {/* Thumbnail */}
            <div className="w-20 h-20 bg-gray-700 flex items-center justify-center rounded-md text-gray-400 text-sm">
              IMG
            </div>

            {/* Info + Download */}
            <div className="flex flex-col flex-grow">
              <h4 className="font-semibold text-green-200">{asset.name}</h4>
              <p className="text-xs text-gray-400">{asset.creatorStudio}</p>
              <p className="text-xs text-gray-500">
                {asset.dimensions} • {asset.fileType} • {asset.fileSizeMB}MB
              </p>
              <a
                href={`/downloads/${asset.name.replace(/\\s+/g, '_')}.${asset.fileType.split('/')[1]}`}
                download
                className="text-xs text-teal-400 hover:underline mt-1"
              >
                Download
              </a>
            </div>
          </div>
        ))}


        </div>

        {/* Music Section */}
        <h3 className="text-lg font-semibold mt-8">Music</h3>
        <div className="space-y-4">
          {musicAssets
            .filter(asset => recommendedMusics.length === 0 || recommendedMusics.includes(asset.name))
            .map(asset => (
              <div key={asset.id} className="bg-gray-800 p-4 rounded-lg space-y-2">
                {/* Track Info */}
                <div className="flex flex-col">
                  <h4 className="font-semibold text-green-200">{asset.name}</h4>
                  <p className="text-xs text-gray-400">{asset.creatorStudio}</p>
                </div>

                {/* Audio Player */}
                <audio controls className="w-full mt-2">
                  {/* Assuming no real audio yet; could link to /audio/{asset.id}.mp3 later */}
                  <source src={`/audio/${asset.id}.mp3`} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>

                {/* Metadata */}
                <div className="flex justify-between text-xs text-teal-300 mt-1">
                  <span>Atmosphere: {asset.atmosphere}</span>
                  <span>BPM: {asset.bpm}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-400">{asset.description}</p>
              </div>
            ))}
        </div>

      </aside>
    </div>
  );
}
