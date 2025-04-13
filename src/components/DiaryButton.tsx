
import React from 'react';
import { Book } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiaryButtonProps {
  onClick: () => void;
}

const DiaryButton: React.FC<DiaryButtonProps> = ({ onClick }) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      className="bg-stone-800 hover:bg-stone-700 border-amber-700"
    >
      <Book className="w-4 h-4 mr-2 text-amber-200" />
      <span className="text-amber-100">Diary</span>
    </Button>
  );
};

export default DiaryButton;
