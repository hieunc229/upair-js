
import * as GeneralConfig from '../generalConfig';
import { ObjectInterface } from '../types';

type BufferObject = { view: DataView, pos: number };
type BufferWriterOpts = {
	object: any;
	bSize?: number
}
export default class BufferWriter {
	object: ObjectInterface;
	bSize: number;

	constructor(opts: BufferWriterOpts) {
        this.object = opts.object;
		this.bSize = opts.bSize || 512;
	}

	toBuffer(): DataView {
		
		let { object } = this;
		var bufferObject: BufferObject = {
			view: new DataView(new ArrayBuffer(this._sizeOf(10, object))), 
			pos: 10
		}

		const keys = Object.keys(object);
		bufferObject.view.setInt8(1, keys.length);

		keys.forEach( key => {
			bufferObject = this._bufferAny(bufferObject, object[key], key);
		})

		return bufferObject.view;
	}

	// Method calculate size of a value (including its type)
	_sizeOf = (initSize: number, value: any, type?: string) => {
		
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

					value.forEach(item => initSize = this._sizeOf(initSize, item));

				} else {
					Object.keys(value).forEach( key => {
						initSize = this._sizeOf(initSize, key, "propName"); // No slot type for key;
						initSize = this._sizeOf(initSize, value[key])
					});
				}

				break;

			default:
				// Should not be here, something else went wrong
				throw Error(`Unable define value type of ${value}`);
		}

		return initSize;
	};

	_bufferAny = (opts: BufferObject, value: ObjectInterface, key?: string): BufferObject => {

		switch (typeof value) {
			case "string":
				return this._bufferString(opts, value, key);

			case "number":
				return this._bufferNumber(opts, value, key);

			case "boolean":
				return this._bufferBool(opts, value, key);

			case "object":
				if (Array.isArray(value)) {
					return this._bufferArray(opts, value, key);
				}
				return this._bufferObject(opts, value, key);

			default:
				break;
		}

		throw Error("Unable to buffer value at " + opts.pos);
	};

	_bufferPropName = (opts: BufferObject, prop: string): BufferObject => {
		opts.view.setInt8(opts.pos++, prop.length);

		for (var i = 0; i < prop.length; i++) {
			opts.view.setUint8(opts.pos++, prop.charCodeAt(i));
		}

		return opts;
	};

	_bufferString = (opts: BufferObject, value: string, key?: string): BufferObject => {

		opts.view.setInt8(opts.pos++, GeneralConfig.nativeTypes.string);

		if (key) {
			opts = this._bufferPropName(opts, key);
		}

		opts.view.setInt8(opts.pos++, value.length);

		for (let i = 0; i < value.length; i++) {
			opts.view.setUint8(opts.pos++, value.charCodeAt(i));
		}

		return opts;
	};

	_bufferNumber = (opts: BufferObject, value: number, key?: string): BufferObject => {
		// debugger;
		opts.view.setInt8(opts.pos++, GeneralConfig.nativeTypes.number);

		if (key) {
			opts = this._bufferPropName(opts, key);
		}

		// set as big-endian
		opts.view.setFloat64(opts.pos, value, true);
		opts.pos += GeneralConfig.dataSizes.Number;

		return opts;
	};

	_bufferBool = (opts: BufferObject, value: boolean, key?: string): BufferObject => {
		opts.view.setInt8(opts.pos++, GeneralConfig.nativeTypes.boolean);

		if (key) {
			opts = this._bufferPropName(opts, key);
		}

		opts.view.setInt8(opts.pos++, value ? 1 : 0);

		return opts;
	};

	_bufferObject = (opts: BufferObject, value: ObjectInterface, key?: string): BufferObject => {
		let keys = Object.keys(value);
		opts.view.setInt8(opts.pos++, GeneralConfig.nativeTypes.object);

		if (key) {
			opts = this._bufferPropName(opts, key);
		}

		opts.view.setInt8(opts.pos++, keys.length);

		keys.forEach(key => {
			
			// opts = this._bufferPropName(opts, key);
			opts = this._bufferAny(opts, value[key], key);
		});

		return opts;
	};

	_bufferArray = (opts: BufferObject, values: Array<any>, key?: string): BufferObject => {
		opts.view.setInt8(opts.pos++, GeneralConfig.nativeTypes.array);

		if (key) {
			opts = this._bufferPropName(opts, key);
		}

		opts.view.setInt8(opts.pos++, values.length);

		values.forEach(value => {
			opts = this._bufferAny(opts, value);
		});

		return opts;
	};
}