const LocalStorage = require('node-localstorage').LocalStorage;

class TagManager {
  constructor (options = {}) {
    this.path = options.path || './tags';
    this.storage = new LocalStorage(this.path);
  }

  set (key, value, meta) {
    let data = { data: value, meta: meta };
    return this.storage.setItem(key, JSON.stringify(data));
  }

  get (key, replace = {}, functions = {}) {
    let data = JSON.parse(this.storage.getItem(key));
    Object.keys(functions).forEach(k => {
      data.data = data.data.replace(new RegExp(`%${k}(.+?)%`, 'g'), (match, x1) => {
        return functions[k].apply(null, x1.split('|').splice(1));
      });
    });
    Object.keys(replace).forEach(k => {
      data.data = data.data.replace(new RegExp(`%${k}%`, 'g'), replace[k]);
    });
    return data;
  }

  del (key) {
    return this.storage.removeItem(key);
  }
}

module.exports = TagManager;
