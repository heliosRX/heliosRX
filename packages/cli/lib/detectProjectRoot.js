// Based on:
// https://github.com/firebase/firebase-tools/blob/master/lib/detectProjectRoot.js
// https://github.com/firebase/firebase-tools/blob/master/src/detectProjectRoot.js

"use strict";

var fsutils = require("./fsutils");
var path = require("path");

module.exports = function(cwd) {
  var projectRootDir = cwd || process.cwd();
  while (!fsutils.fileExistsSync(path.resolve(projectRootDir, "./firebase.json"))) {
    // INFO: path.dirname('/') = '/'
    var parentDir = path.dirname(projectRootDir);
    if (parentDir === projectRootDir) {
      return null; // When / is reached
    }
    projectRootDir = parentDir;
  }
  return projectRootDir;
};
