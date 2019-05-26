/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Group } from '../../objects/Group';
import { Matrix4 } from '../../math/Matrix4';
import { Vector2 } from '../../math/Vector2';
import { Vector3 } from '../../math/Vector3';
import { Vector4 } from '../../math/Vector4';
import { Quaternion } from '../../math/Quaternion';
import { ArrayCamera } from '../../cameras/ArrayCamera';
import { PerspectiveCamera } from '../../cameras/PerspectiveCamera';
import { WebGLAnimation } from '../webgl/WebGLAnimation';
import { setProjectionFromUnion } from './WebVRUtils';

interface PerspectiveCameraWithViewport extends PerspectiveCamera {
	viewport: Vector4;
}

export class WebVRManager {

	renderWidth: number | undefined;
	renderHeight: number | undefined;

	device: any = null;
	frameData: any = null;

	poseTarget: any = null;

	controllers: any[] = [];
	standingMatrix = new Matrix4();
	standingMatrixInverse = new Matrix4();

	framebufferScaleFactor = 1.0;

	frameOfReferenceType = 'stage';

	cameraR: PerspectiveCameraWithViewport;
	cameraL: PerspectiveCameraWithViewport;
	cameraVR: ArrayCamera<PerspectiveCameraWithViewport>;

	currentSize: Vector2;
	currentPixelRatio: number = 1;
	triggers: boolean[] = [];
	enabled = false;
	renderer: any;

	matrixWorldInverse = new Matrix4();
	private tempQuaternion = new Quaternion();
	private tempPosition = new Vector3();

	constructor( renderer: any ) {

		if ( typeof window !== 'undefined' && 'VRFrameData' in window ) {

			this.frameData = new window.VRFrameData();
			window.addEventListener(
				'vrdisplaypresentchange',
				onVRDisplayPresentChange,
				false
			);

		}

		this.renderer = renderer;

		this.cameraL = new PerspectiveCamera() as PerspectiveCameraWithViewport;
		this.cameraL.viewport = new Vector4();
		this.cameraL.layers.enable( 1 );

		this.cameraR = new PerspectiveCamera() as PerspectiveCameraWithViewport;
		this.cameraR.viewport = new Vector4();
		this.cameraR.layers.enable( 2 );

		this.cameraVR = new ArrayCamera( [ this.cameraL, this.cameraR ] );
		this.cameraVR.layers.enable( 1 );
		this.cameraVR.layers.enable( 2 );

		this.currentSize = new Vector2();

	}

	isPresenting() {

		return this.device !== null && this.device.isPresenting === true;

	}

	onVRDisplayPresentChange() {

		if ( this.isPresenting() ) {

			var eyeParameters = this.device.getEyeParameters( 'left' );
			this.renderWidth =
				eyeParameters.this.renderWidth * this.framebufferScaleFactor;
			this.renderHeight =
				eyeParameters.renderHeight * this.framebufferScaleFactor;

			this.currentPixelRatio = renderer.getPixelRatio();
			this.renderer.getSize( this.currentSize );

			this.renderer.setDrawingBufferSize(
				this.renderWidth * 2,
				this.renderHeight,
				1
			);

			this.cameraL.viewport.set( 0, 0, this.renderWidth, this.renderHeight );
			this.cameraR.viewport.set(
				this.renderWidth,
				0,
				this.renderWidth,
				this.renderHeight
			);

			this.animation.start();

		} else {

			if ( this.enabled ) {

				this.renderer.setDrawingBufferSize(
					this.currentSize.width,
					this.currentSize.height,
					this.currentPixelRatio
				);

			}

			this.animation.stop();

		}

	}

	findGamepad( id: number ) {

		var gamepads = navigator.getGamepads && navigator.getGamepads();

		for ( var i = 0, j = 0, l = gamepads.length; i < l; i ++ ) {

			var gamepad = gamepads[ i ];

			if (
				gamepad &&
				( gamepad.id === 'Daydream Controller' ||
					gamepad.id === 'Gear VR Controller' ||
					gamepad.id === 'Oculus Go Controller' ||
					gamepad.id === 'OpenVR Gamepad' ||
					gamepad.id.startsWith( 'Oculus Touch' ) ||
					gamepad.id.startsWith( 'Spatial Controller' ) )
			) {

				if ( j === id ) return gamepad;

				j ++;

			}

		}

	}

	updateControllers() {

		for ( var i = 0; i < this.controllers.length; i ++ ) {

			var controller = this.controllers[ i ];

			var gamepad = this.findGamepad( i );

			if ( gamepad !== undefined && gamepad.pose !== undefined ) {

				if ( gamepad.pose === null ) return;

				// Pose

				var pose = gamepad.pose;

				if ( pose.hasPosition === false )
					controller.position.set( 0.2, - 0.6, - 0.05 );

				if ( pose.position !== null )
					controller.position.fromArray( pose.position );
				if ( pose.orientation !== null )
					controller.quaternion.fromArray( pose.orientation );
				controller.matrix.compose(
					controller.position,
					controller.quaternion,
					controller.scale
				);
				controller.matrix.premultiply( standingMatrix );
				controller.matrix.decompose(
					controller.position,
					controller.quaternion,
					controller.scale
				);
				controller.matrixWorldNeedsUpdate = true;
				controller.visible = true;

				// Trigger

				var buttonId = gamepad.id === 'Daydream Controller' ? 0 : 1;

				if ( this.triggers[ i ] === undefined ) this.triggers[ i ] = false;

				if ( this.triggers[ i ] !== gamepad.buttons[ buttonId ].pressed ) {

					this.triggers[ i ] = gamepad.buttons[ buttonId ].pressed;

					if ( this.triggers[ i ] === true ) {

						controller.dispatchEvent( { type: 'selectstart' } );

					} else {

						controller.dispatchEvent( { type: 'selectend' } );
						controller.dispatchEvent( { type: 'select' } );

					}

				}

			} else {

				controller.visible = false;

			}

		}

	}

	updateViewportFromBounds( viewport: Vector4, bounds: number[] ) {

		if ( bounds !== null && bounds.length === 4 ) {

			viewport.set(
				bounds[ 0 ] * this.renderWidth,
				bounds[ 1 ] * this.renderHeight,
				bounds[ 2 ] * this.renderWidth,
				bounds[ 3 ] * this.renderHeight
			);

		}

	}

	getController( id: number ) {

		var controller = this.controllers[ id ];

		if ( controller === undefined ) {

			controller = new Group();
			controller.matrixAutoUpdate = false;
			controller.visible = false;

			this.controllers[ id ] = controller;

		}

		return controller;

	}

	getDevice = function () {

		return this.device;

	};

	setDevice( value?: any ) {

		if ( value !== undefined ) device = value;

		this.animation.setContext( value );

	}

	setFramebufferScaleFactor( value: number ) {

		this.framebufferScaleFactor = value;

	}

	setFrameOfReferenceType( value: string ) {

		this.frameOfReferenceType = value;

	}

	setPoseTarget( object?: Vector4 ) {

		if ( object !== undefined ) this.poseTarget = object;

	}

	getCamera<T extends PerspectiveCamera>( camera: T ) {

		var userHeight = this.frameOfReferenceType === 'stage' ? 1.6 : 0;

		if ( isPresenting() === false ) {

			camera.position.set( 0, userHeight, 0 );
			camera.rotation.set( 0, 0, 0 );

			return camera;

		}

		this.device.depthNear = camera.near;
		this.device.depthFar = camera.far;

		this.device.getFrameData( frameData );

		//

		if ( this.frameOfReferenceType === 'stage' ) {

			var stageParameters = this.device.stageParameters;

			if ( stageParameters ) {

				this.standingMatrix.fromArray(
					stageParameters.sittingToStandingTransform
				);

			} else {

				this.standingMatrix.makeTranslation( 0, userHeight, 0 );

			}

		}

		const pose = this.frameData.pose;
		const poseObject = this.poseTarget !== null ? this.poseTarget : camera;

		// We want to manipulate poseObject by its position and quaternion components since users may rely on them.
		poseObject.matrix.copy( standingMatrix );
		poseObject.matrix.decompose(
			poseObject.position,
			poseObject.quaternion,
			poseObject.scale
		);

		if ( pose.orientation !== null ) {

			this.tempQuaternion.fromArray( pose.orientation );
			poseObject.quaternion.multiply( tempQuaternion );

		}

		if ( pose.position !== null ) {

			this.tempQuaternion.setFromRotationMatrix( standingMatrix );
			this.tempPosition.fromArray( pose.position );
			this.tempPosition.applyQuaternion( this.tempQuaternion );
			poseObject.position.add( this.tempPosition );

		}

		poseObject.updateMatrixWorld();

		//

		this.cameraL.near = camera.near;
		this.cameraR.near = camera.near;

		this.cameraL.far = camera.far;
		this.cameraR.far = camera.far;

		this.cameraL.matrixWorldInverse.fromArray( this.frameData.leftViewMatrix );
		this.cameraR.matrixWorldInverse.fromArray( this.frameData.rightViewMatrix );

		// TODO (mrdoob) Double check this code

		this.standingMatrixInverse.getInverse( standingMatrix );

		if ( this.frameOfReferenceType === 'stage' ) {

			this.cameraL.matrixWorldInverse.multiply( this.standingMatrixInverse );
			this.cameraR.matrixWorldInverse.multiply( this.standingMatrixInverse );

		}

		var parent = poseObject.parent;

		if ( parent !== null ) {

			this.matrixWorldInverse.getInverse( parent.matrixWorld );

			this.cameraL.matrixWorldInverse.multiply( this.matrixWorldInverse );
			this.cameraR.matrixWorldInverse.multiply( this.matrixWorldInverse );

		}

		// envMap and Mirror needs camera.matrixWorld

		this.cameraL.matrixWorld.getInverse( this.cameraL.matrixWorldInverse );
		this.cameraR.matrixWorld.getInverse( this.cameraR.matrixWorldInverse );

		this.cameraL.projectionMatrix.fromArray(
			this.frameData.leftProjectionMatrix
		);
		this.cameraR.projectionMatrix.fromArray(
			this.frameData.rightProjectionMatrix
		);

		setProjectionFromUnion( this.cameraVR, this.cameraL, this.cameraR );

		//

		var layers = this.device.getLayers();

		if ( layers.length ) {

			var layer = layers[ 0 ];

			this.updateViewportFromBounds( this.cameraL.viewport, layer.leftBounds );
			this.updateViewportFromBounds( this.cameraR.viewport, layer.rightBounds );

		}

		this.updateControllers();

		return this.cameraVR;

	}

	getStandingMatrix() {

		return this.standingMatrix;

	}

	// Animation Loop

	animation = new WebGLAnimation();

	setAnimationLoop( callback: ( time: number ) => void ) {

		this.animation.setAnimationLoop( callback );

		if ( this.isPresenting() ) this.animation.start();

	}

	submitFrame() {

		if ( this.isPresenting() ) this.device.submitFrame();

	}

	dispose() {

		if ( typeof window !== 'undefined' ) {

			window.removeEventListener(
				'vrdisplaypresentchange',
				this.onVRDisplayPresentChange
			);

		}

	}

}
