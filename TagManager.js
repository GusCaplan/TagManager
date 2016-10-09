const LocalStorage = require('node-localstorage').LocalStorage;
const TagScript = require('tagscript');
const compiler = new TagScript();
const ohwait = require('asyncawait/await');
const ohsync = require('asyncawait/async');

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
    return ohsync(() => {
      functions = Object.assign(functions, this.functions);
      let data = JSON.parse(this.storage.getItem(key));
      data.data = ohwait(compiler.compile(data.data, functions));
      return data;
    })();
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
