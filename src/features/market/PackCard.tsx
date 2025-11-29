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
      gradient: 'radial-gradient(circle at center 35%, #F1F1F9 0%, #00AAFF 100%)',
      imageSrc: '/packs/clashRoyale/common.png',
      price: 100,
    },
    epic: {
      gradient: 'radial-gradient(circle at center 35%, #F1F1F9 0%, #7B2CBF 100%',
      imageSrc: '/packs/clashRoyale/epic.png',
      price: 250,
    },
    legendary: {
      gradient: 'radial-gradient(circle at center 35%, #F1F1F9 0%, #FF9E00 100%',
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
      className="p-4 rounded-lg text-white flex flex-col items-center h-68 w-54"
    >
      <img src={configuration.imageSrc} alt="image" className="w-[120px] h-[130px] object-cover rotate-10 mt-4" />
      <div className='flex items-center mt-6 mb-2 gap-3'>
        <h4 className="text-white text-lg">{configuration.price}</h4>
        <img src="/logo/logo.png" alt="coin" className="w-6 h-6" />
      </div>
      <Button className='w-32 h-8'>Buy</Button>
    </div>
  );
};
