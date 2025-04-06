
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
    <div className="flex gap-4">
      {/* Metal resources */}
      <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm text-yellow-200 border border-yellow-500/30">
        <div className="flex gap-2 items-center">
          <div className="w-6 h-6 bg-gray-400 rounded-sm border border-gray-300 flex items-center justify-center">
            <div className="w-4 h-1 bg-gray-300"></div>
          </div>
          <span className="font-mono">{resources}</span>
        </div>
      </div>
      
      {/* Copper resources */}
      <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm text-orange-200 border border-orange-500/30">
        <div className="flex gap-2 items-center">
          <div className="w-6 h-6 bg-orange-600 rounded-full border border-orange-400 flex items-center justify-center">
            <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
          </div>
          <span className="font-mono">{copper}</span>
        </div>
      </div>
    </div>
  );
};

export default ResourcesDisplay;
