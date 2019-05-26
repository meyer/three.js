import { Box3 } from './Box3';
import { Vector3 } from './Vector3';
import { Matrix4 } from './Matrix4';
import { Plane } from './Plane';

/**
 * @author bhouston / http://clara.io
 * @author mrdoob / http://mrdoob.com/
 */

export class Sphere {

	constructor( center?: Vector3, radius?: number ) {

		this.center = center !== undefined ? center : new Vector3();
		this.radius = radius !== undefined ? radius : 0;

	}
	center: Vector3;
	radius: number;

	set( center: Vector3, radius: number ) {

		this.center.copy( center );
		this.radius = radius;

		return this;

	}

	setFromPoints = ( () => {

		var box = new Box3();

		const setFromPoints = ( points: Vector3[], optionalCenter?: Vector3 ) => {

			var center = this.center;

			if ( optionalCenter !== undefined ) {

				center.copy( optionalCenter );

			} else {

				box.setFromPoints( points ).getCenter( center );

			}

			var maxRadiusSq = 0;

			for ( var i = 0, il = points.length; i < il; i ++ ) {

				maxRadiusSq = Math.max(
					maxRadiusSq,
					center.distanceToSquared( points[ i ] )
				);

			}

			this.radius = Math.sqrt( maxRadiusSq );

			return this;

		};

		return setFromPoints;

	} )();

	clone() {

		return new Sphere().copy( this );

	}

	copy( sphere: Sphere ) {

		this.center.copy( sphere.center );
		this.radius = sphere.radius;

		return this;

	}

	empty() {

		return this.radius <= 0;

	}

	containsPoint( point: Vector3 ) {

		return point.distanceToSquared( this.center ) <= this.radius * this.radius;

	}

	distanceToPoint( point: Vector3 ) {

		return point.distanceTo( this.center ) - this.radius;

	}

	intersectsSphere( sphere: Sphere ) {

		var radiusSum = this.radius + sphere.radius;

		return (
			sphere.center.distanceToSquared( this.center ) <= radiusSum * radiusSum
		);

	}

	intersectsBox( box: Box3 ) {

		return box.intersectsSphere( this );

	}

	intersectsPlane( plane: Plane ) {

		return Math.abs( plane.distanceToPoint( this.center ) ) <= this.radius;

	}

	clampPoint( point: Vector3, target: Vector3 ) {

		var deltaLengthSq = this.center.distanceToSquared( point );

		if ( target === undefined ) {

			console.warn( 'THREE.Sphere: .clampPoint() target is now required' );
			target = new Vector3();

		}

		target.copy( point );

		if ( deltaLengthSq > this.radius * this.radius ) {

			target.sub( this.center ).normalize();
			target.multiplyScalar( this.radius ).add( this.center );

		}

		return target;

	}

	getBoundingBox( target: Box3 ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Sphere: .getBoundingBox() target is now required' );
			target = new Box3();

		}

		target.set( this.center, this.center );
		target.expandByScalar( this.radius );

		return target;

	}

	applyMatrix4( matrix: Matrix4 ) {

		this.center.applyMatrix4( matrix );
		this.radius = this.radius * matrix.getMaxScaleOnAxis();

		return this;

	}

	translate( offset: Vector3 ) {

		this.center.add( offset );

		return this;

	}

	equals( sphere: Sphere ) {

		return sphere.center.equals( this.center ) && sphere.radius === this.radius;

	}

}
