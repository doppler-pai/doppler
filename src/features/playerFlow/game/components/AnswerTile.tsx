'use client';

export type AnswerColor = 'orange' | 'purple' | 'green' | 'blue';
export type AnswerState = 'default' | 'correct' | 'wrong' | 'dimmed';

type AnswerTileProps = {
  text: string;
  color: AnswerColor;
  onClick: () => void;
  disabled?: boolean;
  state?: AnswerState;
};

const colorStyles: Record<AnswerColor, string> = {
  orange: 'border-answer-orange hover:bg-answer-orange/10',
  purple: 'border-answer-purple hover:bg-answer-purple/10',
  green: 'border-answer-green hover:bg-answer-green/10',
  blue: 'border-answer-blue hover:bg-answer-blue/10',
};

const stateStyles: Record<AnswerState, string> = {
  default: '',
  correct: 'border-green-500 bg-green-500/20 border-4',
  wrong: 'border-red-500 bg-red-500/20 border-4',
  dimmed: 'opacity-40',
};

export function AnswerTile({ text, color, onClick, disabled = false, state = 'default' }: AnswerTileProps) {
  const isResultState = state === 'correct' || state === 'wrong' || state === 'dimmed';

  return (
    <button
      onClick={onClick}
      disabled={disabled || isResultState}
      className={`
        flex items-center justify-center
        w-full h-full
        border-4 rounded-xl
        bg-bg-dark
        transition-colors duration-200
        ${isResultState ? stateStyles[state] : colorStyles[color]}
        ${disabled && !isResultState ? 'opacity-50 cursor-not-allowed' : ''}
        ${isResultState ? 'cursor-default' : disabled ? '' : 'cursor-pointer'}
      `}
    >
      <h3 className="text-center px-4">{text}</h3>
    </button>
  );
}
