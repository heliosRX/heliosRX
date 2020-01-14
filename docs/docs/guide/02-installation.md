# Installation

::: warning Preview version

**Please use this version fow now** (@sc85)
```bash
yarn add https://github.com/tw00/heliosrx-private.git
```
instead of `yarn add heliosrx`.

The CLI **can not** be installed directly, because it's a subdirectory. Please do this instead:
```bash
git clone https://github.com/tw00/heliosrx-private.git ~/heliosRX

cd ~/heliosRX/packages/cli  # Go to CLI directory
yarn link                   # Register package globally as "linkable",
                            # See "ls -l ~/.config/yarn/link"
yarn global add .           # Install CLI package globally
helios --version            # Should display '0.2.0'
```

For developers it makes sense to also link heliosRX itself:

```bash
cd ~/heliosRX               # Go to heliosRX repository
yarn link                   # Register package globally as "linkable"
cd ~/my-helios-project      # Go to your project
yarn add ~/heliosRX         # OPTIONAL: If heliosrx is not in package.json yet,
                            # add from file ("yarn add heliosrx" is fine too)
yarn link heliosrx          # Link to global package
                            # (Check with "ls -l ./node_modules/heliosrx")

# Optionally add CLI as devDependency
yarn add --dev ~/heliosRX/packages/cli
yarn link heliosrx-cli
```
:::

::: tip
If you haven't already done so, create a new vue project with `vue create`.
```bash
vue create my-heliosrx-project
cd my-heliosrx-project
```
:::

### Install with npm or yarn

To install heliosRX and firebase simple run (depending if you're using yarn or npm);

```bash
npm install --save heliosrx
yarn add heliosrx
```

Also install `firebase` and `vuex`, which are both peer dependencies:

```bash
# Install peer dependencies
npm install --save firebase
npm install --save vuex
# or
yarn add firebase
yarn add vuex
```

### Install heliosRX Command Line Interface

heliosRX comes with a CLI tool, that is required to generate security rules.

```bash
npm install -g heliosrx-cli # -g optional
yarn add -g heliosrx-cli    # -g optional
```

### Install global peer dependencies

heliosRX requires the [bolt-compiler](https://github.com/FirebaseExtended/bolt) and the firebase CLI tools as peer dependencies, so please run:

```bash
npm install -g bolt-compiler
npm install -g firebase-tools
```

or, if you're using yarn:

```bash
yarn add -g bolt-compiler
yarn add -g firebase-tools
```

<!--
Then in you javascript file you will need to use

#### 1. Load with npm
```javascript
import heliosRX from 'heliosrx';
```

#### 2. NodeJS

```javascript
const heliosRX = require('heliosrx');
```

#### 3. CDN

TODO

```html
<script rel="https://raw.githubusercontent.com/heliosRX/heliosRX/master/dist/heliosrx.umd.js" />
```
-->


<!--
TODO
how to install helios cli globally
-->
