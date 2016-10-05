const compiler = require('./compiler');

const functions = {
  'add': (x, y) => Number(x) + Number(y),
  'sub': (x, y) => Number(x) - Number(y),
  'advanced': (...args) => args.join(', ')
}

console.log(compiler('yay {set;x;{add;1;2}} is {get;x}', functions));
