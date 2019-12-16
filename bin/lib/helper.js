const detectProjectRoot = require("./detectProjectRoot");
const fs = require("fs");
const path = require("path");

module.exports = {

  // returns a console that writes to stderr instead of stdout (when files are exported to stdout)
  stdErrConsole() {
    const { Console } = require('console');
    const console = Console(process.stderr, process.stderr);
    // NODE 10: const logger = new Console({ stdout: process.stderr, stderr: process.stderr });
    return console;
  },

  getFirebaseProject: function( project_alias = '' ) {

    if ( project_alias === '') {
      let Configstore = require("configstore");
      let conf = new Configstore("firebase-tools");
      let activeProjects = conf.get("activeProjects") || {};

      let projectRoot = detectProjectRoot()
      project_alias = activeProjects[projectRoot];
    }

    let local_config = this.readProjectFile();
    let project = ''
    if ( project_alias in local_config['projects'] ) {
      project = local_config['projects'][project_alias];
    } else {
      project = project_alias;
    }

    return project;
  },

  readProjectFile: function() {
    let config_file = ".firebaserc";

    let projectRoot = detectProjectRoot()
    let outPath = path.normalize(path.join(projectRoot, config_file)); // TODO: RAUS?

    try {
      var content = fs.readFileSync(config_file, "utf8");
      return JSON.parse(content);
    } catch (e) {
      throw e;
    }
  },
}
