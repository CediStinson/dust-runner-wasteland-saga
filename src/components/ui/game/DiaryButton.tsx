
import React from 'react';
import { BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiaryButtonProps {
  onClick: () => void;
}

const DiaryButton: React.FC<DiaryButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="icon"
      className="fixed bottom-28 right-5 z-40 bg-black/50 border-white/30 hover:bg-black/70 text-white transition-colors rounded-full h-12 w-12"
      aria-label="Open Diary"
    >
      <BookText size={20} />
    </Button>
  );
};

export default DiaryButton;
