import { useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Plus, Trash2, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { QuestionCardProps } from '@/features/sets/models/sets.type';
import {
  Question,
  QuestionType,
  FourOptionsMetadata,
  FourOptionsAnswer,
  TrueFalseMetadata,
} from '@/shared/models/sets.type';

interface ExtendedQuestionCardProps extends Omit<QuestionCardProps, 'id'> {
  question: Question;
  onChange: (updatedQuestion: Question) => void;
  readOnly?: boolean;
}

export function QuestionCard({
  index,
  isSelected,
  onSelect,
  onAdd,
  onDelete,
  question,
  onChange,
  readOnly = false,
}: ExtendedQuestionCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTypeChange = (type: QuestionType) => {
    setIsMenuOpen(false);
    if (type === question.type) return;

    if (type === QuestionType.TRUE_FALSE) {
      onChange({
        type: QuestionType.TRUE_FALSE,
        metadata: {
          question: question.metadata.question,
          correctAnswer: true, // Default to True
        },
      } as Question);
    } else {
      onChange({
        type: QuestionType.FOUR_OPTIONS,
        metadata: {
          question: question.metadata.question,
          answers: [
            { answer: '', isCorrect: false },
            { answer: '', isCorrect: false },
            { answer: '', isCorrect: false },
            { answer: '', isCorrect: false },
          ],
        },
      } as Question);
    }
  };

  const handleQuestionChange = (text: string) => {
    onChange({
      ...question,
      metadata: { ...question.metadata, question: text },
    } as Question);
  };

  // Handlers for Four Options
  const handleAnswerChange = (answerIndex: number, text: string) => {
    if (question.type !== QuestionType.FOUR_OPTIONS) return;
    const metadata = question.metadata as FourOptionsMetadata;

    const newAnswers = [...metadata.answers];
    const updatedAnswer: FourOptionsAnswer = { ...newAnswers[answerIndex], answer: text };
    newAnswers[answerIndex] = updatedAnswer;

    onChange({
      ...question,
      metadata: {
        ...metadata,
        answers: newAnswers as [FourOptionsAnswer, FourOptionsAnswer, FourOptionsAnswer, FourOptionsAnswer],
      },
    } as Question);
  };

  const handleCorrectChange = (answerIndex: number) => {
    if (question.type !== QuestionType.FOUR_OPTIONS) return;
    const metadata = question.metadata as FourOptionsMetadata;

    const newAnswers = [...metadata.answers];
    // Toggle functionality or single choice? Usually quizzes allow multiple correct or single.
    // Assuming single correct answer for now based on UI radio/checkbox ambiguity, but code used checkbox.
    // Let's keep existing toggle behavior.
    const updatedAnswer: FourOptionsAnswer = {
      ...newAnswers[answerIndex],
      isCorrect: !newAnswers[answerIndex].isCorrect,
    };
    newAnswers[answerIndex] = updatedAnswer;

    onChange({
      ...question,
      metadata: {
        ...metadata,
        answers: newAnswers as [FourOptionsAnswer, FourOptionsAnswer, FourOptionsAnswer, FourOptionsAnswer],
      },
    } as Question);
  };

  // Handlers for True/False
  const handleTrueFalseChange = (value: boolean) => {
    if (question.type !== QuestionType.TRUE_FALSE) return;

    onChange({
      ...question,
      metadata: {
        ...question.metadata,
        correctAnswer: value,
      } as TrueFalseMetadata,
    } as Question);
  };

  return (
    <div className="relative flex w-full">
      {/* Main Card Content */}
      <div
        className={cn(
          'w-full rounded-lg border-2 p-6 transition-colors bg-bg-dark',
          isSelected ? 'border-primary' : 'border-border',
        )}
        onClick={() => onSelect(String(index))}
      >
        <div className="mb-4">
          <div className="mb-4">
            {readOnly ? (
              <h3 className="text-lg font-medium mt-2">{question.metadata.question}</h3>
            ) : (
              <Input
                placeholder={`Question ${index + 1}`}
                className="mt-2"
                value={question.metadata.question}
                onChange={(e) => handleQuestionChange(e.target.value)}
              />
            )}
          </div>
        </div>

        {question.type === QuestionType.TRUE_FALSE ? (
          <div className="grid grid-cols-2 gap-4">
            {['True', 'False'].map((option) => {
              const isTrue = option === 'True';
              const metadata = question.metadata as TrueFalseMetadata;
              const isSelectedOption = metadata.correctAnswer === isTrue;

              return (
                <div
                  key={option}
                  onClick={() => !readOnly && handleTrueFalseChange(isTrue)}
                  className={cn(
                    'flex items-center justify-center p-4 rounded-md border-2 cursor-pointer transition-all',
                    isSelectedOption
                      ? 'bg-primary/20 border-primary'
                      : 'bg-bg-very-dark border-border hover:border-primary/50',
                    readOnly && !isSelectedOption && 'opacity-50 cursor-default',
                    readOnly && isSelectedOption && 'bg-green-500/20 border-green-500', // Show correct in readOnly
                  )}
                >
                  <span
                    className={cn(
                      'text-xl font-bold',
                      isSelectedOption ? 'text-primary' : 'text-muted-foreground',
                      readOnly && isSelectedOption && 'text-green-500',
                    )}
                  >
                    {option}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(question.metadata as FourOptionsMetadata).answers.map((ans, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-2 rounded-md border p-3',
                  readOnly
                    ? ans.isCorrect
                      ? 'bg-purple-500/20 border-purple-500'
                      : 'bg-bg-very-dark border-transparent'
                    : cn(
                        'bg-bg-very-dark',
                        i === 0
                          ? 'border-orange-500'
                          : i === 1
                            ? 'border-purple-500'
                            : i === 2
                              ? 'border-green-500'
                              : 'border-blue-500',
                      ),
                )}
              >
                {!readOnly && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-background">
                    <input
                      type="checkbox"
                      className="w-[80%] h-[80%]"
                      checked={ans.isCorrect}
                      onChange={() => handleCorrectChange(i)}
                    />
                  </div>
                )}
                {readOnly ? (
                  <div className="w-full px-3 py-2 text-sm">{ans.answer}</div>
                ) : (
                  <Input
                    placeholder={`Answer ${i + 1}`}
                    className="border-none bg-transparent shadow-none focus-visible:ring-0"
                    value={ans.answer}
                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side Action Bar - Visible only when selected and not readOnly */}
      {isSelected && !readOnly && (
        <div className="absolute -right-16 top-0 flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(String(index));
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(String(index));
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" disabled>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" disabled>
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {isMenuOpen && (
              <div className="absolute right-full top-0 mr-2 w-48 rounded-md border border-border bg-popover p-1 shadow-md z-50">
                <button
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTypeChange(QuestionType.FOUR_OPTIONS);
                  }}
                >
                  Multiple Choice
                </button>
                <button
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTypeChange(QuestionType.TRUE_FALSE);
                  }}
                >
                  True or False
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
