'use client';

import { Pen, Trash2, Forward, Play } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SetCardProps {
  id: string;
  title: string;
  plays: number;
  edited: number;
  questions: number;
  onDelete?: () => void;
}

export const SetCard = ({ id, title, plays, edited, questions, onDelete }: SetCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/sets/${id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete();
      setIsDeleteDialogOpen(false);
    }
  };

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
        <div className="mt-2 mx-5 flex flex-row justify-between items-center relative">
          <Link href={`/sets/edit/${id}`}>
            <Pen className="text-text cursor-pointer hover:text-primary transition-colors" />
          </Link>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Trash2 className="text-text cursor-pointer hover:text-red-500 transition-colors" />
            </DialogTrigger>
            <DialogContent className="bg-bg-dark border-gray-700 text-text">
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription className="text-gray-400">
                  This action cannot be undone. This will permanently delete the set &quot;{title}&quot;.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="bg-transparent border-gray-600 hover:bg-gray-800 text-text"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="relative" ref={menuRef}>
            <Forward
              className="text-text cursor-pointer hover:text-primary transition-colors"
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <div className="absolute top-8 right-0 bg-bg-very-dark rounded shadow-lg p-2 z-10 w-32">
                <button
                  onClick={handleCopyLink}
                  className="w-full text-left text-sm text-text hover:text-primary transition-colors px-2 py-1"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-around">
          <Button>
            <Play /> solo
          </Button>
          <Button onClick={() => router.push(`/sets/host/?setId=${id}`)}>
            <Play /> host
          </Button>
        </div>
      </div>
    </div>
  );
};
