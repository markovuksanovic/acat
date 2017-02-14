#!/usr/bin/env node

var program = require('commander');
var marshalItem = require('dynamodb-marshaler').marshalItem;
var fs = require('fs');

program
    .version('1.0.0')
    .option('-p, --prefix [prefix]', 'Prefix generated files with this name [transformed]', 'transformed')
    .option('-d, --dest [build]', 'Folder in which output will be placed [build]', 'build')
    .usage('[options] <file>')
    .parse(process.argv);
if(!program.args.length) {
    program.help();
}

var fileContent= fs.readFileSync(program.args[0], 'utf8')
var items = JSON.parse(fileContent);

function maybeCreateDir(dirName, next) {
  fs.stat(dirName, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT')
      {
        fs.mkdirSync(dirName);
      }
      else {
        console.error(err);
        process.exit(err.code);
      }
    }
    next();
  })
}

function processItems(items) {
	for (var i = 0; i < items.length; i++) {
    fs.writeFile(`${program.dest}/${program.prefix}${i}.json`,     JSON.stringify(marshalItem(items[i])), (err) => {
        if (err) {
          console.error(err);
          process.exit(err.code);
        }
      })
	  };
}

maybeCreateDir(program.dest, () => { processItems(items) });

