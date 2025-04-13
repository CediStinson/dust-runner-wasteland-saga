import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiaryModalProps {
  showDiary: boolean;
  setShowDiary: (show: boolean) => void;
  diaryEntries?: string[];
}

const DiaryModal: React.FC<DiaryModalProps> = ({ 
  showDiary, 
  setShowDiary,
  diaryEntries = [
    "Day 1: The world wasn't always like this. In 2097, after decades of environmental neglect, the Great Dust Event began. Pollutants in the atmosphere combined with natural dust storms created a cascade effect that covered Earth's surface in a thick layer of sand and dust.",
    "Day 15: My grandfather told stories about how corporations kept mining and drilling despite warnings. Eventually, the atmosphere couldn't recover. The dust clouds blocked the sun, and temperatures fluctuated wildly. Most of civilization collapsed, leaving behind only scattered settlements.",
    "Day 32: I found maps at the old research station. They show this area was once green farmland. Hard to believe anything could grow here now. I must find more information about what happened to the people who lived here.",
    "Day 47: A military crate from the old Global Crisis Response Unit! Inside was a reference to Outpost Delta-7, which might hold technology to help restore the land. My grandfather mentioned these outposts in his stories. I need to find it.",
    "", // Empty page 5 - will be filled when finding military crate
  ]
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const totalPages = diaryEntries.length;
  
  if (!showDiary) return null;
  
  const handleClose = () => {
    setShowDiary(false);
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={handleClose}></div>
      
      {/* Diary container */}
      <div className="relative bg-stone-200 w-[90%] max-w-2xl h-[80%] rounded-lg shadow-lg overflow-hidden">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-700 hover:text-stone-900"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        
        {/* Diary header */}
        <div className="bg-stone-300 p-4 border-b border-stone-400">
          <div className="flex items-center">
            <BookOpen size={24} className="text-stone-700 mr-2" />
            <h2 className="text-xl font-serif text-stone-800">Wasteland Diary</h2>
          </div>
          <p className="text-stone-600 text-sm">Pages found: {diaryEntries.filter(entry => entry).length}/{totalPages}</p>
        </div>
        
        {/* Diary content */}
        <div className="p-8 h-[calc(100%-8rem)] overflow-auto flex items-center justify-center">
          <div className="w-full max-w-md min-h-[400px] bg-stone-100 p-6 shadow-inner rounded border border-stone-300 flex flex-col">
            {/* Page content */}
            {diaryEntries[currentPage] ? (
              <p className="text-stone-800 font-serif leading-relaxed flex-1">{diaryEntries[currentPage]}</p>
            ) : (
              <div className="flex items-center justify-center h-full text-stone-500 italic flex-1">
                <p>This page is blank. Explore the wasteland to discover entries.</p>
              </div>
            )}
            
            {/* Page number */}
            <div className="text-center text-stone-500 pt-4 border-t border-stone-300 mt-4">
              Page {currentPage + 1} of {totalPages}
            </div>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between bg-stone-300 border-t border-stone-400">
          <Button 
            variant="outline" 
            onClick={goToPreviousPage} 
            disabled={currentPage === 0}
            className="flex items-center"
          >
            <ChevronLeft size={16} className="mr-1" /> Previous
          </Button>
          
          <Button 
            variant="outline" 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages - 1}
            className="flex items-center"
          >
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiaryModal;
