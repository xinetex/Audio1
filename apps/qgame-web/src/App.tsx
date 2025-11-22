import React from 'react';

function App() {
    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    QGame Platform
                </h1>
                <nav className="flex gap-4">
                    <button className="px-4 py-2 rounded-lg hover:bg-gray-800">Generator</button>
                    <button className="px-4 py-2 rounded-lg hover:bg-gray-800">Arena</button>
                    <button className="px-4 py-2 rounded-lg hover:bg-gray-800">Markets</button>
                </nav>
            </header>

            <main className="container mx-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                        <h2 className="text-xl font-bold mb-4">Shorts Generator</h2>
                        <p className="text-gray-400 mb-4">Create viral content with beat-synced editing.</p>
                        <div className="aspect-video bg-black rounded-lg border border-gray-700 flex items-center justify-center">
                            <span className="text-gray-600">Editor Canvas Placeholder</span>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                        <h2 className="text-xl font-bold mb-4">Live Markets</h2>
                        <p className="text-gray-400 mb-4">Bet on viral outcomes.</p>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
                                    <span>Will "Pepe Samurai" hit 1M views?</span>
                                    <span className="text-green-400 font-mono">YES $0.65</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
