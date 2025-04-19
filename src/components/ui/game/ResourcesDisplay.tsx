
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
    <div className="flex gap-2 scale-85 origin-bottom-left">
      <div className="bg-black/50 p-1.5 rounded-lg backdrop-blur-sm text-yellow-200 border border-yellow-500/30">
        <div className="flex gap-1.5 items-center">
          <div className="w-4 h-4 bg-gray-400 rounded-sm border border-gray-300 flex items-center justify-center">
            <div className="w-2.5 h-0.5 bg-gray-300" />
          </div>
          <span className="font-mono text-xs">{resources}</span>
        </div>
      </div>
      
      <div className="bg-black/50 p-1.5 rounded-lg backdrop-blur-sm text-orange-200 border border-orange-500/30">
        <div className="flex gap-1.5 items-center">
          <div className="w-4 h-4 bg-orange-600 rounded-full border border-orange-400 flex items-center justify-center">
            <div className="w-2 h-2 bg-orange-300 rounded-full" />
          </div>
          <span className="font-mono text-xs">{copper}</span>
        </div>
      </div>
    </div>
  );
};

export default ResourcesDisplay;
