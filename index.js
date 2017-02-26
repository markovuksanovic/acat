#!/usr/bin/env node

var program = require('commander');
var marshalItem = require('dynamodb-marshaler').marshalItem;
var unmarshalItem = require('dynamodb-marshaler').unmarshalItem;
var fs = require('fs');

program
    .version('1.0.0')
    .option('-p, --prefix [prefix]', 'Prefix generated files with this name [transformed]', 'transformed')
    .option('-m, --marshal', 'Marshal JSON into AWS dynamodb compatible json. This is default in case -m or -u is not specified.')
    .option('-u, --unmarshal', 'Unmarshal JSON from AWS dynamodb compatible json. Excludes -m.')
    .option('-d, --dest [build]', 'Folder in which output will be placed [build]', 'build')
    .usage('[options] <file>')
    .parse(process.argv);
if(process.stdin.isTTY && !program.args.length) {
    program.help();
}

function shouldMarshal(program) {
  if (!program.marshal && !program.unmarshal) {
    return true;
  } else if (program.marshal && program.unmarshal) {
    throw "-m and -u cannot be specified at the same time."
  } else if (program.marshal) {
    return true;
  } else {
    return false;
  }
}

function readFileContent(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      var items = JSON.parse(data);
      resolve(items);
    })
  })
}

function  readInputStreamAsData() {
  return new Promise((resolve, reject) => {
    let inputContent = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => {
      inputContent += data;
    });
    process.stdin.on('end', () => {
      resolve(JSON.parse(inputContent));
    })
  })
}


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

function marshalJson(items) {
	for (var i = 0; i < items.length; i++) {
    fs.writeFile(`${program.dest}/${program.prefix}${i}.json`, JSON.stringify(marshalItem(items[i])), (err) => {
        if (err) {
          console.error(err);
          process.exit(err.code);
        }
      })
	  };
}

function unrshalJson(json) {
  fs.writeFile(`${program.dest}/${program.prefix}.json`, JSON.stringify(unmarshalItem(json)), (err) => {
    if (err) {
      console.error(err);
      process.exit(err.code);
    }
  })
}

let inputStreamPromise;
if (program.args[0]) {
  inputStreamPromise = readFileContent(program.args[0])
} else {
  inputStreamPromise = readInputStreamAsData();
}

inputStreamPromise.then((json) => {
    maybeCreateDir(program.dest, () => { 
      if (shouldMarshal(program)) {
        marshalJson(json) 
      } else {
        unrshalJson(json)
      }
    });
  })
  .catch((err) => {
    console.error(err);
  })