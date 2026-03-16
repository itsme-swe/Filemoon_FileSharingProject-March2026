const root = process.cwd();
const path = require("path");

const getPath = (filename) => {
  return path.join(root, "view", filename);
};

module.exports = getPath;
