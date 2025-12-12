export type QuestionCardProps = {
  id: string;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onAdd: (id: string) => void;
  onDelete: (id: string) => void;
};
