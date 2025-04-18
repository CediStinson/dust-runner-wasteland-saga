
import React from 'react';
import { CircleDot, CircleDollarSign } from 'lucide-react';

interface ResourcesDisplayProps {
  resources: number;
  copper: number;
}

const ResourcesDisplay: React.FC<ResourcesDisplayProps> = ({
  resources,
  copper
}) => {
  return (
    <div className="flex gap-3">
      {/* Metal resources */}
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2 transition-colors hover:bg-black/50">
        <CircleDot className="w-4 h-4 text-gray-300" />
        <span className="font-mono text-sm text-gray-200">{resources}</span>
      </div>
      
      {/* Copper resources */}
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2 transition-colors hover:bg-black/50">
        <CircleDollarSign className="w-4 h-4 text-orange-400" />
        <span className="font-mono text-sm text-orange-200">{copper}</span>
      </div>
    </div>
  );
};

export default ResourcesDisplay;
