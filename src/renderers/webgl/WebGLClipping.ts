/**
 * @author tschw
 */

import { Matrix3 } from '../../math/Matrix3';
import { Plane } from '../../math/Plane';

interface Uniform {
	value: null | Float32Array;
	needsUpdate: boolean;
}

export class WebGLClipping {

	private globalState: Float32Array | null = null;
	private numGlobalPlanes = 0;
	private localClippingEnabled = false;
	private renderingShadows = false;

	private plane = new Plane();
	private viewNormalMatrix = new Matrix3();
	private uniform: Uniform = { value: null, needsUpdate: false };

	public numPlanes = 0;
	public numIntersection = 0;

	public init( planes: any[], enableLocalClipping: boolean, camera: any ) {

		var enabled =
			planes.length !== 0 ||
			enableLocalClipping ||
			// enable state of previous frame - the clipping code has to
			// run another frame in order to reset the state:
			this.numGlobalPlanes !== 0 ||
			this.localClippingEnabled;

		this.localClippingEnabled = enableLocalClipping;

		this.globalState = this.projectPlanes( planes, camera, 0 );
		this.numGlobalPlanes = planes.length;

		return enabled;

	}

	public beginShadows() {

		this.renderingShadows = true;
		this.projectPlanes( null );

	}

	public endShadows() {

		this.renderingShadows = false;
		this.resetGlobalState();

	}

	public setState(
		planes: any,
		clipIntersection: any,
		clipShadows: any,
		camera: any,
		cache: any,
		fromCache: any
	) {

		if (
			! this.localClippingEnabled ||
			planes === null ||
			planes.length === 0 ||
			( this.renderingShadows && ! clipShadows )
		) {

			// there's no local clipping

			if ( this.renderingShadows ) {

				// there's no global clipping

				this.projectPlanes( null );

			} else {

				this.resetGlobalState();

			}

		} else {

			var nGlobal = this.renderingShadows ? 0 : this.numGlobalPlanes,
				lGlobal = nGlobal * 4,
				dstArray = cache.clippingState || null;

			this.uniform.value = dstArray; // ensure unique state

			dstArray = this.projectPlanes( planes, camera, lGlobal, fromCache );

			for ( var i = 0; i !== lGlobal; ++ i ) {

				dstArray[ i ] = this.globalState![ i ];

			}

			cache.clippingState = dstArray;
			this.numIntersection = clipIntersection ? this.numPlanes : 0;
			this.numPlanes += nGlobal;

		}

	}

	private resetGlobalState() {

		if ( this.uniform.value !== this.globalState ) {

			this.uniform.value = this.globalState;
			this.uniform.needsUpdate = this.numGlobalPlanes > 0;

		}

		this.numPlanes = this.numGlobalPlanes;
		this.numIntersection = 0;

	}

	private projectPlanes(
		planes: any[] | null,
		camera?: any,
		dstOffset: number = 0,
		skipTransform?: any
	) {

		var nPlanes = planes !== null ? planes.length : 0,
			dstArray: Float32Array | null = null;

		if ( nPlanes !== 0 ) {

			dstArray = this.uniform.value;

			if ( skipTransform !== true || dstArray === null ) {

				var flatSize = dstOffset + nPlanes * 4,
					viewMatrix = camera.matrixWorldInverse;

				this.viewNormalMatrix.getNormalMatrix( viewMatrix );

				if ( dstArray === null || dstArray.length < flatSize ) {

					dstArray = new Float32Array( flatSize );

				}

				for ( var i = 0, i4 = dstOffset; i !== nPlanes; ++ i, i4 += 4 ) {

					this.plane
						.copy( planes![ i ] )
						.applyMatrix4( viewMatrix, this.viewNormalMatrix );

					this.plane.normal.toArray( dstArray, i4 );
					dstArray[ i4 + 3 ] = this.plane.constant;

				}

			}

			this.uniform.value = dstArray;
			this.uniform.needsUpdate = true;

		}

		this.numPlanes = nPlanes;

		return dstArray!;

	}

}
