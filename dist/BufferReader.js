"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var GeneralConfig = __importStar(require("./generalConfig"));
var BufferReader = /** @class */ (function () {
    function BufferReader(opts) {
        var _this = this;
        this._getPropName = function () {
            var size = _this.buffer.getInt8(_this.pos++);
            var prop = "";
            for (var x = 0; x < size; x++) {
                prop += String.fromCharCode(_this.buffer.getUint8(_this.pos++));
            }
            return prop;
        };
        this._getAny = function (type) {
            type = type || _this.buffer.getInt8(_this.pos++);
            switch (GeneralConfig.nativeTypes[type]) {
                case "string":
                    return _this._getString();
                case "number":
                    return _this._getNumber();
                case "boolean":
                    return _this._getBool();
                case "array":
                    return _this._getArray();
                case "object":
                    return _this._getObject();
                default:
                    throw Error("Unable to get value type: " + GeneralConfig.nativeTypes[type]);
            }
        };
        this._getString = function () {
            var size = _this.buffer.getInt8(_this.pos++);
            var str = "";
            for (var x = 0; x < size; x++) {
                str += String.fromCharCode(_this.buffer.getUint8(_this.pos++));
            }
            return str;
        };
        // numbers use big-endian format
        this._getNumber = function () {
            var number = _this.buffer.getFloat64(_this.pos, true);
            _this.pos += GeneralConfig.dataSizes.Number;
            return number;
        };
        this._getBool = function () {
            return _this.buffer.getInt8(_this.pos++) === 1;
        };
        this._getArray = function () {
            var size = _this.buffer.getInt8(_this.pos++);
            var rs = new Array(size);
            for (var i = 0; i < size; i++) {
                rs[i] = _this._getAny();
            }
            return rs;
        };
        this._getObject = function () {
            var size = _this.buffer.getInt8(_this.pos++);
            var rs = {}, prop, value, type;
            for (var i = 0; i < size; i++) {
                type = _this.buffer.getInt8(_this.pos++);
                prop = _this._getString();
                value = _this._getAny(type);
                rs[prop] = value;
            }
            return rs;
        };
        this.buffer = new DataView(opts.buffer);
        this.bSize = opts.bSize || 512;
        this.pos = 10;
    }
    BufferReader.prototype.toObject = function () {
        var numOfProps = this.buffer.getInt8(1);
        var rs = {}, prop, value, type;
        for (var i = 0; i < numOfProps; i++) {
            type = this.buffer.getInt8(this.pos++);
            prop = this._getString();
            value = this._getAny(type);
            rs[prop] = value;
        }
        return rs;
    };
    BufferReader.prototype.clear = function () {
        delete this.buffer;
        delete this.pos;
    };
    return BufferReader;
}());
exports.default = BufferReader;
// type BufferObject = { view: DataView, pos: number };
