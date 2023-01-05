import fs from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const resultsPath = resolvePath(fileURLToPath(import.meta.url), '../results.json');
const outputPath = resolvePath(fileURLToPath(import.meta.url), '../results.md');
const results = JSON.parse(await fs.readFile(resultsPath, 'utf-8'));

const output = `Core bundle size:
| lingUi | formatjs | nanointl |
| ---    | ---      | ---      |
| ${results.size['@lingui/core']} bytes | ${results.size['@formatjs/intl']} bytes | ${results.size.nanointl} bytes |

Formatting 1k messages on same machine:
| lingUi | formatjs | nanointl |
| ---    | ---      | ---      |
| ${results.time.lingUi} ns | ${results.time.formatjs} ns | ${results.time.nanointl} ns |
`;

await fs.writeFile(outputPath, output);
