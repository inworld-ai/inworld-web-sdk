const fs = require('fs');
const path = require('path');

const oldName = 'package.json';
const newName = 'package.js';

let created = false;

exports.default = ({ orig }) => {
  if (orig.includes(`${oldName}'`)) {
    const data = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', oldName), 'utf8'),
    );

    if (!created) {
      fs.writeFileSync(
        path.join(__dirname, '..', 'build', newName),
        `module.exports = ${JSON.stringify({ version: data.version })};`,
      );

      created = true;
    }

    return orig.replace(`${oldName}'`, `${newName}'`);
  }

  return orig;
};
