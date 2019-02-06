# babel-plugin-transform-opipe ![npm (scoped)](https://img.shields.io/npm/v/babel-plugin-transform-opipe.svg?style=popout) ![NpmLicense](https://img.shields.io/npm/l/babel-plugin-transform-opipe.svg?style=popout) ![David](https://img.shields.io/david/peoro/babel-plugin-transform-opipe.svg?style=popout) ![Travis (.com)](https://img.shields.io/travis/com/peoro/babel-plugin-transform-opipe.svg?style=popout) ![Coveralls github](https://img.shields.io/coveralls/github/peoro/babel-plugin-transform-opipe.svg?style=popout)

> A babel parser and plugin implementing the opipe operator, to easily pipe an object.

```javascript
const _ = require('lodash');
const ten = [1,2,3,4]
    :| _.filter( n=>n%2 ) // [1,3]
    :| _.map( n=>n**2 )   // [1,9]
    :| _.sum();           // 10
```

-   [Installation](#installation)
-   [Opipe operator](#opipe-operator)
-   [Quickstart](#quickstart)

## Installation

```bash
npm install --save-dev babel-plugin-transform-opipe
```

## Opipe operator

The opipe operator is defined as following:

```javascript
a :| b(...args) ≡ b(a, ...args)
```

It's handy to quickly and easily pipe objects through method-like-functions that accept their logical `this` as the first parameter.

## Quickstart

Install the babel suite, enable this plugin, then use babel to transpile your code
The easiest way to get started, is the following:

```javascript
npm install --save babel-plugin-transform-opipe babel-meta
npx babel-node --plugins='babel-plugin-transform-opipe' your_opipeful_file.js
```
