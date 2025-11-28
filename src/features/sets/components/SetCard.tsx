import { Pen, Trash2, Forward, Play } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { SetCardProps } from '../models/sets.type';

export const SetCard = ({ name, plays, edited }: SetCardProps) => {
  return (
    <div className="m-10 w-70 rounded-md" id="SetCard">
      <div className="w-100%">
        <img src="/sets/setCover.png" alt="cover" className="w-100%" />
      </div>
      <div className=" px-3 w-100% bg-bg-dark h-55     rounded-b-md">
        <h2 className="pt-2 mb-5">{name}</h2>
        {<h3 className="">{plays.toString()} plays</h3>}{' '}
        <small className="">edited {edited.toString()} minutes ago</small>
        <div className="mt-2 mx-5 flex flex-row justify-between">
          <Pen className="text-text" />
          <Trash2 className="text-text" />
          <Forward className="text-text" />
        </div>
        <div className="mt-4 flex justify-around">
          <Button>
            {' '}
            <Play /> solo
          </Button>
          <Button>
            {' '}
            <Play /> host
          </Button>
        </div>
      </div>
    </div>
  );
};
