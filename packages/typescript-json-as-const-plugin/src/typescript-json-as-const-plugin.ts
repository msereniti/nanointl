import fs from 'fs';
import path from 'path';
import type tss from 'typescript/lib/tsserverlibrary';
import minimatch from 'minimatch';

const scriptTargetLatest = 99;
const scriptKindExternal = 5;

const makeJsonDTs = (ts: typeof tss, fileName: string) => {
  const text = fs.readFileSync(fileName, 'utf-8');

  const dtsText = `const JSON: ${text} as const;
export default JSON;
`;

  return ts.ScriptSnapshot.fromString(dtsText);
};

const init = (modules: { typescript: typeof tss }) => {
  const ts = modules.typescript;
  const create = (info: ts.server.PluginCreateInfo) => {
    const directory = info.project.getCurrentDirectory();
    process.chdir(directory);

    const filter = (fileName: string) => {
      if (!fileName.toLowerCase().endsWith('.json')) return false;
      const relativeFileName = path.relative(directory, fileName);
      fs.appendFileSync('debug.txt', '---' + '\n');
      fs.appendFileSync('debug.txt', relativeFileName + '\n');
      fs.appendFileSync('debug.txt', JSON.stringify(info.config.include) + '\n');
      fs.appendFileSync('debug.txt', info.config.include.some((include: string) => minimatch(relativeFileName, include)) + '\n');
      if (info.config.include && !info.config.include.some((include: string) => minimatch(relativeFileName, include)))
        return false;
      if (info.config.exclude && info.config.exclude.some((exclude: string) => minimatch(relativeFileName, exclude)))
        return false;
      return true;
    };

    const _createLanguageServiceSourceFile = ts.createLanguageServiceSourceFile;
    ts.createLanguageServiceSourceFile = (fileName, scriptSnapshot, ...rest): ts.SourceFile => {
      if (filter(fileName)) {
        scriptSnapshot = makeJsonDTs(ts, fileName);
        const [, version, setNodeParents] = rest;
        const sourceFile = _createLanguageServiceSourceFile(
          fileName,
          scriptSnapshot,
          scriptTargetLatest,
          version,
          setNodeParents,
          scriptKindExternal,
        );

        sourceFile.isDeclarationFile = true;

        return sourceFile;
      }

      return _createLanguageServiceSourceFile(fileName, scriptSnapshot, ...rest);
    };

    const _updateLanguageServiceSourceFile = ts.updateLanguageServiceSourceFile;
    ts.updateLanguageServiceSourceFile = (sourceFile, scriptSnapshot, ...rest): ts.SourceFile => {
      if (filter(sourceFile.fileName)) {
        scriptSnapshot = makeJsonDTs(ts, sourceFile.fileName);

        sourceFile = _updateLanguageServiceSourceFile(sourceFile, scriptSnapshot, ...rest);

        sourceFile.isDeclarationFile = true;

        return sourceFile;
      }

      return _updateLanguageServiceSourceFile(sourceFile, scriptSnapshot, ...rest);
    };
  };

  const getExternalFiles = (project: tss.server.ConfiguredProject) =>
    project.getFileNames().filter((path) => path.toLowerCase().endsWith('.json'));

  return { create, getExternalFiles };
};

export default init;
