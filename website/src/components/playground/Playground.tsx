import { AstNode, ExternalParsers, parseIcu, PostParser } from 'nanointl/parse';
import { NanointlPlugin } from 'nanointl/makeIntl';
import { ExternalSerializers, serializeIcu } from 'nanointl/serialize';
import { makeIntlBase } from 'nanointl/intlBase';
import { getCursorPosition, restoreCursorPosition } from './cursor';
import { initialPreset, Preset, variablesDefaultMapper, presets } from './Presets';
import { getAstInterpolations, interpolationDefaultValues } from './ast';
import clsx from 'clsx';
import React from 'react';

import { numberPlugin } from 'nanointl/number';
import { dateTimePlugin } from 'nanointl/datetime';
import { markdownPlugin } from 'nanointl/markdown';
import { tagsPlugin } from 'nanointl/tags';

const allPlugins = [numberPlugin, dateTimePlugin, markdownPlugin, tagsPlugin];

function TrafficLightsIcon(props) {
  return (
    <svg aria-hidden="true" viewBox="0 0 42 10" fill="none" {...props}>
      <circle cx="5" cy="5" r="4.5" />
      <circle cx="21" cy="5" r="4.5" />
      <circle cx="37" cy="5" r="4.5" />
    </svg>
  );
}

export const Playground: React.FC = () => {
  const [currentPreset, setCurrentPreset] = React.useState(initialPreset.name);
  const [initInput, setInitInput] = React.useState(initialPreset.input);
  const [interpolations, setInterpolations] = React.useState<Exclude<AstNode, string>[]>([]);
  const [values, setValues] = React.useState<{ [variableName: string]: any }>({
    ...variablesDefaultMapper,
    ...initialPreset.values,
  });
  const [plugins, setPlugins] = React.useState<NanointlPlugin[]>(initialPreset.plugins);

  const [output, setOutput] = React.useState<string>('');
  const [error, setError] = React.useState<null | string>(null);

  const [locale, setLocale] = React.useState('en');
  const localeContainerRef = React.useRef<HTMLSpanElement>(null);
  const handleLocaleChange = React.useCallback((event: React.ChangeEvent) => {
    setLocale(event.target.textContent);
    if (!localeContainerRef.current) return;
    const cursorPosition = getCursorPosition(localeContainerRef.current);
    setLocale(localeContainerRef.current.innerText.replaceAll(/\s/g, ' '));

    requestAnimationFrame(() => {
      if (!localeContainerRef.current) return;
      if (!cursorPosition) return;
      restoreCursorPosition(localeContainerRef.current, cursorPosition);
    });
  }, []);

  const [input, setInput] = React.useState(initInput);
  const inputContainerRef = React.useRef<HTMLSpanElement>(null);
  const handleInputChange = React.useCallback(() => {
    if (!inputContainerRef.current) return;
    const input = inputContainerRef.current.innerText.replaceAll('\n', '').replaceAll('\r', '');
    const cursorPosition = getCursorPosition(inputContainerRef.current);
    processInput(input, locale, values, plugins);

    requestAnimationFrame(() => {
      if (!inputContainerRef.current) return;
      if (!cursorPosition) return;
      restoreCursorPosition(inputContainerRef.current, cursorPosition);
    });
  }, [values, locale, plugins]);

  const editedInterpolationContainerRef = React.useRef<HTMLSpanElement>(null);
  const handleInterpolationChange = React.useCallback(
    (name: string, type: 'number' | 'date' | 'string') => () => {
      if (!editedInterpolationContainerRef.current) return;
      const cursorPosition = getCursorPosition(editedInterpolationContainerRef.current);
      const textValue = editedInterpolationContainerRef.current.textContent.replaceAll('\n', '').replaceAll('\r', '');
      let parsedValue = textValue;
      if (type === 'number') {
        parsedValue = parseFloat(textValue);
      } else if (type === 'date') {
        parsedValue = new Date(textValue);
        if (Number.isNaN(parsedValue.getTime())) parsedValue = new Date();
      }
      setValues((prevValues) => ({ ...prevValues, [name]: parsedValue }));

      requestAnimationFrame(() => {
        if (!editedInterpolationContainerRef.current) return;
        if (!cursorPosition) return;
        restoreCursorPosition(editedInterpolationContainerRef.current, cursorPosition);
      });
    },
    [values, plugins],
  );

  const safeOutput = React.useMemo(() => {
    if (typeof output === 'string') return output;
    if (!Array.isArray(output)) return null;
    return output.map((chunk) => {
      if (typeof chunk === 'object' && '$$typeof' in chunk) return chunk;
      return String(chunk);
    });
  }, [output]);

  const setPreset = React.useCallback((preset: Preset) => {
    setCurrentPreset(preset.name);
    setInitInput(preset.input);
    setInput(preset.input);
    setValues({ ...variablesDefaultMapper, ...preset.values });
    setPlugins(preset.plugins);
    setLocale(preset.locale);
  }, []);
  const processInput = React.useCallback(
    (input: string, locale: string, values: { [variableName: string]: any }, plugins: NanointlPlugin[]) => {
      setInput(input);
      try {
        const externalParsers: ExternalParsers = {};
        const externalSerializers: ExternalSerializers = {};
        const postParsers: PostParser<AstNode[], AstNode[]>[] = [];
        for (const plugin of plugins) {
          plugin.init({
            addParser: (token, parser) => (externalParsers[token] = parser),
            addSerializer: (token, serializer) => (externalSerializers[token] = serializer),
            addPostParser: (postParser) => {
              postParsers.push(postParser);
            },
          });
        }
        const ast = parseIcu(input, { postParsers, externalParsers });
        const intlBase = makeIntlBase(locale);
        const interpolations = getAstInterpolations(ast);
        const defaultValues = interpolationDefaultValues(interpolations);
        setOutput(serializeIcu(ast, { ...defaultValues, ...values }, intlBase, { externalSerializers }));
        setInterpolations(interpolations);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setOutput('');
      }
    },
    [],
  );
  React.useEffect(() => {
    processInput(initInput, locale, values, plugins);
  }, [initInput]);
  React.useEffect(() => {
    processInput(input, locale, values, plugins);
  }, [values, locale, plugins]);

  const [animation, setAnimation] = React.useState<'play' | 'pause'>('play');
  const animationRef = React.useRef<{
    preset: string;
    frame: number;
    lastInput: string;
    lastValues: { [variableName: string]: any };
    pauseUntil: number;
    lastLocale: string;
    lastPlugins: NanointlPlugin[];
    scrollAttach: 'no' | 'left' | 'right';
  } | null>(null);
  React.useEffect(() => {
    if (animation !== 'play') return;
    const preset = presets.find(({ name }) => name === currentPreset);
    if (!preset.aniamtion) return;
    if (animationRef.current?.preset !== currentPreset) {
      animationRef.current = {
        preset: currentPreset,
        frame: 0,
        lastInput: '',
        lastValues: {},
        pauseUntil: 0,
        lastLocale: preset.locale,
        lastPlugins: [],
        scrollAttach: 'no',
      };
    }
    const handleNextFrame = () => {
      if (animationRef.current.pauseUntil > Date.now()) return;

      const frame = preset.aniamtion[animationRef.current.frame];
      const input = typeof frame === 'string' ? frame : animationRef.current.lastInput;
      let values = animationRef.current.lastValues;
      let locale = animationRef.current.lastLocale;
      let plugins = animationRef.current.lastPlugins;
      let scrollAttach = animationRef.current.scrollAttach;
      if (typeof frame === 'object') {
        if ('values' in frame) values = frame.values;
        if ('pause' in frame) animationRef.current.pauseUntil = Date.now() + frame.pause;
        if ('locale' in frame) locale = frame.locale;
        if ('plugins' in frame) plugins = frame.plugins;
        if ('scrollAttach' in frame) scrollAttach = frame.scrollAttach;
        if ('preset' in frame) {
          setPreset(presets[frame.preset]);
          return;
        }
      }
      animationRef.current.frame++;
      animationRef.current.lastInput = input;
      animationRef.current.lastValues = values;
      animationRef.current.lastPlugins = plugins;
      animationRef.current.scrollAttach = scrollAttach;
      setLocale(locale);
      setValues({ ...variablesDefaultMapper, ...values });
      setPlugins(plugins);
      processInput(input, locale, values, plugins);
    };
    const interval = setInterval(handleNextFrame, 200);
    handleNextFrame();

    return () => clearInterval(interval);
  }, [presets, currentPreset, animation]);

  const scrollContainerRef = React.useRef<HTMLPreElement>(null);
  React.useLayoutEffect(() => {
    if (animation !== 'play') return;
    if (!scrollContainerRef.current) return;
    if (animationRef.current?.scrollAttach === 'left') {
      scrollContainerRef.current.scrollLeft = 0;
    } else if (animationRef.current?.scrollAttach === 'right') {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [input, values, plugins, animation]);

  return (
    <div className="relative rounded-2xl bg-[#0A101F]/80 ring-1 ring-white/10 backdrop-blur">
      <div className="absolute -top-px left-20 right-11 h-px bg-gradient-to-r from-violet-300/0 via-violet-300/70 to-violet-300/0" />
      <div className="absolute -bottom-px left-11 right-20 h-px bg-gradient-to-r from-blue-400/0 via-blue-400 to-blue-400/0" />
      <div className="pl-4 pt-4">
        <div className="flex justify-between items-center pr-5">
          <TrafficLightsIcon className="h-2.5 w-auto stroke-slate-500/30" />
          {animation === 'pause' ? (
            <span className="text-gray-400 text-xs h-2.5">
              animation was paused, you can play with examples{' '}
              <span className="underline ml-5 underline-offset-2 cursor-pointer" onClick={() => setAnimation('play')}>
                resume animation
              </span>
            </span>
          ) : (
            <span className="text-gray-500 text-xs h-2.5">
              <span className="underline ml-5 underline-offset-2 cursor-pointer" onClick={() => setAnimation('pause')}>
                pause animation
              </span>
            </span>
          )}
        </div>
        <div className="mt-4 flex space-x-2 text-xs">
          {presets.map((preset) => (
            <div
              key={preset.name}
              onClick={() => setPreset(preset)}
              className={clsx(
                'flex h-6 cursor-pointer rounded-full bg-transparent p-px font-medium transition',
                preset.name === currentPreset
                  ? 'bg-gradient-to-r from-violet-400/30 via-violet-400 to-violet-400/30 text-violet-300'
                  : 'text-slate-500',
              )}
            >
              <div className={clsx('flex items-center rounded-full px-2.5', preset.name === currentPreset && 'bg-slate-800')}>
                {preset.name}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-start px-1 text-sm">
          <div aria-hidden="true" className="select-none border-r border-slate-300/5 pr-4 font-mono text-slate-600">
            {Array(19)
              .fill(0)
              .map((_, index) => (
                <React.Fragment key={index}>
                  {(index + 1).toString().padStart(2, '0')}
                  <br />
                </React.Fragment>
              ))}
          </div>
          <pre
            className="prism-code language-javascript flex overflow-x-scroll pb-6 w-full"
            ref={scrollContainerRef}
            onMouseDown={() => setAnimation('pause')}
          >
            <code className="px-4">
              <div className="token-line">
                <span className="token keyword module">import</span>
                <span className="token plain"> </span>
                <span className="token imports punctuation">{'{'}</span>
                <span className="token imports"> makeIntl </span>
                <span className="token imports punctuation">{'}'}</span>
                <span className="token plain"> </span>
                <span className="token keyword module">from</span>
                <span className="token plain"> </span>
                <span className="token string">'nanointl'</span>
              </div>
              <br />
              <div className="token-line">
                <span className="token keyword">const</span>
                <span className="token plain"> testMessage </span>
                <span className="token operator">=</span>
              </div>
              <div className="token-line">
                <span className="token plain">{'  '}</span>
                <span className="token punctuation">'</span>
                <span className="token string">
                  <span
                    contentEditable={true}
                    ref={inputContainerRef}
                    className="focus:outline-none focus:border-b border-violet-300"
                    onInput={handleInputChange}
                    onPaste={handleInputChange}
                    dangerouslySetInnerHTML={{ __html: input.replaceAll('<', '&lt').replaceAll('>', '&gt') }}
                  />
                </span>
                <span className="token punctuation">'</span>
                <span className="token punctuation">;</span>
              </div>
              <div className="token-line">
                <span className="token keyword">const</span>
                <span className="token plain"> intl </span>
                <span className="token operator">=</span>
                <span className="token plain"> </span>
                <span className="token function">makeIntl</span>
                <span className="token punctuation">(</span>
                <span className="token string">
                  '
                  <span
                    contentEditable={true}
                    ref={localeContainerRef}
                    className="focus:outline-none focus:border-b border-violet-300"
                    onInput={handleLocaleChange}
                    onPaste={handleLocaleChange}
                    dangerouslySetInnerHTML={{ __html: locale }}
                  />
                  '
                </span>
                <span className="token punctuation">,</span>
                <span className="token plain"> </span>
                <span className="token punctuation">{'{'}</span>
                <span className="token plain"> testMessage </span>
                <span className="token punctuation">{'}'}</span>
                <span className="token punctuation">,</span>
                <span className="token plain"> </span>
                <span className="token punctuation">{'{'}</span>
              </div>
              <div className="token-line">
                <span className="token plain">{'  '}</span>
                <span className="token literal-property property">plugins</span>
                <span className="token operator">:</span>
                <span className="token plain"> </span>
                <span className="token punctuation">[</span>
              </div>
              {allPlugins.map((plugin) => {
                const label = plugin.name.split('-').slice(0, -1).join('-') + 'Plugin';
                const checked = plugins.includes(plugin);
                const handleClick = () => setPlugins(checked ? plugins.filter((p) => p !== plugin) : [...plugins, plugin]);

                return (
                  <div className="token-line cursor-pointer" key={plugin.name} onClick={handleClick}>
                    <span className={clsx('token', checked ? 'plain' : 'comment')}>
                      {checked ? '    ' : '//  '}
                      {label},
                    </span>
                  </div>
                );
              })}
              <div className="token-line">
                <span className="token plain">{'  '}</span>
                <span className="token punctuation">]</span>
              </div>
              <div className="token-line">
                <span className="token punctuation">{'}'}</span>
                <span className="token punctuation">)</span>
                <span className="token punctuation">;</span>
              </div>
              <br />
              <div className="token-line">
                <span className="token plain">intl</span>
                <span className="token punctuation">.</span>
                <span className="token method function property-access">formatMessage</span>
                <span className="token punctuation">(</span>
                <span className="token string">'testMessage'</span>
                <span className="token imports punctuation">{', {'}</span>
              </div>
              {interpolations.map((interpolation) => {
                let variableName = '';
                if (interpolation.type === 'variable') variableName = interpolation.name;
                if (interpolation.type === 'plural') variableName = interpolation.variable.name;
                if (interpolation.type === 'select') variableName = interpolation.variable.name;
                if (interpolation.type === 'external') variableName = interpolation.variableName;

                const valueContainerProps = {
                  onFocus: (event) => (editedInterpolationContainerRef.current = event.target),
                  contentEditable: true,
                  className: 'focus:outline-none focus:border-b border-violet-300',
                  onInput: handleInterpolationChange(variableName, 'string'),
                  onPaste: handleInterpolationChange(variableName, 'string'),
                  dangerouslySetInnerHTML: { __html: values[variableName] },
                };

                let variableValue = values[variableName];
                let variableControls = null;
                if (interpolation.type === 'external' && (interpolation.name === 'md-token' || interpolation.name === 'tag')) {
                  if (interpolation.name === 'md-token') {
                    if (interpolation.variableName === 'strong')
                      variableValue = (
                        <>
                          <span className="token punctuation">{'({ '}</span>
                          <span className="token plain">children</span>
                          <span className="token punctuation">{' }) => '}</span>
                          <span className="token operator">{'<'}</span>
                          <span className="token function">strong</span>
                          <span className="token operator">{'>'}</span>
                          <span className="token punctuation">{'{'}</span>
                          <span className="token plain">children</span>
                          <span className="token punctuation">{'}'}</span>
                          <span className="token operator">{'</'}</span>
                          <span className="token function">strong</span>
                          <span className="token operator">{'>'}</span>
                        </>
                      );
                    if (interpolation.variableName === 'emphasis') {
                      variableValue = (
                        <>
                          <span className="token punctuation">{'({ '}</span>
                          <span className="token plain">children</span>
                          <span className="token punctuation">{' }) => '}</span>
                          <span className="token operator">{'<'}</span>
                          <span className="token function">em</span>
                          <span className="token operator">{'>'}</span>
                          <span className="token punctuation">{'{'}</span>
                          <span className="token plain">children</span>
                          <span className="token punctuation">{'}'}</span>
                          <span className="token operator">{'</'}</span>
                          <span className="token function">em</span>
                          <span className="token operator">{'>'}</span>
                        </>
                      );
                    }
                    if (interpolation.variableName === 'link') {
                      variableValue = (
                        <>
                          <span className="token punctuation">{'({ '}</span>
                          <span className="token plain">children</span>
                          <span className="token punctuation">, </span>
                          <span className="token plain">url</span>
                          <span className="token punctuation">{' }) => '}</span>
                          <span className="token operator">{'<'}</span>
                          <span className="token function">a</span>
                          <span className="token operator"> </span>
                          <span className="token plain">href</span>
                          <span className="token operator">{'='}</span>
                          <span className="token punctuation">{'{'}</span>
                          <span className="token plain">url</span>
                          <span className="token punctuation">{'}'}</span>
                          <span className="token operator">{'>'}</span>
                          <span className="token punctuation">{'{'}</span>
                          <span className="token plain">children</span>
                          <span className="token punctuation">{'}'}</span>
                          <span className="token operator">{'</'}</span>
                          <span className="token function">a</span>
                          <span className="token operator">{'>'}</span>
                        </>
                      );
                    }
                  } else {
                    variableValue = (
                      <>
                        <span className="token punctuation">{'({ '}</span>
                        <span className="token plain">children</span>
                        <span className="token punctuation">{' }) => '}</span>
                        <span className="token operator">{'<'}</span>
                        <span className="token function">{interpolation.variableName}</span>
                        <span className="token operator">{'>'}</span>
                        <span className="token punctuation">{'{'}</span>
                        <span className="token plain">children</span>
                        <span className="token punctuation">{'}'}</span>
                        <span className="token operator">{'</'}</span>
                        <span className="token function">{interpolation.variableName}</span>
                        <span className="token operator">{'>'}</span>
                      </>
                    );
                  }
                } else if (variableValue instanceof Date) {
                  valueContainerProps.onInput = undefined;
                  valueContainerProps.onBlur = handleInterpolationChange(variableName, 'date');
                  valueContainerProps.onPaste = handleInterpolationChange(variableName, 'date');
                  const formatted =
                    variableValue.getFullYear() +
                    '-' +
                    (variableValue.getMonth() + 1).toString().padStart(2, '0') +
                    '-' +
                    variableValue.getDate().toString().padStart(2, '0') +
                    ' ' +
                    variableValue.getHours().toString().padStart(2, '0') +
                    ':' +
                    variableValue.getMinutes().toString().padStart(2, '0');
                  variableValue = (
                    <>
                      <span className="token operator">new </span>
                      <span className="token function">Date</span>
                      <span className="token punctuation">('</span>
                      <span className="token plain">
                        <span {...valueContainerProps} dangerouslySetInnerHTML={{ __html: formatted }} />
                      </span>
                      <span className="token punctuation">')</span>
                    </>
                  );

                  // <span className="token plain">{variableValue}</span>
                } else if (typeof variableValue === 'number') {
                  valueContainerProps.onInput = handleInterpolationChange(variableName, 'number');
                  valueContainerProps.onPaste = handleInterpolationChange(variableName, 'number');
                  variableValue = (
                    <span className="token function">
                      <span {...valueContainerProps} />
                    </span>
                  );
                } else if (typeof variableValue === 'string') {
                  variableValue = (
                    <span className="token plain">
                      <span {...valueContainerProps} />
                    </span>
                  );
                  if (interpolation.type === 'select') {
                    const options = Object.keys(interpolation.options);
                    variableControls = (
                      <>
                        {' '}
                        <span className="token comment">
                          {'// '}
                          {options.map((option, index) => (
                            <React.Fragment key={option}>
                              <span
                                className="cursor-pointer underline underline-offset-4"
                                onClick={() => {
                                  setValues((prevValues) => ({ ...prevValues, [variableName]: option }));
                                }}
                              >
                                {option}
                              </span>
                              {index !== options.length - 1 && <span>, </span>}
                            </React.Fragment>
                          ))}
                        </span>
                      </>
                    );
                  }
                } else {
                  variableValue = (
                    <>
                      <span className="token punctuation">'</span>
                      <span className="token plain">
                        <span {...valueContainerProps}>{variableValue}</span>
                      </span>
                      <span className="token punctuation">'</span>
                    </>
                  );
                }

                return (
                  <div className="token-line" key={variableName}>
                    <span className="token plain">{'  '}</span>
                    <span className="token plain">{variableName}</span>
                    <span className="token punctuation">: </span>
                    <span>{variableValue}</span>
                    <span className="token punctuation">,</span>
                    {variableControls}
                  </div>
                );
              })}
              <div className="token-line">
                <span className="token imports punctuation">{'}'}</span>
                <span className="token punctuation">)</span>
                <span className="token punctuation">;</span>
              </div>
              {safeOutput && (
                <div className="token-line">
                  <span className="token comment">// outputs: {safeOutput}</span>
                </div>
              )}
              {error && (
                <div className="token-line">
                  <span className="token error">// throws: {error}</span>
                </div>
              )}
              <br />
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
