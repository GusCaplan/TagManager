const compiler = require('./compiler');

const functions = {
  'advanced': (...args) => args.join(', ')
}

console.log(compiler(`{set;x;{add;1;2}}
yay x is {get;x}
{set;y;12}
{add;2;3;4}
A-Za-z0-9 _.,!?"'<>@#&*)($^-`, functions));
