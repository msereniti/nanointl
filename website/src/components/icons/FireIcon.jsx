import { DarkMode, Gradient, LightMode } from '@/components/Icon';

export function FireIcon({ id, color }) {
  return (
    <>
      <defs>
        <Gradient id={`${id}-gradient`} color={color} gradientTransform="matrix(0 21 -21 0 20 11)" />
        <Gradient id={`${id}-gradient-dark`} color={color} gradientTransform="matrix(0 24.5001 -19.2498 0 16 5.5)" />
      </defs>
      <LightMode>
        <circle cx={16} cy={16} r={8} fill={`url(#${id}-gradient)`} />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
          className="stroke-[var(--icon-foreground)]"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
          className="stroke-[var(--icon-foreground)]"
        />
      </LightMode>
      <DarkMode>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
          stroke={`url(#${id}-gradient-dark)`}
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
          stroke={`url(#${id}-gradient-dark)`}
        />
      </DarkMode>
    </>
  );
}
