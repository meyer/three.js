import { TypedArray } from '../../animation/AnimationUtils';

export interface Attribute {
	array: TypedArray;
	dynamic: boolean;
	onUploadCallback: () => void;
	version: number;
}

/**
 * @author mrdoob / http://mrdoob.com/
 */

export class WebGLAttributes {

	constructor( gl: WebGLRenderingContext | WebGL2RenderingContext ) {

		this.gl = gl;

	}

	gl: WebGLRenderingContext | WebGL2RenderingContext;

	buffers = new WeakMap<any, any>();

	createBuffer( attribute: Attribute, bufferType: any ) {

		var array = attribute.array;
		var usage = attribute.dynamic ? this.gl.DYNAMIC_DRAW : this.gl.STATIC_DRAW;

		var buffer = this.gl.createBuffer();

		this.gl.bindBuffer( bufferType, buffer );
		this.gl.bufferData( bufferType, array, usage );

		attribute.onUploadCallback();

		var type = this.gl.FLOAT;

		if ( array instanceof Float32Array ) {

			type = this.gl.FLOAT;

		} else if ( array instanceof Float64Array ) {

			console.warn(
				'THREE.WebGLAttributes: Unsupported data buffer format: Float64Array.'
			);

		} else if ( array instanceof Uint16Array ) {

			type = this.gl.UNSIGNED_SHORT;

		} else if ( array instanceof Int16Array ) {

			type = this.gl.SHORT;

		} else if ( array instanceof Uint32Array ) {

			type = this.gl.UNSIGNED_INT;

		} else if ( array instanceof Int32Array ) {

			type = this.gl.INT;

		} else if ( array instanceof Int8Array ) {

			type = this.gl.BYTE;

		} else if ( array instanceof Uint8Array ) {

			type = this.gl.UNSIGNED_BYTE;

		}

		return {
			buffer: buffer,
			type: type,
			bytesPerElement: array.BYTES_PER_ELEMENT,
			version: attribute.version,
		};

	}

	updateBuffer( buffer: any, attribute: any, bufferType: any ) {

		var array = attribute.array;
		var updateRange = attribute.updateRange;

		this.gl.bindBuffer( bufferType, buffer );

		if ( attribute.dynamic === false ) {

			this.gl.bufferData( bufferType, array, this.gl.STATIC_DRAW );

		} else if ( updateRange.count === - 1 ) {

			// Not using update ranges

			this.gl.bufferSubData( bufferType, 0, array );

		} else if ( updateRange.count === 0 ) {

			console.error(
				'THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually.'
			);

		} else {

			this.gl.bufferSubData(
				bufferType,
				updateRange.offset * array.BYTES_PER_ELEMENT,
				array.subarray(
					updateRange.offset,
					updateRange.offset + updateRange.count
				)
			);

			updateRange.count = - 1; // reset range

		}

	}

	//

	get( attribute: any ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		return this.buffers.get( attribute );

	}

	remove( attribute: any ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		var data = this.buffers.get( attribute );

		if ( data ) {

			this.gl.deleteBuffer( data.buffer );

			this.buffers.delete( attribute );

		}

	}

	update( attribute: any, bufferType: any ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		var data = this.buffers.get( attribute );

		if ( data === undefined ) {

			this.buffers.set( attribute, this.createBuffer( attribute, bufferType ) );

		} else if ( data.version < attribute.version ) {

			this.updateBuffer( data.buffer, attribute, bufferType );

			data.version = attribute.version;

		}

	}

}
