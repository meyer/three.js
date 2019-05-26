/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { WebGLLights } from './WebGLLights';

interface WebGLRenderStateObj {
	lightsArray: any[];
	shadowsArray: any[];
	lights: WebGLLights;
}

export class WebGLRenderState {

	public state: WebGLRenderStateObj = {
		lightsArray: [],
		shadowsArray: [],

		lights: new WebGLLights(),
	};

	public init() {

		this.state.lightsArray.length = 0;
		this.state.shadowsArray.length = 0;

	}

	public pushLight( light: any ) {

		this.state.lightsArray.push( light );

	}

	public pushShadow( shadowLight: any ) {

		this.state.shadowsArray.push( shadowLight );

	}

	public setupLights( camera: any ) {

		this.state.lights.setup(
			this.state.lightsArray,
			this.state.shadowsArray,
			camera
		);

	}

}

export class WebGLRenderStates {

	private renderStates: Record<string, any> = {};

	private onSceneDispose( event: any ) {

		var scene = event.target;

		scene.removeEventListener( 'dispose', this.onSceneDispose );

		delete this.renderStates[ scene.id ];

	}

	public get( scene: any, camera: any ) {

		var renderState;

		if ( this.renderStates[ scene.id ] === undefined ) {

			renderState = new WebGLRenderState();
			this.renderStates[ scene.id ] = {};
			this.renderStates[ scene.id ][ camera.id ] = renderState;

			scene.addEventListener( 'dispose', this.onSceneDispose );

		} else {

			if ( this.renderStates[ scene.id ][ camera.id ] === undefined ) {

				renderState = new WebGLRenderState();
				this.renderStates[ scene.id ][ camera.id ] = renderState;

			} else {

				renderState = this.renderStates[ scene.id ][ camera.id ];

			}

		}

		return renderState;

	}

	public dispose() {

		this.renderStates = {};

	}

}
