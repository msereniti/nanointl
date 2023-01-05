import { useId } from 'react';
import clsx from 'clsx';

import { BoltIcon } from '@/components/icons/BoltIcon';
import { FireIcon } from '@/components/icons/FireIcon';
import { PluginsIcon } from '@/components/icons/PluginsIcon';
import { SafetyIcon } from '@/components/icons/SafetyIcon';
import { RocketIcon } from '@/components/icons/RocketIcon';
import { WarningIcon } from '@/components/icons/WarningIcon';

const icons = {
  bolt: BoltIcon,
  safety: SafetyIcon,
  plugins: PluginsIcon,
  rocket: RocketIcon,
  fire: FireIcon,
  warning: WarningIcon,
};

const iconStyles = {
  blue: '[--icon-foreground:theme(colors.slate.900)] [--icon-background:theme(colors.white)]',
  amber: '[--icon-foreground:theme(colors.amber.900)] [--icon-background:theme(colors.amber.100)]',
};

export function Icon({ color = 'blue', icon, className, ...props }) {
  let id = useId();
  let IconComponent = icons[icon];

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={clsx(className, iconStyles[color])} {...props}>
      <IconComponent id={id} color={color} />
    </svg>
  );
}

const gradients = {
  blue: [{ stopColor: '#a78bfa' }, { stopColor: '#8b5cf6', offset: '.527' }, { stopColor: '#7c3aed', offset: 1 }],
  amber: [
    { stopColor: '#FDE68A', offset: '.08' },
    { stopColor: '#F59E0B', offset: '.837' },
  ],
};

export function Gradient({ color = 'blue', ...props }) {
  return (
    <radialGradient cx={0} cy={0} r={1} gradientUnits="userSpaceOnUse" {...props}>
      {gradients[color].map((stop, stopIndex) => (
        <stop key={stopIndex} {...stop} />
      ))}
    </radialGradient>
  );
}

export function LightMode({ className, ...props }) {
  return <g className={clsx('dark:hidden', className)} {...props} />;
}

export function DarkMode({ className, ...props }) {
  return <g className={clsx('hidden dark:inline', className)} {...props} />;
}
