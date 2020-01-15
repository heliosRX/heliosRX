const path = require('path')

function npm(pkg) {
  return pkg
}

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  'lodash.clonedeep':    npm('lodash.clonedeep'),
  'lodash.defaultsdeep': npm('lodash.defaultsdeep'),
  'lodash.debounce':     npm('lodash.debounce'),
  'lodash.isequal':      npm('lodash.isequal'),
  '@firebase/database':  resolve('fake/firebase'),
  '@firebase/firestore': resolve('fake/firebase'),
  '@firebase/storage':   resolve('fake/firebase'),
  '@firebase/auth':      resolve('fake/firebase'),
  '@firebase/app':       resolve('fake/firebase'),
  '@/store/queries':     resolve('fake/store_queries'),
  '@/store':             resolve('fake/store'),
  '@/resource-loader':   resolve('fake/resource-loader'),
  '@/':                  resolve('../../src/'),
}
