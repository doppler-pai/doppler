'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';
import { QuestionCard } from './QuestionCard';

export const SetForm = () => {
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState([{ id: '1' }]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>('1');

  const handleAddQuestion = (currentId: string) => {
    const currentIndex = questions.findIndex((q) => q.id === currentId);
    const newQuestion = { id: crypto.randomUUID() };
    const newQuestions = [...questions];
    newQuestions.splice(currentIndex + 1, 0, newQuestion);
    setQuestions(newQuestions);
    setActiveQuestionId(newQuestion.id);
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length === 1) return;
    const newQuestions = questions.filter((q) => q.id !== id);
    setQuestions(newQuestions);
    if (activeQuestionId === id) {
      setActiveQuestionId(null);
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
            <Input placeholder="Title" />
            <Textarea placeholder="Description" className="h-20 max-w-full" />
          </div>
        </div>
        <div className="mt-5 flex justify-between">
          <div className="flex items-center space-x-2">
            <Switch id="public-mode" checked={isPublic} onCheckedChange={setIsPublic} />
            <label htmlFor="public-mode">{isPublic ? 'Public' : 'Private'}</label>
          </div>
          <div>
            <Button>Save</Button>
          </div>
        </div>

        <div className="mt-10 mb-20 flex flex-col gap-6">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              id={question.id}
              index={index}
              isSelected={activeQuestionId === question.id}
              onSelect={setActiveQuestionId}
              onAdd={handleAddQuestion}
              onDelete={handleDeleteQuestion}
            />
          ))}
        </div>
      </div>
    </main>
  );
};
