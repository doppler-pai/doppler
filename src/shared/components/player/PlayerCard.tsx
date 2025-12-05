import Image from 'next/image';

type PlayerCardProps = {
  image: string;
  nick: string;
  label?: string;
};

export function PlayerCard({ image, nick }: PlayerCardProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 overflow-hidden">
        <Image src={image} alt={nick} fill className="object-cover" />
      </div>
      <div>
        <h4>{nick}</h4>
      </div>
    </div>
  );
}
