import { Input } from '@/shared/components/ui/input';
import { Plus, Trash2, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { QuestionCardProps } from '@/features/sets/models/sets.type';

export function QuestionCard({ id, index, isSelected, onSelect, onAdd, onDelete }: QuestionCardProps) {
  return (
    <div className="relative flex w-full">
      {/* Main Card Content */}
      <div className={cn('w-full rounded-lg border-2 p-6 transition-colors bg-bg-dark')} onClick={() => onSelect(id)}>
        <div className="mb-4">
          <Input placeholder={`Question ${index + 1}`} className="mt-2" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-2 rounded-md border bg-bg-very-dark p-3',
                i === 1
                  ? 'border-orange-500'
                  : i === 2
                    ? 'border-purple-500'
                    : i === 3
                      ? 'border-green-500'
                      : 'border-blue-500',
              )}
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-background">
                <input type="checkbox" className="w-[80%] h-[80%]" />
              </div>
              <Input
                placeholder={`Answer ${i}`}
                className="border-none bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Side Action Bar - Visible only when selected */}
      {isSelected && (
        <div className="absolute -right-16 top-0 flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(id);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
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
