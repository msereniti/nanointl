import { DarkMode, Gradient, LightMode } from '@/components/Icon';

export function SafetyIcon({ id, color }) {
  return (
    <>
      <defs>
        <Gradient id={`${id}-gradient`} color={color} gradientTransform="matrix(0 21 -21 0 20 3)" />
        <Gradient id={`${id}-gradient-dark`} color={color} gradientTransform="matrix(0 22.75 -22.75 0 16 6.25)" />
      </defs>
      <LightMode>
        <circle cx={16} cy={8} r={8} fill={`url(#${id}-gradient)`} />
        <path
          className="fill-[var(--icon-background)] stroke-[color:var(--icon-foreground)]"
          fillOpacity={0.5}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </LightMode>
      <DarkMode stroke={`url(#${id}-gradient-dark)`}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </DarkMode>
    </>
  );
}
