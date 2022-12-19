import fs from 'fs/promises';
import { dirname as resolveDirname } from 'path';
import type tss from 'typescript/lib/tsserverlibrary';

const scriptTargetLatest = 99;
const scriptKindExternal = 5;

const makeJsonDTs = async (ts: typeof tss, fileName: string) => {
  const text = await fs.readFile(fileName, 'utf-8');

  const dtsText = `const JSON: ${text.trim()} as const;
export default JSON;
`;

  return ts.ScriptSnapshot.fromString(dtsText);
};

const isJson = (path: string) => path.endsWith('.json');

const init = (modules: { typescript: typeof tss }) => {
  const ts = modules.typescript;
  const create = (info: ts.server.PluginCreateInfo) => {
    const directory = info.project.getCurrentDirectory();
    process.chdir(directory);

    const _createLanguageServiceSourceFile = ts.createLanguageServiceSourceFile;
    ts.createLanguageServiceSourceFile = async (fileName, scriptSnapshot, ...rest): Promise<ts.SourceFile> => {
      if (isJson(fileName)) {
        scriptSnapshot = await makeJsonDTs(ts, fileName);
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

      const sourceFile = _createLanguageServiceSourceFile(fileName, scriptSnapshot, ...rest);

      return sourceFile;
    };

    const updateLanguageServiceSourceFile = ts.updateLanguageServiceSourceFile;
    ts.updateLanguageServiceSourceFile = async (sourceFile, scriptSnapshot, ...rest): Promise<ts.SourceFile> => {
      if (isJson(sourceFile.fileName)) {
        scriptSnapshot = await makeJsonDTs(ts, sourceFile.fileName);

        sourceFile = updateLanguageServiceSourceFile(sourceFile, scriptSnapshot, ...rest);

        sourceFile.isDeclarationFile = true;

        return sourceFile;
      }

      sourceFile = updateLanguageServiceSourceFile(sourceFile, scriptSnapshot, ...rest);

      return sourceFile;
    };

    if (info.languageServiceHost.resolveModuleNames) {
      const resolveModuleNames = info.languageServiceHost.resolveModuleNames.bind(info.languageServiceHost);

      info.languageServiceHost.resolveModuleNames = (moduleNames, containingFile, ...rest) => {
        const resolvedModules = resolveModuleNames(moduleNames, containingFile, ...rest);

        return moduleNames.map((moduleName, index) => {
          try {
            if (isJson(moduleName)) {
              return {
                extension: '.d.ts',
                isExternalLibraryImport: false,
                resolvedFileName: (resolveDirname(containingFile), moduleName),
              };
            }
          } catch (e) {
            return resolvedModules[index];
          }
          return resolvedModules[index];
        });
      };
    }

    return info.languageService;
  };

  const getExternalFiles = (project: tss.server.ConfiguredProject) => project.getFileNames().filter(isJson);

  return { create, getExternalFiles };
};

export default init;
