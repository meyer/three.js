/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Vector3 } from '../math/Vector3';
import { Quaternion } from '../math/Quaternion';
import { Clock } from '../core/Clock';
import { Object3D } from '../core/Object3D';
import { AudioContext as AudioContextObj } from './AudioContext';

export class AudioListener extends Object3D {

	constructor() {

		super();

		this.type = 'AudioListener';

		this.context = AudioContextObj.getContext();

		this.gain = this.context.createGain();
		this.gain.connect( this.context.destination );

		this.filter = null;

		this.timeDelta = 0;

	}

	context: AudioContext;
	gain: GainNode;
	filter: null | any;
	timeDelta: number;

	type = 'AudioListener' as const;

	getInput() {

		return this.gain;

	}

	removeFilter() {

		if ( this.filter !== null ) {

			this.gain.disconnect( this.filter );
			this.filter.disconnect( this.context.destination );
			this.gain.connect( this.context.destination );
			this.filter = null;

		}

		return this;

	}

	getFilter() {

		return this.filter;

	}

	setFilter( value ) {

		if ( this.filter !== null ) {

			this.gain.disconnect( this.filter );
			this.filter.disconnect( this.context.destination );

		} else {

			this.gain.disconnect( this.context.destination );

		}

		this.filter = value;
		this.gain.connect( this.filter );
		this.filter.connect( this.context.destination );

		return this;

	}

	getMasterVolume() {

		return this.gain.gain.value;

	}

	setMasterVolume( value: number ) {

		this.gain.gain.setTargetAtTime( value, this.context.currentTime, 0.01 );

		return this;

	}

	updateMatrixWorld = ( function () {

		var position = new Vector3();
		var quaternion = new Quaternion();
		var scale = new Vector3();

		var orientation = new Vector3();
		var clock = new Clock();

		return function updateMatrixWorld( force: boolean ) {

			Object3D.prototype.updateMatrixWorld.call( this, force );

			var listener = this.context.listener;
			var up = this.up;

			this.timeDelta = clock.getDelta();

			this.matrixWorld.decompose( position, quaternion, scale );

			orientation.set( 0, 0, - 1 ).applyQuaternion( quaternion );

			if ( listener.positionX ) {

				// code path for Chrome (see #14393)

				var endTime = this.context.currentTime + this.timeDelta;

				listener.positionX.linearRampToValueAtTime( position.x, endTime );
				listener.positionY.linearRampToValueAtTime( position.y, endTime );
				listener.positionZ.linearRampToValueAtTime( position.z, endTime );
				listener.forwardX.linearRampToValueAtTime( orientation.x, endTime );
				listener.forwardY.linearRampToValueAtTime( orientation.y, endTime );
				listener.forwardZ.linearRampToValueAtTime( orientation.z, endTime );
				listener.upX.linearRampToValueAtTime( up.x, endTime );
				listener.upY.linearRampToValueAtTime( up.y, endTime );
				listener.upZ.linearRampToValueAtTime( up.z, endTime );

			} else {

				listener.setPosition( position.x, position.y, position.z );
				listener.setOrientation(
					orientation.x,
					orientation.y,
					orientation.z,
					up.x,
					up.y,
					up.z
				);

			}

		};

	} )();

}
