/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Group } from '../../objects/Group';
import { Matrix4 } from '../../math/Matrix4';
import { Vector4 } from '../../math/Vector4';
import { ArrayCamera } from '../../cameras/ArrayCamera';
import { PerspectiveCamera } from '../../cameras/PerspectiveCamera';
import { WebGLAnimation } from '../webgl/WebGLAnimation';
import { setProjectionFromUnion } from './WebVRUtils';
import { WebGLRenderer } from '../WebGLRenderer';
import { Camera } from '../../cameras/Camera';
import { Object3D } from '../../core/Object3D';

interface PerspectiveCameraWithViewport extends PerspectiveCamera {
	viewport: Vector4;
}

export class WebXRManager {

	constructor( renderer: WebGLRenderer ) {

		this.renderer = renderer;
		this.gl = renderer.context;

		this.cameraL = new PerspectiveCamera() as PerspectiveCameraWithViewport;
		this.cameraL.layers.enable( 1 );
		this.cameraL.viewport = new Vector4();

		this.cameraR = new PerspectiveCamera() as PerspectiveCameraWithViewport;
		this.cameraR.layers.enable( 2 );
		this.cameraR.viewport = new Vector4();

		this.cameraVR = new ArrayCamera( [ this.cameraL, this.cameraR ] );
		this.cameraVR.layers.enable( 1 );
		this.cameraVR.layers.enable( 2 );

	}

	private renderer: WebGLRenderer;
	gl: WebGLRenderingContext | WebGL2RenderingContext;

	cameraR: PerspectiveCameraWithViewport;
	cameraL: PerspectiveCameraWithViewport;
	cameraVR: ArrayCamera<PerspectiveCameraWithViewport>;

	device: any = null;
	session: any = null;

	framebufferScaleFactor: number = 1.0;

	frameOfReference: any = null;
	frameOfReferenceType: string = 'stage';

	pose: any = null;

	controllers: Group[] = [];
	inputSources: any[] = [];

	enabled = false;

	animation = new WebGLAnimation();

	isPresenting() {

		return this.session !== null && this.frameOfReference !== null;

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

	getDevice() {

		return this.device;

	}

	setDevice( value: any ) {

		if ( value !== undefined ) this.device = value;
		if ( value instanceof XRDevice )
			( this.gl as any ).setCompatibleXRDevice( value );

	}

	onSessionEvent( event: any ) {

		var controller = this.controllers[
			this.inputSources.indexOf( event.inputSource )
		];
		if ( controller ) controller.dispatchEvent( { type: event.type } );

	}

	onSessionEnd() {

		this.renderer.setFramebuffer( null );
		this.renderer.setRenderTarget( this.renderer.getRenderTarget() ); // Hack #15830
		this.animation.stop();

	}

	public setFramebufferScaleFactor( value: number ) {

		this.framebufferScaleFactor = value;

	}

	setFrameOfReferenceType( value: string ) {

		this.frameOfReferenceType = value;

	}

	setSession( value: any ) {

		this.session = value;

		if ( this.session !== null ) {

			this.session.addEventListener( 'select', this.onSessionEvent );
			this.session.addEventListener( 'selectstart', this.onSessionEvent );
			this.session.addEventListener( 'selectend', this.onSessionEvent );
			this.session.addEventListener( 'end', this.onSessionEnd );

			this.session.baseLayer = new XRWebGLLayer( this.session, this.gl, {
				framebufferScaleFactor: this.framebufferScaleFactor,
			} );
			this.session
				.requestFrameOfReference( this.frameOfReferenceType )
				.then( ( value: any ) => {

					this.frameOfReference = value;

					this.renderer.setFramebuffer( this.session.baseLayer.framebuffer );

					this.animation.setContext( this.session );
					this.animation.start();

				} );

			//

			this.inputSources = this.session.getInputSources();

			this.session.addEventListener( 'inputsourceschange', () => {

				this.inputSources = this.session.getInputSources();
				console.log( this.inputSources );

				for ( var i = 0; i < this.controllers.length; i ++ ) {

					var controller = this.controllers[ i ];
					controller.userData.inputSource = this.inputSources[ i ];

				}

			} );

		}

	}

	updateCamera<T extends Camera, P extends Object3D>(
		camera: T,
		parent: P | null
	) {

		if ( parent === null ) {

			camera.matrixWorld.copy( camera.matrix );

		} else {

			camera.matrixWorld.multiplyMatrices( parent.matrixWorld, camera.matrix );

		}

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

	}

	getCamera<T extends Camera>( camera: T ) {

		if ( this.isPresenting() ) {

			var parent = camera.parent;
			var cameras = this.cameraVR.cameras;

			this.updateCamera( this.cameraVR, parent );

			for ( var i = 0; i < cameras.length; i ++ ) {

				this.updateCamera( cameras[ i ], parent );

			}

			// update camera and its children

			camera.matrixWorld.copy( this.cameraVR.matrixWorld );

			var children = camera.children;

			for ( var i = 0, l = children.length; i < l; i ++ ) {

				children[ i ].updateMatrixWorld( true );

			}

			setProjectionFromUnion( this.cameraVR, this.cameraL, this.cameraR );

			return this.cameraVR;

		}

		return camera;

	}

	// Animation Loop

	onAnimationFrameCallback: ( ( time: number ) => void ) | null = null;

	private onAnimationFrame( time: number, frame: any ) {

		this.pose = frame.getDevicePose( this.frameOfReference );

		if ( this.pose !== null ) {

			var layer = this.session.baseLayer;
			var views = frame.views;

			for ( var i = 0; i < views.length; i ++ ) {

				var view = views[ i ];
				var viewport = layer.getViewport( view );
				var viewMatrix = this.pose.getViewMatrix( view );

				var camera = this.cameraVR.cameras[ i ];
				camera.matrix.fromArray( viewMatrix ).getInverse( camera.matrix );
				camera.projectionMatrix.fromArray( view.projectionMatrix );
				camera.viewport.set(
					viewport.x,
					viewport.y,
					viewport.width,
					viewport.height
				);

				if ( i === 0 ) {

					this.cameraVR.matrix.copy( camera.matrix );

				}

			}

		}

		//

		for ( var i = 0; i < this.controllers.length; i ++ ) {

			var controller = this.controllers[ i ];

			var inputSource = this.inputSources[ i ];

			if ( inputSource ) {

				var inputPose = frame.getInputPose( inputSource, this.frameOfReference );

				if ( inputPose !== null ) {

					if ( 'targetRay' in inputPose ) {

						controller.matrix.elements = inputPose.targetRay.transformMatrix;

					} else if ( 'pointerMatrix' in inputPose ) {

						// DEPRECATED

						controller.matrix.elements = inputPose.pointerMatrix;

					}

					controller.matrix.decompose(
						controller.position!,
						controller.rotation,
						controller.scale!
					);
					controller.visible = true;

					continue;

				}

			}

			controller.visible = false;

		}

		if ( this.onAnimationFrameCallback ) this.onAnimationFrameCallback( time );

	}

	setAnimationLoop( callback: ( time: number ) => void ) {

		this.onAnimationFrameCallback = callback;

	}

	dispose = function () {};

	// DEPRECATED

	getStandingMatrix() {

		console.warn(
			'THREE.WebXRManager: getStandingMatrix() is no longer needed.'
		);
		return new Matrix4();

	}

	submitFrame = function () {};

}
