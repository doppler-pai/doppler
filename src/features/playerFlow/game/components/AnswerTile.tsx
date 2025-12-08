'use client';

export type AnswerColor = 'orange' | 'purple' | 'green' | 'blue';

type AnswerTileProps = {
  text: string;
  color: AnswerColor;
  onClick: () => void;
  disabled?: boolean;
};

const colorStyles: Record<AnswerColor, string> = {
  orange: 'border-answer-orange hover:bg-answer-orange/10',
  purple: 'border-answer-purple hover:bg-answer-purple/10',
  green: 'border-answer-green hover:bg-answer-green/10',
  blue: 'border-answer-blue hover:bg-answer-blue/10',
};

export function AnswerTile({ text, color, onClick, disabled = false }: AnswerTileProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center
        w-full h-full
        border-4 rounded-xl
        bg-bg-dark
        transition-colors duration-200
        ${colorStyles[color]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <h3 className="text-center px-4">{text}</h3>
    </button>
  );
}
