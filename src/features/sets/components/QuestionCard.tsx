import { Input } from '@/shared/components/ui/input';
import { Plus, Trash2, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { QuestionCardProps } from '@/features/sets/models/sets.type';
import { Question, FourOptionsMetadata, FourOptionsAnswer } from '@/shared/models/sets.type';

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
  // Ensure we are working with FOUR_OPTIONS for now, based on UI
  const metadata = question.metadata as FourOptionsMetadata;

  const handleQuestionChange = (text: string) => {
    onChange({
      ...question,
      metadata: { ...metadata, question: text },
    } as Question);
  };

  const handleAnswerChange = (answerIndex: number, text: string) => {
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
    const newAnswers = [...metadata.answers];
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
              <h3 className="text-lg font-medium mt-2">{metadata.question}</h3>
            ) : (
              <Input
                placeholder={`Question ${index + 1}`}
                className="mt-2"
                value={metadata.question}
                onChange={(e) => handleQuestionChange(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {metadata.answers.map((ans, i) => (
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
          <Button variant="outline" size="icon" disabled>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
