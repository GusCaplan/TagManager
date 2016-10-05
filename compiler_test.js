const compiler = require('./compiler');

const functions = {
  'add': (x, y) => Number(x) + Number(y),
  'sub': (x, y) => Number(x) - Number(y)
}

console.log(compiler('yay {sub;4;{add;2;2}} is 0!', functions));
