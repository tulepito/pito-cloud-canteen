const fs = require('fs');

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

const run = () => {
  const fileContent = fs.readFileSync(inputFilePath, 'utf8');
  const env = JSON.parse(fileContent);
  const content = Object.entries(env).reduce((envResult, keyPair) => {
    const [key, value] = keyPair;

    return `${envResult}${key}=${value}\n`;
  }, '');

  fs.writeFileSync(outputFilePath, content);
};

run();
