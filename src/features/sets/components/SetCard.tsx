'use client';

import { Pen, Trash2, Forward, Play } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface SetCardProps {
  id: string;
  title: string;
  plays: number;
  edited: number;
  questions: number;
}

export const SetCard = ({ id, title, plays, edited, questions }: SetCardProps) => {
  return (
    <div className="m-10 w-70 rounded-md" id="SetCard">
      <div className="relative">
        <Link href={`/sets/${id}`}>
          <Image
            src="/sets/setCover.png"
            alt="cover"
            width={500}
            height={500}
            className="w-full cursor-pointer hover:opacity-90 transition-opacity"
          />
        </Link>
        <div className="absolute bottom-2 right-2 bg-bg-very-dark/70 px-2 py-1 rounded text-text flex justify-center items-center">
          <small>{questions} questions</small>
        </div>
      </div>
      <div className=" px-3 w-full bg-bg-dark h-55 rounded-b-md">
        <h2 className="pt-2 mb-5">{title}</h2>
        {<h3 className="">{plays} plays</h3>} <small className="">edited {edited} minutes ago</small>
        <div className="mt-2 mx-5 flex flex-row justify-between">
          <Link href={`/sets/edit/${id}`}>
            <Pen className="text-text cursor-pointer hover:text-primary transition-colors" />
          </Link>
          <Trash2 className="text-text" />
          <Forward className="text-text" />
        </div>
        <div className="mt-4 flex justify-around">
          <Button>
            <Play /> solo
          </Button>
          <Button>
            <Play /> host
          </Button>
        </div>
      </div>
    </div>
  );
};
