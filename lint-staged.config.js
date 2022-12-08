const path = require('path');

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`;

module.exports = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
  '*.html': ['eslint', 'prettier --write'],
  '*.scss': 'prettier --write',
  '*.css': 'prettier --write',
};
