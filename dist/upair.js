"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var BufferWriter_1 = __importDefault(require("./BufferWriter"));
var BufferReader_1 = __importDefault(require("./BufferReader"));
var UPAIR = /** @class */ (function () {
    function UPAIR() {
    }
    UPAIR.toBuffer = function (object) {
        var buff = new BufferWriter_1.default({ object: object });
        return buff.toBuffer().buffer;
    };
    UPAIR.parse = function (buffer) {
        var buff = new BufferReader_1.default({ buffer: buffer });
        return buff.toObject();
    };
    return UPAIR;
}());
exports.UPAIR = UPAIR;
