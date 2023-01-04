import { Listbox } from '@headlessui/react';
import { FunctionalComponent } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { Transition } from '@headlessui/react';
import { NanointlPlugin } from 'nanointl/makeIntl';
import { dateTimePlugin } from 'nanointl/datetime';
import { markdownPlugin } from 'nanointl/markdown';
import { tagsPlugin } from 'nanointl/tags';
import { numberPlugin } from 'nanointl/number';

export type Preset = {
  name: string;
  input: string;
  values: { [variableName: string]: any };
  plugins: NanointlPlugin<any>[];
};

export const presets: Preset[] = [
  {
    name: 'User checkout',
    input: '{count, plural, =0 {No items} one {One item} other {# items}} in your cart',
    values: { count: 0 },
    plugins: [],
  },
  {
    name: 'Prices',
    input: 'Just {price, number, ::currency/USD} a month',
    values: { price: 5 },
    plugins: [numberPlugin],
  },
  {
    name: 'Social network',
    input:
      '{gender, select, female {She has} male {He has} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
    values: { price: 5 },
    plugins: [numberPlugin],
  },
  {
    name: 'Markdown example',
    input: 'Hi, **{username}**! Next meeting at {next_meeting, date, ::hhmm}',
    values: {
      username: 'John Doe',
      next_meeting: new Date(),
    },
    plugins: [markdownPlugin],
  },
  {
    name: 'XML tags example',
    input: 'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, date, ::hhmm}',
    values: {
      username: 'John Doe',
      next_meeting: new Date(),
    },
    plugins: [markdownPlugin],
  },
];

export const initialPreset = presets[1];

export const variablesDefaultMapper = {
  tagsFallback: ({ children, tag: Tag }) => {
    if (Tag === 'script' || Tag === 'link') return '💩';
    if (!children) return <Tag />;
    return <Tag>{children}</Tag>;
  },
  strong: ({ children }) => <strong>{children}</strong>,
  emphasis: ({ children }) => <em>{children}</em>,
  code: ({ children }) => <code>{children}</code>,
  link: ({ children, url }) => (
    <a href={url} rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export const PresetsSelect: FunctionalComponent<{ initialPreset: Preset; onPresetChange: (preset: Preset) => void }> = ({
  initialPreset,
  onPresetChange,
}) => {
  const [preset, setPreset] = useState(initialPreset);
  const handlePresetChange = useCallback(
    (preset: Preset) => {
      setPreset(preset);
      onPresetChange(preset);
    },
    [onPresetChange],
  );
  const [overlayTransform, setOverlayTransform] = useState<undefined | string>(undefined);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setOverlayTransform(`translateY(-${presets.indexOf(preset) * 24}px)`);
    }, 100);

    return () => clearTimeout(timeout);
  }, [preset]);

  return (
    <Listbox value={preset} onChange={handlePresetChange} as="div" className="relative z-10">
      <Listbox.Button className="flex items-center border border-gray-300 pl-2 pr-1 rounded">
        {preset.name}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-1">
          <path
            fillRule="evenodd"
            d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </Listbox.Button>
      <Transition
        style={{ transform: overlayTransform }}
        className="absolute top-0 left-0 "
        enter="transition duration-150 ease-out"
        enterFrom="transform opacity-0"
        enterTo="transform opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform opacity-100"
        leaveTo="transform opacity-0"
      >
        <Listbox.Options className="border bg-slate-800 rounded w-60 text-left overflow-auto">
          {presets.map((preset): any => (
            <Listbox.Option key={preset.name} value={preset} className="cursor-pointer hover:bg-slate-700 px-2">
              {preset.name}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
};
