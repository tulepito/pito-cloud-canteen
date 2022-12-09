const fs = require('fs');

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];
const outputContent = {};

const run = () => {
  console.log({ inputFilePath });
  const fileContent = fs.readFileSync(inputFilePath, 'utf8');
  fileContent.split('\n').forEach((line) => {
    if (line === '') {
      return;
    }
    const [key, value] = line.split(/=(.+)/);
    outputContent[key] = value;
  });

  fs.writeFileSync(outputFilePath, JSON.stringify(outputContent, null, 2));

  console.log(JSON.stringify(outputContent, null, 2));
};

run();
