const chevrotain = require('chevrotain');

Array.prototype.__defineGetter__('last', function () {
  return this[this.length - 1];
});

const extendToken = (name, find) => {
  let token = chevrotain.extendToken(name, find);
  token.STRING = token.PATTERN.toString().slice(1, -1);
  return token;
};
const Lexer = chevrotain.Lexer;

const FunctionOpen = extendToken('FunctionOpen', /{/);
const FunctionClose = extendToken('FunctionClose', /}/);
const ArgumentSeperator = extendToken('ArgumentSeperator', /;/);
const Identifier = extendToken('Identifier', /([\u0020-\u003A]|[\u003C-\u007A]|[\u007E-\uFFFFF]|\u007C|[\r\n\v])+/i);

const allTokens = [FunctionOpen, FunctionClose, ArgumentSeperator, Identifier];

const SelectLexer = new Lexer(allTokens, true);

const tokenize = text => {
  var lexResult = SelectLexer.tokenize(text);

  if (lexResult.errors.length >= 1) {
    throw new Error(lexResult.errors[0].message + ' ' + lexResult.errors[0].stack);
  }
  return lexResult;
}

module.exports = (input, functions = {}) => {
  let builtin = {
    'get': i => runtimeArgs[i],
    'set': (i, x) => {
      runtimeArgs[i] = x;
      return;
    }
  }
  Object.keys(builtin).forEach(k => {
    if (k in functions) throw new Error(`"${k}" is reserved`)
  })
  functions = Object.assign(builtin, functions);

  input = input.split('\n').map(image => {
    if (image.startsWith(FunctionOpen.STRING) &&
    image.endsWith(FunctionClose.STRING)) return image.trim();
    return image + '\n';
  }).join('');

  let lexed = tokenize(input);
  let tokens = lexed.tokens;

  let scope = [];
  let run = {
    final: '',
    exec: []
  };
  let lastEX = 0;
  let runtimeArgs = {};

  const compile = (scoped, ex, called = false) => {
    delete scoped.next;
    let out = scoped;
    run.final += `EX_${ex}`
    let x = `${scoped.function}[${scoped.args}]`
    run.exec.push({ex: ex, run: out, stringified: x, called: called, compiled: null});
  }

  const compileBare = image => {
    run.exec.push({ex: lastEX++, run: {'function': null, args: []}, stringified: image, compiled: image});
    scope.splice(scope.length - 1, 1);
  };

  const scopeTemplate = next => {
    return {'function': null, next: next, args: []}
  }

  tokens.forEach(token => {
    switch (token.constructor.name) {
      case 'FunctionOpen':
        if (!scope.last) scope.push(scopeTemplate);
        switch (scope.last.next) {
          case 'args':
            scope.last.args.push(`EX_${lastEX}`);
            scope.push(scopeTemplate('function'));
            break;
          default:
            scope.push(scopeTemplate('function'));
            break;
        }
        break;
      case 'FunctionClose':
        compile(scope.last, lastEX++, (scope.length > 2));
        scope.splice(scope.length - 1, 1);
        break;
      case 'ArgumentSeperator':
        break;
      case 'Identifier':
        if (!scope.last) return compileBare(token.image);
        switch (scope.last.next) {
          case 'function':
            scope.last.function = token.image;
            scope.last.next = 'args';
            break;
          case 'args':
            scope.last.args.push(token.image);
            break;
          default:
            compileBare(token.image);
            break;
        }
        break;
      default:
        break;
    }
  });

  run.exec.forEach(i => {
    if (i.run.function === null) return;
    i.run.args = i.run.args.map(arg => {
      if (run.exec.find(r => ('EX_' + r.ex) === arg)) {
        let replacement = run.exec.find(r => 'EX_' + r.ex === arg).compiled;
        return replacement;
      } else {
        return arg;
      }
    });
    if (!(i.run.function in functions)) {
      i.compiled = 'null';
      return;
    }
    i.compiled = functions[i.run.function](...i.run.args);
  });
  let compiled = run.exec.filter(e => !e.called).map(e => e.compiled).join('').trim();
  return compiled;
}
