const chevrotain = require('chevrotain');

Array.prototype.__defineGetter__('last', function () {
  return this[this.length - 1];
})

var extendToken = chevrotain.extendToken;
var Lexer = chevrotain.Lexer;

var Identifier = extendToken('Identifier', /[A-Za-z0-9 _.,!?"'\/]+/i);
var FunctionOpen = extendToken('FunctionOpen', /{/);
var FunctionClose = extendToken('FunctionClose', /}/);
var ArgumentSeperator = extendToken('ArgumentSeperator', /;/);

var allTokens = [FunctionOpen, FunctionClose, Identifier, ArgumentSeperator];

var SelectLexer = new Lexer(allTokens, true);

const tokenize = text => {
  var lexResult = SelectLexer.tokenize(text);

  if (lexResult.errors.length >= 1) {
    throw new Error('sad sad panda lexing errors detected')
  }
  return lexResult;
}

module.exports = (input, functions = {}) => {
  let lexed = tokenize(input);
  let tokens = lexed.tokens;

  let scope = [];
  let run = {
    final: '',
    exec: []
  };
  let lastEX = 0;

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
  return run.exec.filter(e => !e.called).map(e => e.compiled).join('');
}
