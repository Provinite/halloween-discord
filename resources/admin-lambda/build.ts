import { readFileSync, writeFileSync } from "fs";
const template = readFileSync(`${__dirname}/index.hbs`);
writeFileSync(
  `${__dirname}/index.template.ts`,
  `export const indexTemplate = \`${template}\`;\n`,
);
