const LocalStorage = require('node-localstorage').LocalStorage;
const TagScript = require('tagscript');
const compiler = new TagScript();

class TagManager {
  constructor (options = {}) {
    this.path = options.path || './tags';
    this.storage = new LocalStorage(this.path);
    this.functions = options.functions || {};
  }

  set (key, value, meta) {
    let data = { data: value, meta: meta };
    return this.storage.setItem(key, JSON.stringify(data));
  }

  get (key, functions = {}) {
    return new Promise((resolve, reject) => {
      functions = Object.assign(functions, this.functions);
      let data = JSON.parse(this.storage.getItem(key));
      compiler.compile(data.data, functions).then(compiled => {
        data.data = compiled;
        resolve(data);
      });
    });
  }

  raw (key) {
    let data = JSON.parse(this.storage.getItem(key));
    return data.data;
  }

  remove (key) {
    return this.storage.removeItem(key);
  }

  exists (key) {
    return (this.storage.getItem(key) !== null);
  }

  keys () {
    return new LocalStorage(this.path)._keys;
  }
}

module.exports = TagManager;
