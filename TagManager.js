const LocalStorage = require('node-localstorage').LocalStorage;
const Handlebars = require('handlebars');

class TagManager {
  constructor (options = {}) {
    this.path = options.path || './tags';
    this.storage = new LocalStorage(this.path);
    this.functions = options.functions || {};
  }

  set (key, content, meta) {
    let data = { content, meta };
    return this.storage.setItem(key, JSON.stringify(data));
  }

  get (key, functions = {}) {
    functions = Object.assign(functions, this.functions);
    for (const fn in functions) Handlebars.registerHelper(fn, functions[fn]);
    let data = JSON.parse(this.storage.getItem(key));
    if (!data) return undefined;
    data.content = Handlebars.compile(data.content)();
    // data.data = ohwait(compiler.compile(data.data, functions));
    return data;
  }

  raw (key) {
    let data = JSON.parse(this.storage.getItem(key));
    return data;
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
