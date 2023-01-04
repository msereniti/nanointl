import { AstNode } from 'nanointl/parse';
import { FunctionalComponent } from 'preact';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';
import cx from 'classnames';

const className = 'border border-t-0 first:border-t first:rounded-t last:rounded-b p-1 transition w-72';

const magicNumbers = [42, 0, 1, 2, 5, 16.6, 100, -36, 999, 7583462, 981237414276, 11];
let nextMagicNumber = 0;

const NumberInterpolation: FunctionalComponent<{
  node: Exclude<AstNode, string>;
  value: string;
  onChange: (value: number) => void;
}> = ({ node, value, onChange }) => {
  const handleChange = useCallback(
    (event: JSXInternal.TargetedEvent<HTMLInputElement>) => {
      const value = parseFloat(event.currentTarget.value);
      if (Number.isNaN(value)) return;
      onChange(value);
    },
    [onChange],
  );
  const handleMinus = useCallback(
    (event: Event) => {
      event.preventDefault();
      Number.isNaN(parseFloat(value)) ? onChange(0) : onChange(parseFloat(value) - 1);
    },
    [value, onChange],
  );
  const handlePlus = useCallback(
    (event: Event) => {
      event.preventDefault();
      Number.isNaN(parseFloat(value)) ? onChange(0) : onChange(parseFloat(value) + 1);
    },
    [value, onChange],
  );
  const handleMagic = useCallback(
    (event: Event) => {
      event.preventDefault();
      if (nextMagicNumber >= magicNumbers.length) nextMagicNumber = 0;
      onChange(magicNumbers[nextMagicNumber]);
      nextMagicNumber++;
    },
    [onChange],
  );
  const preventDefault = useCallback((event: Event) => event.preventDefault(), []);

  if (node.type !== 'plural' && node.type !== 'external') return null;
  const label = node.type === 'plural' ? node.variable.name : node.variableName;

  return (
    <div className={className}>
      <label className="text-xs text-gray-400">{label} (number)</label>
      <div className="flex">
        <input
          type="number"
          className="bg-slate-800 flex-grow border-b border-transparent focus:border-gray-200 outline-none"
          value={value}
          onChange={handleChange}
        />
        <div className="flex right-0 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-50 hover:scale-110 transition"
            onClick={handleMinus}
            onDblClick={preventDefault}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 ml-1 cursor-pointer  text-gray-500 hover:text-gray-50 hover:scale-110 transition"
            onClick={handlePlus}
            onDblClick={preventDefault}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 ml-1 cursor-pointer  text-gray-500 hover:text-gray-50 hover:scale-110 transition"
            onClick={handleMagic}
            onDblClick={preventDefault}
          >
            <path
              fillRule="evenodd"
              d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const SelectInterploation: FunctionalComponent<{
  node: Exclude<AstNode, string>;
  value: any;
  onChange: (value: any) => void;
}> = ({ node, value, onChange }) => {
  if (node.type !== 'select') return null;
  const optionsList = useMemo(() => Object.keys(node.options), [node.options]);

  return (
    <div className={className}>
      <label className="text-xs text-gray-400">{node.variable.name} (select)</label>
      <div className="flex flex-wrap justify-start">
        {optionsList.map((option) => {
          return (
            <div
              key={option}
              onClick={() => onChange(option)}
              className={cx(
                `p-1 border border-transparent hover:border-white bg-transparent hover:bg-white/10 hover:scale-105 rounded cursor-pointer transition mr-2`,
                option === value && `border-white`,
              )}
            >
              {option}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const magicDates = [
  new Date(),
  new Date(Date.now() + 1000 * 60 * 60 * 24),
  new Date(Date.now() + 1000 * 60 * 60 * -24),
  new Date(0),
  new Date(9999999999999),
];
let nextMagicDate = 0;

const DateInterpolation: FunctionalComponent<{
  node: Exclude<AstNode, string>;
  value: Date;
  onChange: (value: Date) => void;
}> = ({ node, value, onChange }) => {
  const handleMinus = useCallback(
    (event: Event) => {
      event.preventDefault();
      const date = new Date(new Date(value).getTime() - 1000 * 60 * 60 * 24);
      onChange(date);
    },
    [value, onChange],
  );
  const handlePlus = useCallback(
    (event: Event) => {
      event.preventDefault();
      const date = new Date(new Date(value).getTime() + 1000 * 60 * 60 * 24);
      onChange(date);
    },
    [value, onChange],
  );
  const handleMagic = useCallback(
    (event: Event) => {
      event.preventDefault();
      if (nextMagicDate >= magicDates.length) nextMagicDate = 0;
      onChange(magicDates[nextMagicDate]);
      nextMagicDate++;
    },
    [onChange],
  );
  const preventDefault = useCallback((event: Event) => event.preventDefault(), []);
  const [internalValue, setInternalValue] = useState('');
  const handleChange = useCallback((event: JSXInternal.TargetedEvent<HTMLInputElement>) => {
    setInternalValue(event.currentTarget.value);
  }, []);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === 'Enter') {
        const date = new Date(internalValue);
        if (Number.isNaN(date.getTime())) onChange(new Date());
        else onChange(date);
      }
      if (event.code === 'Escape') {
        const date = new Date(value);
        setInternalValue(date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear());
      }
    },
    [value, onChange, internalValue],
  );
  const handleBlur = useCallback(() => {
    const date = new Date(internalValue);
    if (Number.isNaN(date.getTime())) onChange(new Date());
    else onChange(date);
  }, [internalValue]);
  useEffect(() => {
    const date = new Date(value);

    setInternalValue(date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear());
  }, [value]);

  if (node.type !== 'external') return null;

  return (
    <div className={className}>
      <label className="text-xs text-gray-400">{node.variableName} (date)</label>
      <div className="flex">
        <input
          className="bg-slate-800 flex-grow border-b border-transparent focus:border-gray-200 outline-none"
          value={internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
        <div className="flex right-0 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-50 hover:scale-110 transition"
            onClick={handleMinus}
            onDblClick={preventDefault}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 ml-1 cursor-pointer  text-gray-500 hover:text-gray-50 hover:scale-110 transition"
            onClick={handlePlus}
            onDblClick={preventDefault}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 ml-1 cursor-pointer  text-gray-500 hover:text-gray-50 hover:scale-110 transition"
            onClick={handleMagic}
            onDblClick={preventDefault}
          >
            <path
              fillRule="evenodd"
              d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

const magicTimes = [
  new Date(),
  new Date(Date.now() + 1000 * 60 * 0.25),
  new Date(Date.now() + 1000 * 60 * 0.25),
  new Date(0),
  new Date(9999999999999),
];
let nextMagicTime = 0;

const TimeInterpolation: FunctionalComponent<{
  node: Exclude<AstNode, string>;
  value: Date;
  onChange: (value: Date) => void;
}> = ({ node, value, onChange }) => {
  const handleMinus = useCallback(
    (event: Event) => {
      event.preventDefault();
      const date = new Date(new Date(value).getTime() - 1000 * 60 * 0.5);
      onChange(date);
    },
    [value, onChange],
  );
  const handlePlus = useCallback(
    (event: Event) => {
      event.preventDefault();
      const date = new Date(new Date(value).getTime() + 1000 * 60 * 0.5);
      onChange(date);
    },
    [value, onChange],
  );
  const handleMagic = useCallback(
    (event: Event) => {
      event.preventDefault();
      if (nextMagicTime >= magicTimes.length) nextMagicTime = 0;
      onChange(magicTimes[nextMagicTime]);
      nextMagicTime++;
    },
    [onChange],
  );
  const preventDefault = useCallback((event: Event) => event.preventDefault(), []);
  const [internalValue, setInternalValue] = useState('');
  const handleChange = useCallback((event: JSXInternal.TargetedEvent<HTMLInputElement>) => {
    setInternalValue(event.currentTarget.value);
  }, []);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === 'Enter') {
        const date = new Date();
        const [hours, minutes, seconds] = internalValue.split(':');
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        date.setSeconds(parseInt(seconds, 10));
        if (Number.isNaN(date.getTime())) onChange(new Date());
        else onChange(date);
      }
      if (event.code === 'Escape') {
        const date = new Date(value);
        setInternalValue(
          [date.getHours(), date.getMinutes(), date.getSeconds()]
            .map((timeChunk) => timeChunk.toString().padStart(2, '0'))
            .join(':'),
        );
      }
    },
    [value, onChange, internalValue],
  );
  const handleBlur = useCallback(() => {
    const date = new Date();
    const [hours, minutes, seconds] = internalValue.split(':');
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(parseInt(seconds, 10));
    if (Number.isNaN(date.getTime())) onChange(new Date());
    else onChange(date);
  }, [internalValue]);
  useEffect(() => {
    const date = new Date(value);

    setInternalValue(
      [date.getHours(), date.getMinutes(), date.getSeconds()].map((timeChunk) => timeChunk.toString().padStart(2, '0')).join(':'),
    );
  }, [value]);

  if (node.type !== 'external') return null;

  return (
    <div className={className}>
      <label className="text-xs text-gray-400">{node.variableName} (time)</label>
      <div className="flex">
        <input
          className="bg-slate-800 flex-grow border-b border-transparent focus:border-gray-200 outline-none"
          value={internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
        <div className="flex right-0 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-50 hover:scale-110 transition"
            onClick={handleMinus}
            onDblClick={preventDefault}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 ml-1 cursor-pointer  text-gray-500 hover:text-gray-50 hover:scale-110 transition"
            onClick={handlePlus}
            onDblClick={preventDefault}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 ml-1 cursor-pointer  text-gray-500 hover:text-gray-50 hover:scale-110 transition"
            onClick={handleMagic}
            onDblClick={preventDefault}
          >
            <path
              fillRule="evenodd"
              d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const MappingDisplay: FunctionalComponent<{
  node: Exclude<AstNode, string>;
}> = ({ node }) => {
  if (node.type !== 'external') return null;

  const label = useMemo(() => {
    if (node.name === 'md-token') {
      if (node.variableName === 'strong') return 'markdown **strong text**';
      if (node.variableName === 'emphasis') return 'markdown _emphasis text_';
      if (node.variableName === 'link') return 'markdown [link text](https://example.com)';
    }
    if (node.name === 'tag') {
      return `xml tag <${node.variableName} /> as is`;
    }
    return '???';
  }, []);
  const output = useMemo(() => {
    if (node.name === 'md-token') {
      if (node.variableName === 'strong') return '({ children }) => `<strong>${children}</strong>`';
      if (node.variableName === 'emphasis') return '({ children }) => `<em>${children}</em>`';
      if (node.variableName === 'link') return '({ children, url }) => `<a href={url}>${children}</a>`';
    }
    if (node.name === 'tag') {
      return `({ children }) => <${node.variableName}>\${children}</${node.variableName}>`;
    }
    return '???';
  }, []);

  return (
    <div className={className}>
      <label className="text-xs text-gray-400">{label} (mapping)</label>
      <div className="flex flex-wrap justify-start font-mono text-xs">{output}</div>
    </div>
  );
};

export const Interpolation: FunctionalComponent<{
  node: Exclude<AstNode, string>;
  value: any;
  onChange: (value: any) => void;
}> = ({ node, value, onChange }) => {
  if (node.type === 'plural') return <NumberInterpolation node={node} value={value} onChange={onChange} />;
  if (node.type === 'external' && node.name === 'number')
    return <NumberInterpolation node={node} value={value} onChange={onChange} />;
  if (node.type === 'select') return <SelectInterploation node={node} value={value} onChange={onChange} />;
  if (node.type === 'external' && node.name === 'date')
    return <DateInterpolation node={node} value={value} onChange={onChange} />;
  if (node.type === 'external' && node.name === 'time')
    return <TimeInterpolation node={node} value={value} onChange={onChange} />;
  if (node.type === 'external' && (node.name === 'md-token' || node.name === 'tag')) return <MappingDisplay node={node} />;

  const label = useMemo(() => {
    if ('variableName' in node) return node.variableName;
    if ('name' in node) return node.name;
    return node.type;
  }, []);

  return (
    <div className={className}>
      <label className="text-xs text-gray-400">{label} (string)</label>
      <div>
        <input
          className="bg-slate-800 flex-grow border-b border-transparent focus:border-gray-200 outline-none"
          value={value}
          onChange={(event: any) => onChange(event.target?.value ?? '')}
        />
      </div>
    </div>
  );
};
