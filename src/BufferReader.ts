import * as GeneralConfig from "./generalConfig";
import { ObjectInterface } from "./types";
type BufferReaderOpts = {
  buffer: ArrayBuffer;
  bSize?: number;
};
export default class BufferReader {
  buffer: DataView;
  bSize: number;
  pos: number;

  constructor(opts: BufferReaderOpts) {
    this.buffer = new DataView(opts.buffer);
    this.bSize = opts.bSize || 512;
    this.pos = 10;
  }

  toObject() {
    let numOfProps = this.buffer.getInt8(1);
    let rs: ObjectInterface = {},
      prop,
      value,
      type;
    for (var i = 0; i < numOfProps; i++) {
      type = this.buffer.getInt8(this.pos++);
      prop = this._getString();
      value = this._getAny(type);
      rs[prop] = value;
    }
    return rs;
  }

  _getPropName = (): string => {
    let size = this.buffer.getInt8(this.pos++);
    let prop = "";
    for (var x = 0; x < size; x++) {
      prop += String.fromCharCode(this.buffer.getUint8(this.pos++));
    }
    return prop;
  };

  _getAny = (type?: number): any => {
    type = type || this.buffer.getInt8(this.pos++);
    switch (GeneralConfig.nativeTypes[type]) {
      case "string":
        return this._getString();

      case "number":
        return this._getNumber();

      case "boolean":
        return this._getBool();

      case "array":
        return this._getArray();

      case "object":
        return this._getObject();

      default:
        throw Error(
          `Unable to get value type: ${GeneralConfig.nativeTypes[type]}`
        );
    }
  };

  _getString = (): string => {
    let size = this.buffer.getInt8(this.pos++);
    let str = "";
    for (var x = 0; x < size; x++) {
      str += String.fromCharCode(this.buffer.getUint8(this.pos++));
    }
    return str;
  };

  // numbers use big-endian format
  _getNumber = (): number => {
    let number = this.buffer.getFloat64(this.pos, true);
    this.pos += GeneralConfig.dataSizes.Number;
    return number;
  };

  _getBool = (): boolean => {
    return this.buffer.getInt8(this.pos++) === 1;
  };

  _getArray = (): Array<any> => {
    let size = this.buffer.getInt8(this.pos++);
    let rs = new Array(size);

    for (let i = 0; i < size; i++) {
      rs[i] = this._getAny();
    }
    return rs;
  };

  _getObject = (): Object => {
    let size = this.buffer.getInt8(this.pos++);
    let rs: ObjectInterface = {},
      prop,
      value,
      type;

    for (let i = 0; i < size; i++) {
      type = this.buffer.getInt8(this.pos++);
      prop = this._getString();
      value = this._getAny(type);
      rs[prop] = value;
    }
    return rs;
  };

  clear() {
    delete this.buffer;
    delete this.pos;
  }
}

// type BufferObject = { view: DataView, pos: number };
