import { DarkMode, Gradient, LightMode } from '@/components/Icon';

export function PluginsIcon({ id, color }) {
  return (
    <>
      <defs>
        <Gradient id={`${id}-gradient`} color={color} gradientTransform="matrix(0 21 -21 0 20 11)" />
        <Gradient id={`${id}-gradient-dark-1`} color={color} gradientTransform="matrix(0 22.75 -22.75 0 16 6.25)" />
        <Gradient id={`${id}-gradient-dark-2`} color={color} gradientTransform="matrix(0 14 -14 0 16 10)" />
      </defs>
      <LightMode>
        <circle cx={16} cy={16} r={8} fill={`url(#${id}-gradient)`} />
        <path
          fillOpacity={0.5}
          className="fill-[var(--icon-background)] stroke-[color:var(--icon-foreground)]"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
          stroke={`url(#${id}-gradient-dark-2)`}
        />
      </LightMode>
      <DarkMode strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
          stroke={`url(#${id}-gradient-dark-2)`}
        />
      </DarkMode>
    </>
  );
}
