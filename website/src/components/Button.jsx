import Link from 'next/link';
import clsx from 'clsx';

const styles = {
  primary:
    'rounded-full bg-violet-300 py-2 px-4 text-sm font-semibold text-slate-900 hover:bg-violet-400 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300/50 active:bg-violet-400 transition',
  secondary:
    'rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:text-slate-400 transition',
};

export function Button({ variant = 'primary', className, href, ...props }) {
  className = clsx(styles[variant], className);

  return href ? <Link href={href} className={className} {...props} /> : <button className={className} {...props} />;
}
