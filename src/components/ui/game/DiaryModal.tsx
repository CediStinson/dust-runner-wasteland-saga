
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiaryModalProps {
  showDiary: boolean;
  setShowDiary: (show: boolean) => void;
}

const DiaryModal: React.FC<DiaryModalProps> = ({ showDiary, setShowDiary }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [diaryEntries] = useState<string[]>([
    "", // Empty page 1
    "", // Empty page 2
    "", // Empty page 3
    "", // Empty page 4
    "", // Empty page 5
  ]);

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
          <h2 className="text-xl font-serif text-stone-800">Wasteland Diary</h2>
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
