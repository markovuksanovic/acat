### acat

A simple utility to transform "normal" json documents into json documents usable by `aws dynamodb` commands. You can find more information about AWS DynamoDB low level API [here](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html).

### Installation

To install `acat` use the following command:

```
npm install -g acat
```

### Usage


To transform a JSON document use the following command:

```
cat some_file.json
```

This will output multiple files (one for each object in `some_file.json`) into build directory. The content of `some_file.json` must be a valid JSON array.

For example, given a file (example.json) with JSON object:

example.json
```
[{
  "animal": "cat",
  "age", 2
}]
```

use:

```
acat example.json
```

To transform document into another document suitable for use by `aws` CLI. The document will be found in `build` subdirectory (you can change using a flag).

To put this into AWS DynamoDB use:

```
aws dynamodb put-item --table-name Animals --input file://build/example0.json
```


