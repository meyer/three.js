/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author WestLangley / http://github.com/WestLangley
 */

import { Matrix4 } from '../math/Matrix4';
import { Object3D } from '../core/Object3D';
import { Vector3 } from '../math/Vector3';

export abstract class Camera extends Object3D {

	constructor() {

		super();

		this.type = 'Camera';

		this.matrixWorldInverse = new Matrix4();

		this.projectionMatrix = new Matrix4();
		this.projectionMatrixInverse = new Matrix4();

	}

	type: string;

	matrixWorldInverse: Matrix4;
	projectionMatrix: Matrix4;
	projectionMatrixInverse: Matrix4;

	isCamera = true as const;

	copy<T extends any>( source: T, recursive?: boolean ): T {

		Object3D.prototype.copy.call( this, source as any, recursive );

		this.matrixWorldInverse.copy( source.matrixWorldInverse );

		this.projectionMatrix.copy( source.projectionMatrix );
		this.projectionMatrixInverse.copy( source.projectionMatrixInverse );

		return this as any;

	}

	getWorldDirection( target: Vector3 ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Camera: .getWorldDirection() target is now required' );
			target = new Vector3();

		}

		this.updateMatrixWorld( true );

		var e = this.matrixWorld.elements;

		return target.set( - e[ 8 ], - e[ 9 ], - e[ 10 ] ).normalize();

	}

	updateMatrixWorld( force?: boolean ) {

		Object3D.prototype.updateMatrixWorld.call( this, force );

		this.matrixWorldInverse.getInverse( this.matrixWorld );

	}

	clone() {

		return new ( this.constructor as any )().copy( this );

	}

}
