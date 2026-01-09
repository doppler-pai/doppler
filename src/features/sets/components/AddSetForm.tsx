'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';
import { QuestionCard } from './QuestionCard';
import { SetData, Question, QuestionType } from '@/shared/models/sets.type';

interface SetFormProps {
  initialData?: SetData;
  onSubmit: (data: Omit<SetData, 'id'> | SetData) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

const DEFAULT_QUESTION: Question = {
  type: QuestionType.FOUR_OPTIONS,
  metadata: {
    question: '',
    answers: [
      { answer: '', isCorrect: false },
      { answer: '', isCorrect: false },
      { answer: '', isCorrect: false },
      { answer: '', isCorrect: false },
    ],
  },
};

export const SetForm = ({ initialData, onSubmit, isLoading, readOnly = false }: SetFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);
  const [questions, setQuestions] = useState<Question[]>(initialData?.questions || [DEFAULT_QUESTION]);

  const [errors, setErrors] = useState<{ title?: string; description?: string; questions?: string }>({});

  // State syncing is handled by the parent component (EditSet) using the `key` prop to force re-mounting when data changes.

  // Use index as ID for selection for simplicity in this session.
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(0);

  const handleAddQuestion = (index: number) => {
    // insert after index
    const newQuestion = JSON.parse(JSON.stringify(DEFAULT_QUESTION)); // Deep copy
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    setQuestions(newQuestions);
    setActiveQuestionIndex(index + 1);
  };

  const handleDeleteQuestion = (indexStr: string) => {
    const index = parseInt(indexStr);
    if (questions.length === 1) return;
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    if (activeQuestionIndex === index) {
      setActiveQuestionIndex(null);
    } else if (activeQuestionIndex !== null && activeQuestionIndex > index) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];

    setQuestions(newQuestions);

    if (activeQuestionIndex === index) {
      setActiveQuestionIndex(targetIndex);
    } else if (activeQuestionIndex === targetIndex) {
      setActiveQuestionIndex(index);
    }
  };

  const handleQuestionChange = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const validate = (): boolean => {
    const newErrors: { title?: string; description?: string; questions?: string } = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }
    if (questions.length === 0) {
      newErrors.questions = 'At least one question is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data: Omit<SetData, 'id'> = {
      title,
      description,
      isPublic,
      ownerId: initialData?.ownerId || 'current-user-id', // TODO: Get actual user ID
      questions,
    };
    if (initialData?.id) {
      await onSubmit({ ...data, id: initialData.id });
    } else {
      await onSubmit(data);
    }
  };

  return (
    <main>
      <div className="mt-[5%] mx-[10%]">
        <div className="flex justify-between">
          <div className="w-85">
            <Image src="/sets/setCover2.png" alt="cover" width={500} height={500} className="w-full" />
          </div>
          <div className="w-[70%] flex flex-col justify-between">
            <div className="flex flex-col gap-1">
              {readOnly ? (
                <h1 className="text-2xl font-bold p-2">{title}</h1>
              ) : (
                <>
                  <Input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <small className="text-red-500">{errors.title}</small>}
                </>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {readOnly ? (
                <p className="p-2 text-muted-foreground whitespace-pre-wrap">{description}</p>
              ) : (
                <>
                  <Textarea
                    placeholder="Description"
                    className={`h-20 max-w-full ${errors.description ? 'border-red-500' : ''}`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  {errors.description && <small className="text-red-500">{errors.description}</small>}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-between">
          <div className="flex items-center space-x-2">
            <Switch id="public-mode" checked={isPublic} onCheckedChange={setIsPublic} disabled={readOnly} />
            <label htmlFor="public-mode">{isPublic ? 'Public' : 'Private'}</label>
          </div>
          {!readOnly && (
            <div className="flex flex-col items-end">
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
              {errors.questions && <small className="text-red-500 mt-1">{errors.questions}</small>}
            </div>
          )}
        </div>

        <div className="mt-10 mb-20 flex flex-col gap-6">
          {questions.map((question, index) => (
            <QuestionCard
              key={index}
              index={index}
              question={question}
              isSelected={activeQuestionIndex === index}
              onSelect={() => setActiveQuestionIndex(index)}
              onAdd={() => handleAddQuestion(index)}
              onDelete={handleDeleteQuestion}
              onMoveUp={() => handleMoveQuestion(index, 'up')}
              onMoveDown={() => handleMoveQuestion(index, 'down')}
              onChange={(q) => handleQuestionChange(index, q)}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </main>
  );
};
