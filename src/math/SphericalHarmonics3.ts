import { Vector3 } from './Vector3';

type NineElementArray<T> = [T, T, T, T, T, T, T, T, T];

/**
 * @author bhouston / http://clara.io
 * @author WestLangley / http://github.com/WestLangley
 *
 * Primary reference:
 *   https://graphics.stanford.edu/papers/envmap/envmap.pdf
 *
 * Secondary reference:
 *   https://www.ppsloan.org/publications/StupidSH36.pdf
 */

// 3-band SH defined by 9 coefficients

class SphericalHarmonics3 {

	constructor() {

		this.coefficients = [] as any;

		for ( var i = 0; i < 9; i ++ ) {

			this.coefficients.push( new Vector3() );

		}

	}

	coefficients: NineElementArray<Vector3>;

	isSphericalHarmonics3 = true;

	set( coefficients: Vector3[] ) {

		for ( var i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].copy( coefficients[ i ] );

		}

		return this;

	}

	zero() {

		for ( var i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].set( 0, 0, 0 );

		}

		return this;

	}

	// get the radiance in the direction of the normal
	// target is a Vector3
	getAt( normal: Vector3, target: Vector3 ) {

		// normal is assumed to be unit length

		var x = normal.x,
			y = normal.y,
			z = normal.z;

		var coeff = this.coefficients;

		// band 0
		target = coeff[ 0 ] * 0.282095;

		// band 1
		target += coeff[ 1 ] * 0.488603 * y;
		target += coeff[ 2 ] * 0.488603 * z;
		target += coeff[ 3 ] * 0.488603 * x;

		// band 2
		target += coeff[ 4 ] * 1.092548 * ( x * y );
		target += coeff[ 5 ] * 1.092548 * ( y * z );
		target += coeff[ 6 ] * 0.315392 * ( 3.0 * z * z - 1.0 );
		target += coeff[ 7 ] * 1.092548 * ( x * z );
		target += coeff[ 8 ] * 0.546274 * ( x * x - y * y );

		return target;

	}

	// get the irradiance (radiance convolved with cosine lobe) in the direction of the normal
	// target is a Vector3
	// https://graphics.stanford.edu/papers/envmap/envmap.pdf
	getIrradianceAt( normal: Vector3, target: Vector3 ) {

		// normal is assumed to be unit length

		var x = normal.x,
			y = normal.y,
			z = normal.z;

		var coeff = this.coefficients;

		// band 0
		target = coeff[ 0 ] * 0.886227; // π * 0.282095

		// band 1
		target += coeff[ 1 ] * 2.0 * 0.511664 * y; // ( 2 * π / 3 ) * 0.488603
		target += coeff[ 2 ] * 2.0 * 0.511664 * z;
		target += coeff[ 3 ] * 2.0 * 0.511664 * x;

		// band 2
		target += coeff[ 4 ] * 2.0 * 0.429043 * x * y; // ( π / 4 ) * 1.092548
		target += coeff[ 5 ] * 2.0 * 0.429043 * y * z;
		target += coeff[ 6 ] * ( 0.743125 * z * z - 0.247708 ); // ( π / 4 ) * 0.315392 * 3
		target += coeff[ 7 ] * 2.0 * 0.429043 * x * z;
		target += coeff[ 8 ] * 0.429043 * ( x * x - y * y ); // ( π / 4 ) * 0.546274

		return target;

	}

	add( sh: SphericalHarmonics3 ) {

		for ( var i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].add( sh.coefficients[ i ] );

		}

		return this;

	}

	scale( s: number ) {

		for ( var i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].multiplyScalar( s );

		}

		return this;

	}

	lerp( sh: SphericalHarmonics3, alpha: number ) {

		for ( var i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].lerp( sh.coefficients[ i ], alpha );

		}

		return this;

	}

	equals( sh: SphericalHarmonics3 ) {

		for ( var i = 0; i < 9; i ++ ) {

			if ( ! this.coefficients[ i ].equals( sh.coefficients[ i ] ) ) {

				return false;

			}

		}

		return true;

	}

	copy( sh: SphericalHarmonics3 ) {

		return this.set( sh.coefficients );

	}

	clone() {

		return new SphericalHarmonics3().copy( this );

	}

	fromArray( array: number[] ) {

		var coefficients = this.coefficients;

		for ( var i = 0; i < 9; i ++ ) {

			coefficients[ i ].fromArray( array, i * 3 );

		}

		return this;

	}

	toArray() {

		var array: number[] = [];
		var coefficients = this.coefficients;

		for ( var i = 0; i < 9; i ++ ) {

			coefficients[ i ].toArray( array, i * 3 );

		}

		return array;

	}

	// evaluate the basis functions
	// shBasis is an Array[ 9 ]
	static getBasisAt( normal: Vector3, shBasis: NineElementArray<number> ) {

		// normal is assumed to be unit length

		var x = normal.x,
			y = normal.y,
			z = normal.z;

		// band 0
		shBasis[ 0 ] = 0.282095;

		// band 1
		shBasis[ 1 ] = 0.488603 * y;
		shBasis[ 2 ] = 0.488603 * z;
		shBasis[ 3 ] = 0.488603 * x;

		// band 2
		shBasis[ 4 ] = 1.092548 * x * y;
		shBasis[ 5 ] = 1.092548 * y * z;
		shBasis[ 6 ] = 0.315392 * ( 3 * z * z - 1 );
		shBasis[ 7 ] = 1.092548 * x * z;
		shBasis[ 8 ] = 0.546274 * ( x * x - y * y );

	}

}
