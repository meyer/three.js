import { Vector3 } from './Vector3';
import { _Math } from './Math';
import { Matrix4 } from './Matrix4';

/**
 * @author bhouston / http://clara.io
 */

export class Line3 {

	constructor( start?: Vector3, end?: Vector3 ) {

		this.start = start !== undefined ? start : new Vector3();
		this.end = end !== undefined ? end : new Vector3();

	}

	start: Vector3;

	end: Vector3;

	set( start: Vector3, end: Vector3 ) {

		this.start.copy( start );
		this.end.copy( end );

		return this;

	}

	clone() {

		return new Line3().copy( this );

	}

	copy( line: Line3 ) {

		this.start.copy( line.start );
		this.end.copy( line.end );

		return this;

	}

	getCenter( target?: Vector3 ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Line3: .getCenter() target is now required' );
			target = new Vector3();

		}

		return target.addVectors( this.start, this.end ).multiplyScalar( 0.5 );

	}

	delta( target: Vector3 ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Line3: .delta() target is now required' );
			target = new Vector3();

		}

		return target.subVectors( this.end, this.start );

	}

	distanceSq() {

		return this.start.distanceToSquared( this.end );

	}

	distance() {

		return this.start.distanceTo( this.end );

	}

	at( t: number, target: Vector3 ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Line3: .at() target is now required' );
			target = new Vector3();

		}

		return this.delta( target )
			.multiplyScalar( t )
			.add( this.start );

	}

	closestPointToPointParameter = ( () => {

		var startP = new Vector3();
		var startEnd = new Vector3();

		const closestPointToPointParameter = (
			point: Vector3,
			clampToLine?: boolean
		) => {

			startP.subVectors( point, this.start );
			startEnd.subVectors( this.end, this.start );

			var startEnd2 = startEnd.dot( startEnd );
			var startEnd_startP = startEnd.dot( startP );

			var t = startEnd_startP / startEnd2;

			if ( clampToLine ) {

				t = _Math.clamp( t, 0, 1 );

			}

			return t;

		};

		return closestPointToPointParameter;

	} )();

	closestPointToPoint( point: Vector3, clampToLine: boolean, target: Vector3 ) {

		var t = this.closestPointToPointParameter( point, clampToLine );

		if ( target === undefined ) {

			console.warn(
				'THREE.Line3: .closestPointToPoint() target is now required'
			);
			target = new Vector3();

		}

		return this.delta( target )
			.multiplyScalar( t )
			.add( this.start );

	}

	applyMatrix4( matrix: Matrix4 ) {

		this.start.applyMatrix4( matrix );
		this.end.applyMatrix4( matrix );

		return this;

	}

	equals( line: Line3 ) {

		return line.start.equals( this.start ) && line.end.equals( this.end );

	}

}
