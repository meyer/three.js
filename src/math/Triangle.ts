import { Vector3 } from './Vector3';
import { Box3 } from './Box3';

/**
 * @author bhouston / http://clara.io
 * @author mrdoob / http://mrdoob.com/
 */

export class Triangle {

	constructor( a?: Vector3, b?: Vector3, c?: Vector3 ) {

		this.a = a !== undefined ? a : new Vector3();
		this.b = b !== undefined ? b : new Vector3();
		this.c = c !== undefined ? c : new Vector3();

	}

	a: Vector3;
	b: Vector3;
	c: Vector3;

	static getNormal = ( function () {

		var v0 = new Vector3();

		return function getNormal(
			a: Vector3,
			b: Vector3,
			c: Vector3,
			target: Vector3
		) {

			if ( target === undefined ) {

				console.warn( 'THREE.Triangle: .getNormal() target is now required' );
				target = new Vector3();

			}

			target.subVectors( c, b );
			v0.subVectors( a, b );
			target.cross( v0 );

			var targetLengthSq = target.lengthSq();
			if ( targetLengthSq > 0 ) {

				return target.multiplyScalar( 1 / Math.sqrt( targetLengthSq ) );

			}

			return target.set( 0, 0, 0 );

		};

	} )();

	// static/instance method to calculate barycentric coordinates
	// based on: http://www.blackpawn.com/texts/pointinpoly/default.html
	static getBarycoord = ( function () {

		var v0 = new Vector3();
		var v1 = new Vector3();
		var v2 = new Vector3();

		return function getBarycoord(
			point: Vector3,
			a: Vector3,
			b: Vector3,
			c: Vector3,
			target: Vector3
		) {

			v0.subVectors( c, a );
			v1.subVectors( b, a );
			v2.subVectors( point, a );

			var dot00 = v0.dot( v0 );
			var dot01 = v0.dot( v1 );
			var dot02 = v0.dot( v2 );
			var dot11 = v1.dot( v1 );
			var dot12 = v1.dot( v2 );

			var denom = dot00 * dot11 - dot01 * dot01;

			if ( target === undefined ) {

				console.warn( 'THREE.Triangle: .getBarycoord() target is now required' );
				target = new Vector3();

			}

			// collinear or singular triangle
			if ( denom === 0 ) {

				// arbitrary location outside of triangle?
				// not sure if this is the best idea, maybe should be returning undefined
				return target.set( - 2, - 1, - 1 );

			}

			var invDenom = 1 / denom;
			var u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
			var v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

			// barycentric coordinates must always sum to 1
			return target.set( 1 - u - v, v, u );

		};

	} )();

	static containsPoint = ( function () {

		var v1 = new Vector3();

		return function containsPoint(
			point: Vector3,
			a: Vector3,
			b: Vector3,
			c: Vector3
		) {

			Triangle.getBarycoord( point, a, b, c, v1 );

			return v1.x >= 0 && v1.y >= 0 && v1.x + v1.y <= 1;

		};

	} )();

	static getUV = ( () => {

		var barycoord = new Vector3();

		const getUV = (
			point: Vector3,
			p1: Vector3,
			p2: Vector3,
			p3: Vector3,
			uv1: Vector3,
			uv2: Vector3,
			uv3: Vector3,
			target: Vector3
		) => {

			Triangle.getBarycoord( point, p1, p2, p3, barycoord );

			// TODO(meyer) missing Z a bug?
			target.set( 0, 0, 0 );
			target.addScaledVector( uv1, barycoord.x );
			target.addScaledVector( uv2, barycoord.y );
			target.addScaledVector( uv3, barycoord.z );

			return target;

		};

		return getUV;

	} )();

	set( a: Vector3, b: Vector3, c: Vector3 ) {

		this.a.copy( a );
		this.b.copy( b );
		this.c.copy( c );

		return this;

	}

	setFromPointsAndIndices(
		points: Vector3[],
		i0: number,
		i1: number,
		i2: number
	) {

		this.a.copy( points[ i0 ] );
		this.b.copy( points[ i1 ] );
		this.c.copy( points[ i2 ] );

		return this;

	}

	clone() {

		return new Triangle().copy( this );

	}

	copy( triangle: Triangle ) {

		this.a.copy( triangle.a );
		this.b.copy( triangle.b );
		this.c.copy( triangle.c );

		return this;

	}

	getArea = ( () => {

		var v0 = new Vector3();
		var v1 = new Vector3();

		const getArea = () => {

			v0.subVectors( this.c, this.b );
			v1.subVectors( this.a, this.b );

			return v0.cross( v1 ).length() * 0.5;

		};

		return getArea;

	} )();

	getMidpoint( target: Vector3 ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Triangle: .getMidpoint() target is now required' );
			target = new Vector3();

		}

		return target
			.addVectors( this.a, this.b )
			.add( this.c )
			.multiplyScalar( 1 / 3 );

	}

	getNormal( target: Vector3 ) {

		return Triangle.getNormal( this.a, this.b, this.c, target );

	}

	getPlane( target: Vector3 ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Triangle: .getPlane() target is now required' );
			target = new Vector3();

		}

		// TODO(meyer) target should be a plane?
		return target.setFromCoplanarPoints( this.a, this.b, this.c );

	}

	getBarycoord( point: Vector3, target: Vector3 ) {

		return Triangle.getBarycoord( point, this.a, this.b, this.c, target );

	}

	containsPoint( point: Vector3 ) {

		return Triangle.containsPoint( point, this.a, this.b, this.c );

	}

	getUV(
		point: Vector3,
		uv1: Vector3,
		uv2: Vector3,
		uv3: Vector3,
		result: Vector3
	) {

		return Triangle.getUV( point, this.a, this.b, this.c, uv1, uv2, uv3, result );

	}

	intersectsBox( box: Box3 ) {

		return box.intersectsTriangle( this );

	}

	closestPointToPoint = ( () => {

		var vab = new Vector3();
		var vac = new Vector3();
		var vbc = new Vector3();
		var vap = new Vector3();
		var vbp = new Vector3();
		var vcp = new Vector3();

		const closestPointToPoint = ( p: Vector3, target: Vector3 ) => {

			if ( target === undefined ) {

				console.warn(
					'THREE.Triangle: .closestPointToPoint() target is now required'
				);
				target = new Vector3();

			}

			var a = this.a,
				b = this.b,
				c = this.c;
			var v, w;

			// algorithm thanks to Real-Time Collision Detection by Christer Ericson,
			// published by Morgan Kaufmann Publishers, (c) 2005 Elsevier Inc.,
			// under the accompanying license; see chapter 5.1.5 for detailed explanation.
			// basically, we're distinguishing which of the voronoi regions of the triangle
			// the point lies in with the minimum amount of redundant computation.

			vab.subVectors( b, a );
			vac.subVectors( c, a );
			vap.subVectors( p, a );
			var d1 = vab.dot( vap );
			var d2 = vac.dot( vap );
			if ( d1 <= 0 && d2 <= 0 ) {

				// vertex region of A; barycentric coords (1, 0, 0)
				return target.copy( a );

			}

			vbp.subVectors( p, b );
			var d3 = vab.dot( vbp );
			var d4 = vac.dot( vbp );
			if ( d3 >= 0 && d4 <= d3 ) {

				// vertex region of B; barycentric coords (0, 1, 0)
				return target.copy( b );

			}

			var vc = d1 * d4 - d3 * d2;
			if ( vc <= 0 && d1 >= 0 && d3 <= 0 ) {

				v = d1 / ( d1 - d3 );
				// edge region of AB; barycentric coords (1-v, v, 0)
				return target.copy( a ).addScaledVector( vab, v );

			}

			vcp.subVectors( p, c );
			var d5 = vab.dot( vcp );
			var d6 = vac.dot( vcp );
			if ( d6 >= 0 && d5 <= d6 ) {

				// vertex region of C; barycentric coords (0, 0, 1)
				return target.copy( c );

			}

			var vb = d5 * d2 - d1 * d6;
			if ( vb <= 0 && d2 >= 0 && d6 <= 0 ) {

				w = d2 / ( d2 - d6 );
				// edge region of AC; barycentric coords (1-w, 0, w)
				return target.copy( a ).addScaledVector( vac, w );

			}

			var va = d3 * d6 - d5 * d4;
			if ( va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0 ) {

				vbc.subVectors( c, b );
				w = ( d4 - d3 ) / ( d4 - d3 + ( d5 - d6 ) );
				// edge region of BC; barycentric coords (0, 1-w, w)
				return target.copy( b ).addScaledVector( vbc, w ); // edge region of BC

			}

			// face region
			var denom = 1 / ( va + vb + vc );
			// u = va * denom
			v = vb * denom;
			w = vc * denom;
			return target
				.copy( a )
				.addScaledVector( vab, v )
				.addScaledVector( vac, w );

		};

		return closestPointToPoint;

	} )();

	equals( triangle: Triangle ) {

		return (
			triangle.a.equals( this.a ) &&
			triangle.b.equals( this.b ) &&
			triangle.c.equals( this.c )
		);

	}

}
