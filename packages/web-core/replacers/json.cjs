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
        `export const version = "${data.version}";`,
      );

      created = true;
    }

    return orig.replace(`${oldName}'`, `${newName}'`);
  }

  return orig;
};
