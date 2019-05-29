import { Vector3 } from './Vector3';
import { Sphere } from './Sphere';
import { Plane } from './Plane';
import { Matrix4 } from './Matrix4';
import { Box3 } from './Box3';
import { Sprite } from '../objects/Sprite';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author bhouston / http://clara.io
 */

export class Frustum {

	constructor(
		p0?: Plane,
		p1?: Plane,
		p2?: Plane,
		p3?: Plane,
		p4?: Plane,
		p5?: Plane
	) {

		this.planes = [
			p0 !== undefined ? p0 : new Plane(),
			p1 !== undefined ? p1 : new Plane(),
			p2 !== undefined ? p2 : new Plane(),
			p3 !== undefined ? p3 : new Plane(),
			p4 !== undefined ? p4 : new Plane(),
			p5 !== undefined ? p5 : new Plane(),
		];

	}
	planes: [Plane, Plane, Plane, Plane, Plane, Plane];

	set( p0: Plane, p1: Plane, p2: Plane, p3: Plane, p4: Plane, p5: Plane ) {

		var planes = this.planes;

		planes[ 0 ].copy( p0 );
		planes[ 1 ].copy( p1 );
		planes[ 2 ].copy( p2 );
		planes[ 3 ].copy( p3 );
		planes[ 4 ].copy( p4 );
		planes[ 5 ].copy( p5 );

		return this;

	}

	clone() {

		return new Frustum().copy( this );

	}

	copy( frustum: Frustum ) {

		var planes = this.planes;

		for ( var i = 0; i < 6; i ++ ) {

			planes[ i ].copy( frustum.planes[ i ] );

		}

		return this;

	}

	setFromMatrix( m: Matrix4 ) {

		var planes = this.planes;
		var me = m.elements;
		var me0 = me[ 0 ],
			me1 = me[ 1 ],
			me2 = me[ 2 ],
			me3 = me[ 3 ];
		var me4 = me[ 4 ],
			me5 = me[ 5 ],
			me6 = me[ 6 ],
			me7 = me[ 7 ];
		var me8 = me[ 8 ],
			me9 = me[ 9 ],
			me10 = me[ 10 ],
			me11 = me[ 11 ];
		var me12 = me[ 12 ],
			me13 = me[ 13 ],
			me14 = me[ 14 ],
			me15 = me[ 15 ];

		planes[ 0 ]
			.setComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12 )
			.normalize();
		planes[ 1 ]
			.setComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12 )
			.normalize();
		planes[ 2 ]
			.setComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13 )
			.normalize();
		planes[ 3 ]
			.setComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13 )
			.normalize();
		planes[ 4 ]
			.setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 )
			.normalize();
		planes[ 5 ]
			.setComponents( me3 + me2, me7 + me6, me11 + me10, me15 + me14 )
			.normalize();

		return this;

	}

	intersectsObject = ( () => {

		var sphere = new Sphere();

		// TODO(meyer) union of Object3D subtypes
		const intersectsObject = ( object: any ) => {

			var geometry = object.geometry;

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			sphere.copy( geometry.boundingSphere ).applyMatrix4( object.matrixWorld );

			return this.intersectsSphere( sphere );

		};

		return intersectsObject;

	} )();

	intersectsSprite = ( () => {

		var sphere = new Sphere();

		const intersectsSprite = ( sprite: Sprite ) => {

			sphere.center.set( 0, 0, 0 );
			sphere.radius = 0.7071067811865476;
			sphere.applyMatrix4( sprite.matrixWorld );

			return this.intersectsSphere( sphere );

		};

		return intersectsSprite;

	} )();

	intersectsSphere( sphere: Sphere ) {

		var planes = this.planes;
		var center = sphere.center;
		var negRadius = - sphere.radius;

		for ( var i = 0; i < 6; i ++ ) {

			var distance = planes[ i ].distanceToPoint( center );

			if ( distance < negRadius ) {

				return false;

			}

		}

		return true;

	}

	intersectsBox = ( () => {

		var p = new Vector3();

		const intersectsBox = ( box: Box3 ) => {

			var planes = this.planes;

			for ( var i = 0; i < 6; i ++ ) {

				var plane = planes[ i ];

				// corner at max distance

				p.x = plane.normal.x > 0 ? box.max.x : box.min.x;
				p.y = plane.normal.y > 0 ? box.max.y : box.min.y;
				p.z = plane.normal.z > 0 ? box.max.z : box.min.z;

				if ( plane.distanceToPoint( p ) < 0 ) {

					return false;

				}

			}

			return true;

		};

		return intersectsBox;

	} )();

	containsPoint( point: Vector3 ) {

		var planes = this.planes;

		for ( var i = 0; i < 6; i ++ ) {

			if ( planes[ i ].distanceToPoint( point ) < 0 ) {

				return false;

			}

		}

		return true;

	}

}
