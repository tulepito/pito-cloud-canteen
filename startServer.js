require('dotenv').config();
const shell = require('shelljs');

shell.exec(`yarn next start -p ${process.env.PORT}`);
