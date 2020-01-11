# Installation

::: warning Preview version

**Please use this version fow now** (@sc85)
```bash
yarn add https://github.com/tw00/heliosrx-private.git
```
instead of yarn add heliosrx
:::

::: tip
If you haven't already done so, create a new vue project with `vue create`.
```bash
vue create my-heliosrx-project
cd my-heliosrx-project
```
:::

### Install with npm or yarn

To install heliosRX and firebase simple run

```bash
npm install --save heliosrx
npm install --save firebase
```

or, if you're using yarn:

```bash
yarn add heliosrx
yarn add firebase
```

### Install global peer dependencies

heliosRX requires the [bolt-compiler](https://github.com/FirebaseExtended/bolt) and the firebase CLI tools as peer dependencies, so please run:

```bash
npm install -g bolt-compiler
npm install -g firebase-tools
# npm install -g heliosrx-cli (PLANNED)
```

or, if you're using yarn:

```bash
yarn add -g bolt-compiler
yarn add -g firebase-tools
# yarn add -g heliosrx-cli (PLANNED)
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
