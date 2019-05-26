/**
 * @author tschw
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

export type TypedArrayConstructor =
	| Float32ArrayConstructor
	| Float64ArrayConstructor
	| Int16ArrayConstructor
	| Int32ArrayConstructor
	| Int8ArrayConstructor
	| Uint16ArrayConstructor
	| Uint32ArrayConstructor
	| Uint8ArrayConstructor
	| Uint8ClampedArrayConstructor;

export type TypedArray =
	// TODO(meyer) bigint supported?
	// | BigInt64Array
	// | BigUint64Array
	| Float32Array
	| Float64Array
	| Int16Array
	| Int32Array
	| Int8Array
	| Uint16Array
	| Uint32Array
	| Uint8Array
	| Uint8ClampedArray;

const isTypedArrayConstructor = ( obj: any ): obj is TypedArrayConstructor =>
	typeof obj.BYTES_PER_ELEMENT === 'number';

// same as Array.prototype.slice, but also works on typed arrays
function arraySlice( array: any, from: number, to?: number ): any {

	if ( isTypedArray( array ) ) {

		// in ios9 array.subarray(from, undefined) will return empty array
		// but array.subarray(from) or array.subarray(from, len) is correct
		return new ( array as any ).constructor(
			array.subarray( from, to !== undefined ? to : array.length )
		);

	}

	return array.slice( from, to );

}

function convertArray<T extends any[]>(
	array: T,
	type: ArrayConstructor,
	forceClone?: boolean
): T;

// converts an array to a specific type
function convertArray<T extends TypedArrayConstructor>(
	array: any[],
	type: T,
	forceClone?: boolean
): InstanceType<T> {

	if (
		! array || // let 'undefined' and 'null' pass
		( ! forceClone && array.constructor === type )
	)
		return array as any;

	if ( isTypedArrayConstructor( type ) ) {

		return new type( array ) as any; // create typed array

	}

	return Array.prototype.slice.call( array ); // create Array

}

function isTypedArray( object: any ): object is TypedArray {

	return ArrayBuffer.isView( object ) && ! ( object instanceof DataView );

}

// returns an array by which times and values can be sorted
function getKeyframeOrder( times: number[] ): number[] {

	function compareTime( i, j ) {

		return times[ i ] - times[ j ];

	}

	var n = times.length;
	const result: number[] = new Array( n );
	for ( var i = 0; i !== n; ++ i ) result[ i ] = i;

	result.sort( compareTime );

	return result;

}

// uses the array previously returned by 'getKeyframeOrder' to sort data
function sortedArray<T extends any>(
	values: T[],
	stride: number,
	order: number[]
): T[] {

	var nValues = values.length;
	var result: T[] = new ( values as any ).constructor( nValues );

	for ( var i = 0, dstOffset = 0; dstOffset !== nValues; ++ i ) {

		var srcOffset = order[ i ] * stride;

		for ( var j = 0; j !== stride; ++ j ) {

			result[ dstOffset ++ ] = values[ srcOffset + j ];

		}

	}

	return result;

}

// function for parsing AOS keyframe formats
function flattenJSON(
	jsonKeys: { time: number }[],
	times: number[],
	values: any[],
	valuePropertyName: string
): void {

	var i = 1,
		key = jsonKeys[ 0 ];

	while ( key !== undefined && key[ valuePropertyName ] === undefined ) {

		key = jsonKeys[ i ++ ];

	}

	if ( key === undefined ) return; // no data

	var value = key[ valuePropertyName ];
	if ( value === undefined ) return; // no data

	if ( Array.isArray( value ) ) {

		do {

			value = key[ valuePropertyName ];

			if ( value !== undefined ) {

				times.push( key.time );
				values.push.apply( values, value ); // push all elements

			}

			key = jsonKeys[ i ++ ];

		} while ( key !== undefined );

	} else if ( value.toArray !== undefined ) {

		// ...assume THREE.Math-ish

		do {

			value = key[ valuePropertyName ];

			if ( value !== undefined ) {

				times.push( key.time );
				value.toArray( values, values.length );

			}

			key = jsonKeys[ i ++ ];

		} while ( key !== undefined );

	} else {

		// otherwise push as-is

		do {

			value = key[ valuePropertyName ];

			if ( value !== undefined ) {

				times.push( key.time );
				values.push( value );

			}

			key = jsonKeys[ i ++ ];

		} while ( key !== undefined );

	}

}

export const AnimationUtils = {
	isTypedArray,
	arraySlice,
	convertArray,
	getKeyframeOrder,
	sortedArray,
	flattenJSON,
};
