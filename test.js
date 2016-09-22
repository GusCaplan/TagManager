const TagManager = require('./TagManager');

const tags = new TagManager();

tags.set('test', 'hello %name%, you are in %channel% random number %random|1|4% %omfg|hi%', {author: '1234'});

const replace = {
  'name': 'Gus',
  'channel': 'ultimate-shitposting'
}

const functions = {
  'omfg': (arg1) => 'AAA' + arg1 + '!!!',
  'random': (min, max) => Math.floor(Math.random() * parseInt(max)) + parseInt(min)
}

let out = tags.get('test', replace, functions);
console.log('The next two lines should equal each other except for the random number ;)')
console.log('hello Gus, you are in ultimate-shitposting random number 3 AAAhi!!!')
console.log(out.data);
