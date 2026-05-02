import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', image: 32 },
  md: { container: 'w-12 h-12', image: 48 },
  lg: { container: 'w-16 h-16', image: 64 },
  xl: { container: 'w-24 h-24', image: 96 },
};

export function Logo({ size = 'md', className, showText = false }: LogoProps) {
  const { container, image } = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative flex items-center justify-center', container)}>
        <Image
          src="/zexy_logo_nobg.png"
          alt="Zexy Logo"
          width={image}
          height={image}
          priority
          className="object-contain"
        />
      </div>
      {showText && (
        <span className="text-xl font-bold">Zexy</span>
      )}
    </div>
  );
}
