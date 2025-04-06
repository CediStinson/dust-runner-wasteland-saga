
import React from 'react';

interface ResourcesDisplayProps {
  resources: number;
  copper: number;
}

const ResourcesDisplay: React.FC<ResourcesDisplayProps> = ({
  resources,
  copper
}) => {
  return (
    <div className="flex gap-3 scale-90 origin-bottom-left">
      {/* Metal resources */}
      <div className="bg-black/50 p-2 rounded-lg backdrop-blur-sm text-yellow-200 border border-yellow-500/30">
        <div className="flex gap-1.5 items-center">
          <div className="w-5 h-5 bg-gray-400 rounded-sm border border-gray-300 flex items-center justify-center">
            <div className="w-3 h-0.5 bg-gray-300"></div>
          </div>
          <span className="font-mono text-sm">{resources}</span>
        </div>
      </div>
      
      {/* Copper resources */}
      <div className="bg-black/50 p-2 rounded-lg backdrop-blur-sm text-orange-200 border border-orange-500/30">
        <div className="flex gap-1.5 items-center">
          <div className="w-5 h-5 bg-orange-600 rounded-full border border-orange-400 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-orange-300 rounded-full"></div>
          </div>
          <span className="font-mono text-sm">{copper}</span>
        </div>
      </div>
    </div>
  );
};

export default ResourcesDisplay;
