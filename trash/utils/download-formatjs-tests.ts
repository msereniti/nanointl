import { execa } from 'execa';
import { simpleGit } from 'simple-git';
import { rm, access, mkdir, readFile, writeFile, rename } from 'fs/promises';
import { resolve as resolvePath, dirname as resolveDirname, relative as resolveRelative } from 'path';
import { fileURLToPath } from 'url';
import glob from 'fast-glob';
import fsExtra from 'fs-extra';

const repoRoot = resolvePath(fileURLToPath(import.meta.url), '../../');
const formatjsRepoDir = resolvePath(repoRoot, 'utils/.formatjs-repo-clone');
const formatjsTestsDir = resolvePath(repoRoot, 'src/formatjs-compat/generated');
try {
  await access(formatjsRepoDir);
  await rm(formatjsRepoDir, { recursive: true, force: true });
} catch {
  /* it's ok */
}
await simpleGit().clone('https://github.com/formatjs/formatjs.git', formatjsRepoDir);
await rm(resolvePath(formatjsRepoDir, '.git'), { recursive: true, force: true });
let testsFiles = await glob(['**/*.test.ts'], {
  cwd: formatjsRepoDir,
  onlyFiles: true,
  absolute: true,
});
testsFiles = testsFiles.filter((path) => {
  if (path.includes('babel')) return false;
  if (path.includes('cli')) return false;
  if (path.includes('eslint')) return false;
  if (path.includes('swc')) return false;
  if (path.includes('ts-transformer')) return false;
  if (path.includes('vue')) return false;
  return true;
});
try {
  await access(formatjsTestsDir);
  await rm(formatjsTestsDir, { force: true, recursive: true });
} catch {
  /* it's ok */
}
await mkdir(formatjsTestsDir);
const outputFilePaths = testsFiles.map((filePath) =>
  resolvePath(formatjsTestsDir, filePath.substring(formatjsRepoDir.length).replaceAll('/', '_').substring(1)),
);

await Promise.all(
  testsFiles.map(async (filePath, index) => {
    const outputFilePath = outputFilePaths[index];

    const [, localeDataDirName] = resolveRelative(formatjsTestsDir, outputFilePath).split('_');

    let textContent = await readFile(filePath, 'utf-8');
    textContent = textContent.replaceAll("'./locale-data/", `'./${localeDataDirName}/locale-data/`);
    textContent = textContent.replaceAll('`./locale-data/', `\`./${localeDataDirName}/locale-data/`);
    const banner = `/* This file was downloaded from https://github.com/formatjs/formatjs.git repo and patched automatically, do not change it manually */`;
    const vitestUtils = ['describe', 'test', 'expect', 'it', 'beforeEach', 'afterEach'].filter(
      (util) => textContent.split(util + '(').length > textContent.split(util + '()').length,
    );
    if (vitestUtils.length === 0 && textContent.includes('test.todo')) vitestUtils.push('test');
    if (textContent.includes(' jest.') || textContent.includes(' jest\n')) vitestUtils.push('vi');
    textContent = textContent.replaceAll(' jest.', ' vi.');
    textContent = textContent.replaceAll(' jest\n', ' vi\n');

    const vitestImports = vitestUtils.length ? `import { ${vitestUtils.join(', ')} } from 'vitest';` : '';
    const firstNonImportLine = textContent
      .split('\n')
      .findIndex((line) => line.includes('describe(') || line.includes('test(') || line.includes('it('));
    const nonImportContent = textContent
      .split('\n')
      .slice(firstNonImportLine)
      .filter((line) => !line.includes('@ts-ignore') && !line.includes('/* eslint-disable @typescript-eslint/'))
      .join('\n');
    const imports = textContent
      .split('\n')
      .slice(0, firstNonImportLine)
      .filter((line) => !line.includes('@ts-ignore') && !line.includes('/* eslint-disable @typescript-eslint/'))
      .filter((line) => !line.includes('jasmine-expect'))
      .filter((line) => !line.includes('@formatjs/'))
      .map((line) => {
        if (line.includes('import RelativeTimeFormat from')) {
          return line.replace('import RelativeTimeFormat from', 'import { RelativeTimeFormat } from');
        }
        if (line.includes('import IntlMessageFormat from')) {
          return line.replace('import IntlMessageFormat from', 'import { IntlMessageFormat } from');
        }
        if (line.includes('import ListFormat from')) {
          return line.replace('import ListFormat from', 'import { ListFormat } from');
        }
        if (line.includes('import * as noParser from')) {
          return line.replace('import * as noParser from', 'import { noParser } from');
        }
        if (line.includes('import * as withParser from')) {
          return line.replace('import * as withParser from', 'import { withParser } from');
        }
        return line;
      })
      .map((line) => {
        if (!line.includes("from './locale-data/")) return line;

        return line.replace("from './locale-data/", `from './${localeDataDirName}/locale-data/`);
      })
      .map((line) => {
        if (!line.includes("from '")) return line;
        if (!line.includes('}')) return line;
        const fromStatementPosition = line.indexOf("from '");
        const beforeImportPath = line.substring(0, fromStatementPosition + "from '".length);
        const importPathEndPosition =
          fromStatementPosition + "from '".length + line.substring(fromStatementPosition + "from '".length).indexOf("'");
        const afterImportPath = line.substring(importPathEndPosition);
        return `${beforeImportPath}..${afterImportPath}`;
      })
      .join('\n');

    const patchedContent = banner + '\n\n' + vitestImports + '\n\n' + imports + '\n\n' + nonImportContent;
    await writeFile(outputFilePath, patchedContent);
  }),
);

const localeDataFiles = await glob(['**/locale-data/*.ts', '**/locale-data/*.json'], {
  cwd: formatjsRepoDir,
  onlyFiles: true,
  absolute: true,
});
const localeDataOutputPaths = localeDataFiles.map((filePath) =>
  resolvePath(formatjsTestsDir, filePath.substring(formatjsRepoDir.length + '/packages'.length + 1).replace('/tests/', '/')),
);
const directories = [...new Set(localeDataOutputPaths.map(resolveDirname))];
await Promise.all(directories.map((dirPath) => fsExtra.ensureDir(dirPath)));
await Promise.all(localeDataFiles.map((filePath, index) => rename(filePath, localeDataOutputPaths[index])));

await execa('pnpm', ['lint', '--fix'], { cwd: repoRoot });
