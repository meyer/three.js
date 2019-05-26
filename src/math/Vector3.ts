import { _Math } from './Math';
import { Quaternion } from './Quaternion';
import { Camera } from '../cameras/Camera';
import { Matrix4 } from './Matrix4';
import { Euler } from './Euler';
import { Spherical } from './Spherical';
import { Cylindrical } from './Cylindrical';
import { Matrix3 } from './Matrix3';
import { BufferAttribute } from '../core/BufferAttribute';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */

export class Vector3 {

	constructor( x?: number, y?: number, z?: number ) {

		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;

	}

	x: number;
	y: number;
	z: number;

	isVector3 = true;

	set( x: number, y: number, z: number ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	}

	setScalar( scalar: number ) {

		this.x = scalar;
		this.y = scalar;
		this.z = scalar;

		return this;

	}

	setX( x: number ) {

		this.x = x;

		return this;

	}

	setY( y: number ) {

		this.y = y;

		return this;

	}

	setZ( z: number ) {

		this.z = z;

		return this;

	}

	setComponent( index: 0 | 1 | 2, value: number ) {

		switch ( index ) {

			case 0:
				this.x = value;
				break;
			case 1:
				this.y = value;
				break;
			case 2:
				this.z = value;
				break;
			default:
				throw new Error( 'index is out of range: ' + index );

		}

		return this;

	}

	getComponent( index: 0 | 1 | 2 ) {

		switch ( index ) {

			case 0:
				return this.x;
			case 1:
				return this.y;
			case 2:
				return this.z;
			default:
				throw new Error( 'index is out of range: ' + index );

		}

	}

	clone() {

		return new ( this.constructor as typeof Vector3 )( this.x, this.y, this.z );

	}

	copy( v: Vector3 ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	add( v: Vector3, w?: Vector3 ) {

		if ( w !== undefined ) {

			console.warn(
				'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.'
			);
			return this.addVectors( v, w );

		}

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	addScalar( s: number ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	}

	addVectors( a: Vector3, b: Vector3 ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	}

	addScaledVector( v: Vector3, s: number ) {

		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;

		return this;

	}

	sub( v: Vector3, w?: Vector3 ) {

		if ( w !== undefined ) {

			console.warn(
				'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.'
			);
			return this.subVectors( v, w );

		}

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	subScalar( s: number ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	}

	subVectors( a: Vector3, b: Vector3 ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	multiply( v: Vector3, w?: Vector3 ) {

		if ( w !== undefined ) {

			console.warn(
				'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.'
			);
			return this.multiplyVectors( v, w );

		}

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

	multiplyScalar( scalar: number ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	}

	multiplyVectors( a: Vector3, b: Vector3 ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	}

	applyEuler = ( () => {

		var quaternion = new Quaternion();

		const applyEuler = ( euler: Euler ) => {

			if ( ! ( euler && euler.isEuler ) ) {

				console.error(
					'THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.'
				);

			}

			return this.applyQuaternion( quaternion.setFromEuler( euler ) );

		};

		return applyEuler;

	} )();

	applyAxisAngle = ( () => {

		var quaternion = new Quaternion();

		const applyAxisAngle = ( axis: Vector3, angle: number ) => {

			return this.applyQuaternion( quaternion.setFromAxisAngle( axis, angle ) );

		};

		return applyAxisAngle;

	} )();

	applyMatrix3( m: Matrix3 ) {

		var x = this.x,
			y = this.y,
			z = this.z;
		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		return this;

	}

	applyMatrix4( m: Matrix4 ) {

		var x = this.x,
			y = this.y,
			z = this.z;
		var e = m.elements;

		var w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

		return this;

	}

	applyQuaternion( q: Quaternion ) {

		var x = this.x,
			y = this.y,
			z = this.z;
		var qx = q.x,
			qy = q.y,
			qz = q.z,
			qw = q.w;

		// calculate quat * vector

		var ix = qw * x + qy * z - qz * y;
		var iy = qw * y + qz * x - qx * z;
		var iz = qw * z + qx * y - qy * x;
		var iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	}

	project( camera: Camera ) {

		return this.applyMatrix4( camera.matrixWorldInverse ).applyMatrix4(
			camera.projectionMatrix
		);

	}

	unproject( camera: Camera ) {

		return this.applyMatrix4( camera.projectionMatrixInverse ).applyMatrix4(
			camera.matrixWorld
		);

	}

	transformDirection( m: Matrix4 ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		var x = this.x,
			y = this.y,
			z = this.z;
		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return this.normalize();

	}

	divide( v: Vector3 ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	divideScalar( scalar: number ) {

		return this.multiplyScalar( 1 / scalar );

	}

	min( v: Vector3 ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );

		return this;

	}

	max( v: Vector3 ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );

		return this;

	}

	clamp( min: Vector3, max: Vector3 ) {

		// assumes min < max, componentwise

		this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );
		this.z = Math.max( min.z, Math.min( max.z, this.z ) );

		return this;

	}

	clampScalar( minVal: number, maxVal: number ) {

		this.x = Math.max( minVal, Math.min( maxVal, this.x ) );
		this.y = Math.max( minVal, Math.min( maxVal, this.y ) );
		this.z = Math.max( minVal, Math.min( maxVal, this.z ) );

		return this;

	}

	clampLength( min: number, max: number ) {

		var length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar(
			Math.max( min, Math.min( max, length ) )
		);

	}

	floor() {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );

		return this;

	}

	ceil() {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );

		return this;

	}

	round() {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );

		return this;

	}

	roundToZero() {

		this.x = this.x < 0 ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = this.y < 0 ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = this.z < 0 ? Math.ceil( this.z ) : Math.floor( this.z );

		return this;

	}

	negate() {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

		return this;

	}

	dot( v: Vector3 ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	}

	// TODO lengthSquared?

	lengthSq() {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	}

	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	}

	manhattanLength() {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	}

	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	setLength( length: number ) {

		return this.normalize().multiplyScalar( length );

	}

	lerp( v: Vector3, alpha: number ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	}

	lerpVectors( v1: Vector3, v2: Vector3, alpha: number ) {

		return this.subVectors( v2, v1 )
			.multiplyScalar( alpha )
			.add( v1 );

	}

	cross( v: Vector3, w?: Vector3 ) {

		if ( w !== undefined ) {

			console.warn(
				'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.'
			);
			return this.crossVectors( v, w );

		}

		return this.crossVectors( this, v );

	}

	crossVectors( a: Vector3, b: Vector3 ) {

		var ax = a.x,
			ay = a.y,
			az = a.z;
		var bx = b.x,
			by = b.y,
			bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	}

	projectOnVector( vector: Vector3 ) {

		var scalar = vector.dot( this ) / vector.lengthSq();

		return this.copy( vector ).multiplyScalar( scalar );

	}

	projectOnPlane = ( () => {

		var v1 = new Vector3();

		const projectOnPlane = ( planeNormal: Vector3 ) => {

			v1.copy( this ).projectOnVector( planeNormal );

			return this.sub( v1 );

		};

		return projectOnPlane;

	} )();

	reflect = ( () => {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		var v1 = new Vector3();

		const reflect = ( normal: Vector3 ) => {

			return this.sub( v1.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

		};

		return reflect;

	} )();

	angleTo( v: Vector3 ) {

		var theta = this.dot( v ) / Math.sqrt( this.lengthSq() * v.lengthSq() );

		// clamp, to handle numerical problems

		return Math.acos( _Math.clamp( theta, - 1, 1 ) );

	}

	distanceTo( v: Vector3 ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	distanceToSquared( v: Vector3 ) {

		var dx = this.x - v.x,
			dy = this.y - v.y,
			dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;

	}

	manhattanDistanceTo( v: Vector3 ) {

		return (
			Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z )
		);

	}

	setFromSpherical( s: Spherical ) {

		return this.setFromSphericalCoords( s.radius, s.phi, s.theta );

	}

	setFromSphericalCoords( radius: number, phi: number, theta: number ) {

		var sinPhiRadius = Math.sin( phi ) * radius;

		this.x = sinPhiRadius * Math.sin( theta );
		this.y = Math.cos( phi ) * radius;
		this.z = sinPhiRadius * Math.cos( theta );

		return this;

	}

	setFromCylindrical( c: Cylindrical ) {

		return this.setFromCylindricalCoords( c.radius, c.theta, c.y );

	}

	setFromCylindricalCoords( radius: number, theta: number, y: number ) {

		this.x = radius * Math.sin( theta );
		this.y = y;
		this.z = radius * Math.cos( theta );

		return this;

	}

	setFromMatrixPosition( m: Matrix4 ) {

		var e = m.elements;

		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];

		return this;

	}

	setFromMatrixScale( m: Matrix4 ) {

		var sx = this.setFromMatrixColumn( m, 0 ).length();
		var sy = this.setFromMatrixColumn( m, 1 ).length();
		var sz = this.setFromMatrixColumn( m, 2 ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;

	}

	setFromMatrixColumn( m: Matrix4, index: number ) {

		return this.fromArray( m.elements, index * 4 );

	}

	equals( v: Vector3 ) {

		return v.x === this.x && v.y === this.y && v.z === this.z;

	}

	fromArray( array: number[], offset?: number ) {

		if ( offset === undefined ) offset = 0;

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	}

	toArray( array?: any[] | Float32Array, offset?: number ): number[] {

		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array as any;

	}

	fromBufferAttribute(
		attribute: BufferAttribute,
		index: number,
		offset?: never
	) {

		if ( offset !== undefined ) {

			console.warn(
				'THREE.Vector3: offset has been removed from .fromBufferAttribute().'
			);

		}

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );
		this.z = attribute.getZ( index );

		return this;

	}

}
