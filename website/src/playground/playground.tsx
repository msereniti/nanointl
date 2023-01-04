import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { FunctionalComponent } from 'preact';
import { AstNode, ExternalParsers, parseIcu, PostParser } from 'nanointl/parse';
import { NanointlPlugin } from 'nanointl/makeIntl';
import { ExternalSerializers, serializeIcu } from 'nanointl/serialize';
import { makeIntlBase } from 'nanointl/intlBase';
import { getCursorPosition, restoreCursorPosition } from './cursor';
import { PresetsSelect, initialPreset, Preset, variablesDefaultMapper } from './presets';
import { astToFormattedHtml, getAstInterpolations, interpolationDefaultValues } from './ast';
import { Interpolation } from './interpolation';
import { Plugins } from './plugins';

export const Playground: FunctionalComponent = () => {
  const [initInput, setInitInput] = useState(initialPreset.input);
  const [input, setInput] = useState(initInput);
  const [interpolations, setInterpolations] = useState<Exclude<AstNode, string>[]>([]);
  const [values, setValues] = useState<{ [variableName: string]: any }>({ ...variablesDefaultMapper, ...initialPreset.values });
  const [plugins, setPlugins] = useState<NanointlPlugin[]>(initialPreset.plugins);
  const editTextContainerRef = useRef<HTMLDivElement>(null);

  const [output, setOutput] = useState<string>('');
  const [formattedInput, setFormattedInput] = useState<string>('');
  const [error, setError] = useState<null | string>(null);

  const handlePreset = useCallback((preset: Preset) => {
    setInitInput(preset.input);
    setInput(preset.input);
    setValues({ ...variablesDefaultMapper, ...preset.values });
    setPlugins(preset.plugins);
  }, []);
  const processInput = useCallback((input: string, values: { [variableName: string]: any }, plugins: NanointlPlugin[]) => {
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
      const intlBase = makeIntlBase('en');
      const interpolations = getAstInterpolations(ast);
      const defaultValues = interpolationDefaultValues(interpolations);
      setOutput(serializeIcu(ast, { ...defaultValues, ...values }, intlBase, { externalSerializers }));
      setInterpolations(interpolations);
      setFormattedInput(astToFormattedHtml(ast));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setOutput('');
    }
  }, []);
  useEffect(() => {
    processInput(initInput, values, plugins);
  }, [initInput]);
  useEffect(() => {
    processInput(input, values, plugins);
  }, [values, plugins]);
  const hanleInputChange = useCallback(() => {
    if (!editTextContainerRef.current) return;
    const input = editTextContainerRef.current.innerText.replaceAll(/\s/g, ' ');
    const cursorPosition = getCursorPosition(editTextContainerRef.current);
    processInput(input, values, plugins);

    requestAnimationFrame(() => {
      if (!editTextContainerRef.current) return;
      if (!cursorPosition) return;
      restoreCursorPosition(editTextContainerRef.current, cursorPosition);
    });
  }, [values, plugins]);

  return (
    <div>
      <div className="flex">
        <div className=" w-80 h-80 rounded focus-within:ring p-3">
          <div>
            <label className="text-xs text-gray-400">Message template</label>
          </div>
          <code
            contentEditable
            ref={editTextContainerRef}
            onInput={hanleInputChange}
            onPaste={hanleInputChange}
            dangerouslySetInnerHTML={{ __html: formattedInput }}
            className="focus:outline-none"
          />
        </div>
        <div className="flex-col">
          {output && (
            <>
              <div>
                <label className="text-xs text-gray-400">Result</label>
              </div>
              <div className="py-1 break-all white w-72">{output}</div>
            </>
          )}
          {error && (
            <>
              <div>
                <label className="text-xs text-gray-400">Processing error</label>
              </div>
              <div className="text-red-400 break-all w-72">{error}</div>
            </>
          )}
          {interpolations.length > 0 && (
            <>
              <div>
                <label className="text-xs text-gray-400">Variables</label>
              </div>
              <div>
                {interpolations.map((interpolation) => {
                  let variableName = '';
                  if (interpolation.type === 'variable') variableName = interpolation.name;
                  if (interpolation.type === 'plural') variableName = interpolation.variable.name;
                  if (interpolation.type === 'select') variableName = interpolation.variable.name;
                  if (interpolation.type === 'external') variableName = interpolation.variableName;
                  const onChange = (value: string) => setValues((prevValues) => ({ ...prevValues, [variableName]: value }));

                  return <Interpolation node={interpolation} value={values[variableName]} onChange={onChange} />;
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-5 flex-wrap">
        <div>
          <label className="text-xs text-gray-400">Pick examples</label>
          <PresetsSelect initialPreset={initialPreset} onPresetChange={handlePreset} />
        </div>
        <Plugins plugins={plugins} onPluginsChange={setPlugins} />
      </div>
    </div>
  );
};
