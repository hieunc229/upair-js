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
var config_1 = require("./config");
var BufferWriter = /** @class */ (function () {
    function BufferWriter(opts) {
        var _this = this;
        // Method calculate size of a value (including its type)
        this._sizeOf = function (initSize, value, type) {
            if (type) {
                initSize += value.length + 1;
                return initSize;
            }
            initSize++; // slot for type
            switch (typeof value) {
                case "string":
                    initSize += value.length + 1; // slot for string length
                    break;
                case "number":
                    initSize += GeneralConfig.dataSizes.Number;
                    break;
                case "boolean":
                    initSize++;
                    break;
                case "object":
                    initSize++; // slot for length of item or keys
                    if (Array.isArray(value)) {
                        value.forEach(function (item) { return initSize = _this._sizeOf(initSize, item); });
                    }
                    else {
                        Object.keys(value).forEach(function (key) {
                            initSize = _this._sizeOf(initSize, key, "propName"); // No slot type for key;
                            initSize = _this._sizeOf(initSize, value[key]);
                        });
                    }
                    break;
                default:
                    // Should not be here, something else went wrong
                    throw Error("Unable define value type of " + value);
            }
            return initSize;
        };
        this._bufferAny = function (opts, value, key) {
            switch (typeof value) {
                case "string":
                    return _this._bufferString(opts, value, key);
                case "number":
                    return _this._bufferNumber(opts, value, key);
                case "boolean":
                    return _this._bufferBool(opts, value, key);
                case "object":
                    if (Array.isArray(value)) {
                        return _this._bufferArray(opts, value, key);
                    }
                    return _this._bufferObject(opts, value, key);
                default:
                    break;
            }
            throw Error("Unable to buffer value at " + opts.pos);
        };
        this._bufferPropName = function (opts, prop) {
            opts.view.setInt8(opts.pos++, prop.length);
            for (var i = 0; i < prop.length; i++) {
                opts.view.setUint8(opts.pos++, prop.charCodeAt(i));
            }
            return opts;
        };
        this._bufferString = function (opts, value, key) {
            opts.view.setInt8(opts.pos++, GeneralConfig.nativeTypes.string);
            if (key) {
                opts = _this._bufferPropName(opts, key);
            }
            opts.view.setInt8(opts.pos++, value.length);
            for (var i = 0; i < value.length; i++) {
                opts.view.setUint8(opts.pos++, value.charCodeAt(i));
            }
            return opts;
        };
        this._bufferNumber = function (opts, value, key) {
            // debugger;
            opts.view.setInt8(opts.pos++, GeneralConfig.nativeTypes.number);
            if (key) {
                opts = _this._bufferPropName(opts, key);
            }
            // set as big-endian
            opts.view.setFloat64(opts.pos, value, true);
            opts.pos += GeneralConfig.dataSizes.Number;
            return opts;
        };
        this._bufferBool = function (opts, value, key) {
            opts.view.setInt8(opts.pos++, GeneralConfig.nativeTypes.boolean);
            if (key) {
                opts = _this._bufferPropName(opts, key);
            }
            opts.view.setInt8(opts.pos++, value ? 1 : 0);
            return opts;
        };
        this._bufferObject = function (opts, value, key) {
            var keys = Object.keys(value);
            opts.view.setInt8(opts.pos++, GeneralConfig.nativeTypes.object);
            if (key) {
                opts = _this._bufferPropName(opts, key);
            }
            opts.view.setInt8(opts.pos++, keys.length);
            keys.forEach(function (key) {
                // opts = this._bufferPropName(opts, key);
                opts = _this._bufferAny(opts, value[key], key);
            });
            return opts;
        };
        this._bufferArray = function (opts, values, key) {
            opts.view.setInt8(opts.pos++, GeneralConfig.nativeTypes.array);
            if (key) {
                opts = _this._bufferPropName(opts, key);
            }
            opts.view.setInt8(opts.pos++, values.length);
            values.forEach(function (value) {
                opts = _this._bufferAny(opts, value);
            });
            return opts;
        };
        this.object = opts.object;
        this.bSize = opts.bSize || 512;
    }
    BufferWriter.prototype.toBuffer = function () {
        var _this = this;
        var object = this.object;
        var bufferObject = {
            view: new DataView(new ArrayBuffer(this._sizeOf(config_1.START_POS, object))),
            pos: config_1.START_POS
        };
        var keys = Object.keys(object);
        bufferObject.view.setInt8(1, keys.length);
        keys.forEach(function (key) {
            bufferObject = _this._bufferAny(bufferObject, object[key], key);
        });
        return bufferObject.view;
    };
    return BufferWriter;
}());
exports.default = BufferWriter;
