const TagManager = require('./TagManager');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

const functions = {
  'name': () => 'Gus',
  'channel': () => 'ultimate-shitposting',
  'omfg': (arg1) => 'AAA' + arg1 + '!!!',
  'random': (min, max) => Math.floor(Math.random() * parseInt(max)) + parseInt(min)
}

const tags = new TagManager({
  functions: functions
});

async(() => {
  tags.set('test', 'hello {name}, you are in {channel} random number {random;1;4} {omfg;hi}', {author: '1234'});
  tags.set('o shit', 'hello');
  let out = await(tags.get('test'));
  console.log('The next two lines should equal each other except for the random number ;)')
  console.log('hello Gus, you are in ultimate-shitposting random number 3 AAAhi!!!');
  console.log(out.data);
  console.log('tag with name \'test\' exists:', tags.exists('test'));
  console.log('tag with name \'o3u2fweksdbj\' exists:', tags.exists('o3u2fweksdbj'))
  console.log('TAGS:', tags.keys().join(', ').substring(0, 2000));
  tags.remove('test');
  console.log('removed tag \'test\', so exists is now', tags.exists('test'));
})();
