
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface DiaryButtonProps {
  onClick: () => void;
}

const DiaryButton: React.FC<DiaryButtonProps> = ({ onClick }) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="absolute top-24 right-4 flex items-center gap-1 bg-stone-700/80 hover:bg-stone-600 text-white border-stone-500"
      onClick={onClick}
    >
      <BookOpen size={16} />
      <span>Diary</span>
    </Button>
  );
};

export default DiaryButton;
