'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/button';
import { config } from 'process';

interface SkinCardProps {
  variant: 'common' | 'epic' | 'legendary';
}

export const PackCard: React.FC<SkinCardProps> = ({ variant }) => {
  const VARIANTS = {
    common: {
      gradient: 'radial-gradient(circle, #F1F1F9 0%, #00AAFF 100%)',
      imageSrc: '',
      price: 100,
    },
    epic: {
      gradient: 'radial-gradient(circle, #F1F1F9 0%, #7B2CBF 100%',
      imageSrc: '',
      price: 250,
    },
    legendary: {
      gradient: 'radial-gradient(circle, #F1F1F9 0%, #FF9E00 100%',
      imageSrc: '',
      price: 500,
    },
  };

  const configuration = VARIANTS[variant];

  if (!configuration) {
    throw new Error('Unknown variant: ${variant}');
  }

  return (
    <div
      style={{ background: configuration.gradient }}
      className="p-4 rounded-lg text-white flex flex-col items-center h-62 w-52"
    >
      <h3 className="text-lg font-bold">{name}</h3>
    </div>
  );
};
