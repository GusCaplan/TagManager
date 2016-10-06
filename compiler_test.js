const compiler = require('./compiler');

const functions = {
  'add': (x, y) => Number(x) + Number(y),
  'sub': (x, y) => Number(x) - Number(y),
  'advanced': (...args) => args.join(', ')
}

console.log(compiler(`{set;x;{add;1;2}}
yay x is {get;x}
{set;y;12}
this is a newline
A-Za-z0-9 _.,!?"'<>@#&*)($^-`, functions));
