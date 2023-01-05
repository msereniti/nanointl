import { DarkMode, Gradient, LightMode } from '@/components/Icon';

export function BoltIcon({ id, color }) {
  return (
    <>
      <defs>
        <Gradient id={`${id}-gradient`} color={color} gradientTransform="matrix(0 21 -21 0 12 3)" />
        <Gradient id={`${id}-gradient-dark`} color={color} gradientTransform="matrix(0 21 -21 0 16 7)" />
      </defs>
      <LightMode>
        <circle cx={8} cy={8} r={8} fill={`url(#${id}-gradient)`} />
        <path
          fillOpacity={0.5}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="fill-[var(--icon-background)] stroke-[color:var(--icon-foreground)]"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </LightMode>
      <DarkMode>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke={`url(#${id}-gradient-dark)`}
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </DarkMode>
    </>
  );
}
