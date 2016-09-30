const LocalStorage = require('node-localstorage').LocalStorage;

class TagManager {
  constructor (options = {}) {
    this.path = options.path || './tags';
    this.storage = new LocalStorage(this.path);
    this.wrapper = options.wrapper || '%%';
    this.separator = options.separator || '|';
    this.replace = options.replace || {};
    this.functions = options.functions || {};
  }

  set (key, value, meta) {
    let data = { data: value, meta: meta };
    return this.storage.setItem(key, JSON.stringify(data));
  }

  get (key, replace = {}, functions = {}) {
    replace = Object.assign(replace, this.replace);
    functions = Object.assign(functions, this.functions);
    let data = JSON.parse(this.storage.getItem(key));
    Object.keys(functions).forEach(k => {
      data.data = data.data.replace(new RegExp(`${this.wrapper[0]}${k}(.+?)${this.wrapper[1]}`, 'g'), (match, x1) => {
        return functions[k].apply(null, x1.split(this.separator).splice(1));
      });
    });
    Object.keys(replace).forEach(k => {
      data.data = data.data.replace(new RegExp(`${this.wrapper[0]}${k}${this.wrapper[1]}`, 'g'), this.replace[k]);
    });
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
