import Image from 'next/image';
import { Button } from '@/shared/components/ui/button';
import type { Rarity } from '@/shared/models/rarity';

type PackCardProps = {
  rarity: Rarity;
  price: number;
  image: string;
  onBuy?: (price: number) => void;
};

export function PackCard({ rarity, price, image, onBuy }: PackCardProps) {
  return (
    <div className={`gradient-${rarity} p-4 rounded-lg text-white flex flex-col items-center h-68 w-54`}>
      <Image src={image} alt={`${rarity} pack`} width={120} height={130} className="object-cover rotate-10 mt-4" />
      <div className="flex items-center mt-6 mb-2 gap-3">
        <h4 className="text-white text-lg">{price}</h4>
        <Image src="/logo/logo.png" alt="coin" width={24} height={24} />
      </div>
      <Button className="w-32 h-8" onClick={() => onBuy?.(price)}>
        Buy
      </Button>
    </div>
  );
}
