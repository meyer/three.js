/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Vector3 } from '../math/Vector3';
import { Quaternion } from '../math/Quaternion';
import { Audio } from './Audio';
import { Object3D } from '../core/Object3D';
import { AudioListener as ThreeAudioListener } from './AudioListener';

export class PositionalAudio extends Audio {

	constructor( listener: ThreeAudioListener ) {

		super( listener );

		this.panner = this.context.createPanner();
		this.panner.panningModel = 'HRTF';
		this.panner.connect( this.gain );

	}

	panner: PannerNode;

	getOutput() {

		return this.panner;

	}

	getRefDistance() {

		return this.panner.refDistance;

	}

	setRefDistance( value ) {

		this.panner.refDistance = value;

		return this;

	}

	getRolloffFactor() {

		return this.panner.rolloffFactor;

	}

	setRolloffFactor( value ) {

		this.panner.rolloffFactor = value;

		return this;

	}

	getDistanceModel() {

		return this.panner.distanceModel;

	}

	setDistanceModel( value ) {

		this.panner.distanceModel = value;

		return this;

	}

	getMaxDistance() {

		return this.panner.maxDistance;

	}

	setMaxDistance( value ) {

		this.panner.maxDistance = value;

		return this;

	}

	setDirectionalCone( coneInnerAngle, coneOuterAngle, coneOuterGain ) {

		this.panner.coneInnerAngle = coneInnerAngle;
		this.panner.coneOuterAngle = coneOuterAngle;
		this.panner.coneOuterGain = coneOuterGain;

		return this;

	}

	updateMatrixWorld = ( function () {

		var position = new Vector3();
		var quaternion = new Quaternion();
		var scale = new Vector3();

		var orientation = new Vector3();

		return function updateMatrixWorld( force ) {

			Object3D.prototype.updateMatrixWorld.call( this, force );

			if ( this.hasPlaybackControl === true && this.isPlaying === false ) return;

			this.matrixWorld.decompose( position, quaternion, scale );

			orientation.set( 0, 0, 1 ).applyQuaternion( quaternion );

			var panner = this.panner;

			if ( panner.positionX ) {

				// code path for Chrome and Firefox (see #14393)

				var endTime = this.context.currentTime + this.listener.timeDelta;

				panner.positionX.linearRampToValueAtTime( position.x, endTime );
				panner.positionY.linearRampToValueAtTime( position.y, endTime );
				panner.positionZ.linearRampToValueAtTime( position.z, endTime );
				panner.orientationX.linearRampToValueAtTime( orientation.x, endTime );
				panner.orientationY.linearRampToValueAtTime( orientation.y, endTime );
				panner.orientationZ.linearRampToValueAtTime( orientation.z, endTime );

			} else {

				panner.setPosition( position.x, position.y, position.z );
				panner.setOrientation( orientation.x, orientation.y, orientation.z );

			}

		};

	} )();

}
