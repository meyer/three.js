import { Vector4 } from '../math/Vector4';
import { Vector3 } from '../math/Vector3';
import { Vector2 } from '../math/Vector2';
import { Color } from '../math/Color';
import { TypedArray } from '../animation/AnimationUtils';

/**
 * @author mrdoob / http://mrdoob.com/
 */

export class BufferAttribute {

	constructor( array: TypedArray, itemSize: number, normalized?: boolean ) {

		if ( Array.isArray( array ) ) {

			throw new TypeError(
				'THREE.BufferAttribute: array should be a Typed Array.'
			);

		}

		this.name = '';

		this.array = array;
		this.itemSize = itemSize;
		this.count = array !== undefined ? array.length / itemSize : 0;
		this.normalized = normalized === true;

		this.dynamic = false;
		this.updateRange = { offset: 0, count: - 1 };

		this.version = 0;

	}

	name: string;
	array: TypedArray;
	count: number;
	normalized: boolean;
	itemSize: number;
	dynamic: boolean;
	updateRange: { offset: number; count: number };
	version: number;

	set needsUpdate( value: boolean ) {

		if ( value === true ) this.version ++;

	}

	isBufferAttribute = true;

	onUploadCallback() {}

	setArray( array: TypedArray ) {

		if ( Array.isArray( array ) ) {

			throw new TypeError(
				'THREE.BufferAttribute: array should be a Typed Array.'
			);

		}

		this.count = array !== undefined ? array.length / this.itemSize : 0;
		this.array = array;

		return this;

	}

	setDynamic( value: boolean ) {

		this.dynamic = value;

		return this;

	}

	copy( source: BufferAttribute ) {

		this.name = source.name;
		this.array = new ( source.array.constructor as any )( source.array );
		this.itemSize = source.itemSize;
		this.count = source.count;
		this.normalized = source.normalized;

		this.dynamic = source.dynamic;

		return this;

	}

	copyAt( index1: number, attribute: BufferAttribute, index2: number ) {

		index1 *= this.itemSize;
		index2 *= attribute.itemSize;

		for ( var i = 0, l = this.itemSize; i < l; i ++ ) {

			this.array[ index1 + i ] = attribute.array[ index2 + i ];

		}

		return this;

	}

	copyArray( array: ArrayLike<any> ) {

		this.array.set( array );

		return this;

	}

	copyColorsArray( colors: Color[] ) {

		var array = this.array,
			offset = 0;

		for ( var i = 0, l = colors.length; i < l; i ++ ) {

			var color = colors[ i ];

			if ( color === undefined ) {

				console.warn(
					'THREE.BufferAttribute.copyColorsArray(): color is undefined',
					i
				);
				// TODO(meyer) Color expects 1 or 3 params
				color = new Color( 0, 0, 0 );

			}

			array[ offset ++ ] = color.r;
			array[ offset ++ ] = color.g;
			array[ offset ++ ] = color.b;

		}

		return this;

	}

	copyVector2sArray( vectors: Vector2[] ) {

		var array = this.array,
			offset = 0;

		for ( var i = 0, l = vectors.length; i < l; i ++ ) {

			var vector = vectors[ i ];

			if ( vector === undefined ) {

				console.warn(
					'THREE.BufferAttribute.copyVector2sArray(): vector is undefined',
					i
				);
				vector = new Vector2();

			}

			array[ offset ++ ] = vector.x;
			array[ offset ++ ] = vector.y;

		}

		return this;

	}

	copyVector3sArray( vectors: Vector3[] ) {

		var array = this.array,
			offset = 0;

		for ( var i = 0, l = vectors.length; i < l; i ++ ) {

			var vector = vectors[ i ];

			if ( vector === undefined ) {

				console.warn(
					'THREE.BufferAttribute.copyVector3sArray(): vector is undefined',
					i
				);
				vector = new Vector3();

			}

			array[ offset ++ ] = vector.x;
			array[ offset ++ ] = vector.y;
			array[ offset ++ ] = vector.z;

		}

		return this;

	}

	copyVector4sArray( vectors: Vector4[] ) {

		var array = this.array,
			offset = 0;

		for ( var i = 0, l = vectors.length; i < l; i ++ ) {

			var vector = vectors[ i ];

			if ( vector === undefined ) {

				console.warn(
					'THREE.BufferAttribute.copyVector4sArray(): vector is undefined',
					i
				);
				vector = new Vector4();

			}

			array[ offset ++ ] = vector.x;
			array[ offset ++ ] = vector.y;
			array[ offset ++ ] = vector.z;
			array[ offset ++ ] = vector.w;

		}

		return this;

	}

	set( value: any, offset?: number ) {

		if ( offset === undefined ) offset = 0;

		this.array.set( value, offset );

		return this;

	}

	getX( index: number ) {

		return this.array[ index * this.itemSize ];

	}

	setX( index: number, x: any ) {

		this.array[ index * this.itemSize ] = x;

		return this;

	}

	getY( index: number ) {

		return this.array[ index * this.itemSize + 1 ];

	}

	setY( index: number, y: any ) {

		this.array[ index * this.itemSize + 1 ] = y;

		return this;

	}

	getZ( index: number ) {

		return this.array[ index * this.itemSize + 2 ];

	}

	setZ( index: number, z: any ) {

		this.array[ index * this.itemSize + 2 ] = z;

		return this;

	}

	getW( index: number ) {

		return this.array[ index * this.itemSize + 3 ];

	}

	setW( index: number, w: any ) {

		this.array[ index * this.itemSize + 3 ] = w;

		return this;

	}

	setXY( index: number, x: any, y: any ) {

		index *= this.itemSize;

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;

		return this;

	}

	setXYZ( index: number, x: any, y: any, z: any ) {

		index *= this.itemSize;

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;

		return this;

	}

	setXYZW( index: number, x: any, y: any, z: any, w: any ) {

		index *= this.itemSize;

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;
		this.array[ index + 3 ] = w;

		return this;

	}

	onUpload( callback: ( ...args: any ) => any ) {

		this.onUploadCallback = callback;

		return this;

	}

	clone() {

		return new ( this.constructor as any )( this.array, this.itemSize ).copy( this );

	}

	toJSON() {

		return {
			itemSize: this.itemSize,
			type: this.array.constructor.name,
			array: Array.prototype.slice.call( this.array ),
			normalized: this.normalized,
		};

	}

}

type FirstParam<
T extends new ( arg: any, ...args: any[] ) => any
> = T extends new ( arg: infer Q, ...args: any[] ) => any ? Q : any;

//

export class Int8BufferAttribute extends BufferAttribute {

	constructor(
		array: number | ArrayBuffer | SharedArrayBuffer | ArrayLike<number>,
		itemSize: number,
		normalized?: boolean
	) {

		super(
			typeof array === 'number' ? new Int8Array( array ) : new Int8Array( array ),
			itemSize,
			normalized
		);

	}

}

export class Uint8BufferAttribute extends BufferAttribute {

	constructor(
		array: number | ArrayBuffer | SharedArrayBuffer | ArrayLike<number>,
		itemSize: number,
		normalized?: boolean
	) {

		super(
			typeof array === 'number' ? new Uint8Array( array ) : new Uint8Array( array ),
			itemSize,
			normalized
		);

	}

}

export class Uint8ClampedBufferAttribute extends BufferAttribute {

	constructor(
		array: number | ArrayBuffer | SharedArrayBuffer | ArrayLike<number>,
		itemSize: number,
		normalized?: boolean
	) {

		super(
			typeof array === 'number'
				? new Uint8ClampedArray( array )
				: new Uint8ClampedArray( array ),
			itemSize,
			normalized
		);

	}

}

export class Int16BufferAttribute extends BufferAttribute {

	constructor(
		array: number | ArrayBuffer | SharedArrayBuffer | ArrayLike<number>,
		itemSize: number,
		normalized?: boolean
	) {

		super(
			typeof array === 'number' ? new Int16Array( array ) : new Int16Array( array ),
			itemSize,
			normalized
		);

	}

}

export class Uint16BufferAttribute extends BufferAttribute {

	constructor(
		array: number | ArrayBuffer | SharedArrayBuffer | ArrayLike<number>,
		itemSize: number,
		normalized?: boolean
	) {

		super(
			typeof array === 'number'
				? new Uint16Array( array )
				: new Uint16Array( array ),
			itemSize,
			normalized
		);

	}

}

export class Int32BufferAttribute extends BufferAttribute {

	constructor(
		array: number | ArrayBuffer | SharedArrayBuffer | ArrayLike<number>,
		itemSize: number,
		normalized?: boolean
	) {

		super(
			typeof array === 'number' ? new Int32Array( array ) : new Int32Array( array ),
			itemSize,
			normalized
		);

	}

}

export class Uint32BufferAttribute extends BufferAttribute {

	constructor(
		array: number | ArrayBuffer | SharedArrayBuffer | ArrayLike<number>,
		itemSize: number,
		normalized?: boolean
	) {

		super(
			typeof array === 'number'
				? new Uint32Array( array )
				: new Uint32Array( array ),
			itemSize,
			normalized
		);

	}

}

export class Float32BufferAttribute extends BufferAttribute {

	constructor(
		array: number | ArrayBuffer | SharedArrayBuffer | ArrayLike<number>,
		itemSize: number,
		normalized?: boolean
	) {

		super(
			typeof array === 'number'
				? new Float32Array( array )
				: new Float32Array( array ),
			itemSize,
			normalized
		);

	}

}

export class Float64BufferAttribute extends BufferAttribute {

	constructor(
		array: number | ArrayBuffer | SharedArrayBuffer | ArrayLike<number>,
		itemSize: number,
		normalized?: boolean
	) {

		super(
			typeof array === 'number'
				? new Float64Array( array )
				: new Float64Array( array ),
			itemSize,
			normalized
		);

	}

}
