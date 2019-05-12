import BufferWriter from './BufferWriter';
import BufferReader from './BufferReader';
import { ObjectInterface } from './types';

export class UPAIR {

	static toBuffer(object: ObjectInterface) : ArrayBuffer {
		var buff = new BufferWriter({ object });
		return buff.toBuffer().buffer;
	}

	static parse(buffer: ArrayBuffer) : Object {

		var buff = new BufferReader({ buffer });
		return buff.toObject();
	}
}