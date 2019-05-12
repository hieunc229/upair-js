# vsjs-upair

`upair` convert Javascript Object into binary format,
developed for communicate with `vasern-server`.

Since data is stored as binary in data file, by using binary format data, we can avoid format data in the server (which reduce server work load).

## Example

```js
import UPAIR from 'vsjs-upair';

var jsObject = {
    id: "0b5bab884453136ec8b",
    name: "Peter",
    yearOfBirth: 1984
};

// Convert to binary format
var arrayBuffer = UPAIR.toBuffer(jsObject);

// Convert back to JavaScript Object
var parsedJsObject = UPAIR.parse(arrayBuffer);
```

## Installation

`upair` is available as a NPM package name `vsjs-upair`

```ssh
$ npm install vsjs-upair

# or using yarn
$ yarn add vsjs-upair
```

Feedback and contribution are welcome