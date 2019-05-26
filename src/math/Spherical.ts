import { _Math } from './Math';
import { Vector3 } from './Vector3';

/**
 * @author bhouston / http://clara.io
 * @author WestLangley / http://github.com/WestLangley
 *
 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *
 * The polar angle (phi) is measured from the positive y-axis. The positive y-axis is up.
 * The azimuthal angle (theta) is measured from the positive z-axiz.
 */

export class Spherical {

	constructor( radius?: number, phi?: number, theta?: number ) {

		this.radius = radius !== undefined ? radius : 1.0;
		this.phi = phi !== undefined ? phi : 0; // polar angle
		this.theta = theta !== undefined ? theta : 0; // azimuthal angle

		return this;

	}

	radius: number;
	phi: number;
	theta: number;

	set( radius: number, phi: number, theta: number ) {

		this.radius = radius;
		this.phi = phi;
		this.theta = theta;

		return this;

	}

	clone(): Spherical {

		return new ( this as any ).constructor().copy( this );

	}

	copy( other: Spherical ): Spherical {

		this.radius = other.radius;
		this.phi = other.phi;
		this.theta = other.theta;

		return this;

	}

	// restrict phi to be betwee EPS and PI-EPS
	makeSafe() {

		var EPS = 0.000001;
		this.phi = Math.max( EPS, Math.min( Math.PI - EPS, this.phi ) );

		return this;

	}

	setFromVector3( v: Vector3 ) {

		return this.setFromCartesianCoords( v.x, v.y, v.z );

	}

	setFromCartesianCoords( x: number, y: number, z: number ) {

		this.radius = Math.sqrt( x * x + y * y + z * z );

		if ( this.radius === 0 ) {

			this.theta = 0;
			this.phi = 0;

		} else {

			this.theta = Math.atan2( x, z );
			this.phi = Math.acos( _Math.clamp( y / this.radius, - 1, 1 ) );

		}

		return this;

	}

}
