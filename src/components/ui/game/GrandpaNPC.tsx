
import React, { useState, useEffect } from 'react';
import { Speech } from 'lucide-react';

interface GrandpaNPCProps {
  worldX: number;
  worldY: number;
}

const QUOTES = [
  "Back in my day, we didn't have fancy hoverbikes... we had to walk through the desert!",
  "Remember to check your fuel gauge, kiddo. Running out of fuel ain't no picnic.",
  "Keep an eye out for those copper deposits, they shine like my old wedding ring.",
  "The desert's got a rhythm to it. Learn to listen, and you'll never get lost.",
  "If you're feeling tired, there's no shame in taking a nap under the tarp.",
  "Did I ever tell you about the time I found a whole stash of fuel canisters?",
  "You remind me of myself when I was younger... except I was better at landing the hoverbike!",
  "Save your progress often, memory ain't what it used to be... trust me on that one!"
];

const GrandpaNPC: React.FC<GrandpaNPCProps> = ({ worldX, worldY }) => {
  const [showSpeech, setShowSpeech] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');

  useEffect(() => {
    // Only show quotes at home base (0,0)
    if (worldX === 0 && worldY === 0) {
      const interval = setInterval(() => {
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        setCurrentQuote(randomQuote);
        setShowSpeech(true);
        
        // Hide the speech bubble after 5 seconds
        setTimeout(() => {
          setShowSpeech(false);
        }, 5000);
      }, 20000); // Show a new quote every 20 seconds

      return () => clearInterval(interval);
    }
  }, [worldX, worldY]);

  // Only render at home base
  if (worldX !== 0 || worldY !== 0) return null;

  return (
    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 pointer-events-none">
      {/* Speech Bubble */}
      {showSpeech && (
        <div className="animate-fade-in relative mb-4">
          <div className="bg-black/70 p-3 rounded-lg backdrop-blur-md max-w-xs mx-auto">
            <div className="relative">
              <Speech className="absolute -top-6 -left-6 text-white/80" size={20} />
              <p className="text-white text-sm leading-snug">{currentQuote}</p>
            </div>
          </div>
          {/* Speech bubble pointer */}
          <div className="w-4 h-4 bg-black/70 rotate-45 absolute left-1/2 -bottom-2 transform -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};

export default GrandpaNPC;
