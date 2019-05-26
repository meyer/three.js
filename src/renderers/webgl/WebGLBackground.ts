/**
 * @author mrdoob / http://mrdoob.com/
 */

import { BackSide, FrontSide } from '../../constants';
import { BoxBufferGeometry } from '../../geometries/BoxGeometry';
import { PlaneBufferGeometry } from '../../geometries/PlaneGeometry';
import { ShaderMaterial } from '../../materials/ShaderMaterial';
import { Color } from '../../math/Color';
import { Mesh } from '../../objects/Mesh';
import { ShaderLib } from '../shaders/ShaderLib';
import { cloneUniforms } from '../shaders/UniformsUtils';
import { WebGLRenderer } from '../WebGLRenderer2';

export class WebGLBackground {

	constructor(
		renderer: WebGLRenderer,
		state: any,
		objects: any,
		premultipliedAlpha: any
	) {

		this.renderer = renderer;
		this.state = state;
		this.objects = objects;
		this.premultipliedAlpha = premultipliedAlpha;

	}

	private renderer: WebGLRenderer;
	private state: any;
	private objects: any;
	private premultipliedAlpha: any;

	private clearColor = new Color( 0x000000 );
	private clearAlpha = 0;

	private planeMesh: Mesh | undefined;
	private boxMesh: Mesh | undefined;

	// Store the current background texture and its `version`
	// so we can recompile the material accordingly.
	private currentBackground = null;
	private currentBackgroundVersion = 0;

	render( renderList: any, scene: any, camera: any, forceClear: any ) {

		var background = scene.background;

		// Ignore background in AR
		// TODO: Reconsider this.

		var vr = this.renderer.vr;
		var session = vr.getSession && vr.getSession();

		if ( session && session.environmentBlendMode === 'additive' ) {

			background = null;

		}

		if ( background === null ) {

			this.setClear( this.clearColor, this.clearAlpha );
			this.currentBackground = null;
			this.currentBackgroundVersion = 0;

		} else if ( background && background.isColor ) {

			this.setClear( background, 1 );
			forceClear = true;
			this.currentBackground = null;
			this.currentBackgroundVersion = 0;

		}

		if ( this.renderer.autoClear || forceClear ) {

			this.renderer.clear(
				this.renderer.autoClearColor,
				this.renderer.autoClearDepth,
				this.renderer.autoClearStencil
			);

		}

		if (
			background &&
			( background.isCubeTexture || background.isWebGLRenderTargetCube )
		) {

			if ( this.boxMesh === undefined ) {

				this.boxMesh = new Mesh(
					new BoxBufferGeometry( 1, 1, 1 ),
					new ShaderMaterial( {
						type: 'BackgroundCubeMaterial',
						uniforms: cloneUniforms( ShaderLib.cube.uniforms ),
						vertexShader: ShaderLib.cube.vertexShader,
						fragmentShader: ShaderLib.cube.fragmentShader,
						side: BackSide,
						depthTest: false,
						depthWrite: false,
						fog: false,
					} )
				);

				this.boxMesh.geometry.removeAttribute( 'normal' );
				this.boxMesh.geometry.removeAttribute( 'uv' );

				this.boxMesh.onBeforeRender = function (
					renderer: any,
					scene: any,
					camera: any
				) {

					this.matrixWorld.copyPosition( camera.matrixWorld );

				};

				// enable code injection for non-built-in material
				Object.defineProperty( this.boxMesh.material, 'map', {
					get: function () {

						return this.uniforms.tCube.value;

					},
				} );

				this.objects.update( this.boxMesh );

			}

			var texture = background.isWebGLRenderTargetCube
				? background.texture
				: background;
			this.boxMesh.material.uniforms.tCube.value = texture;
			this.boxMesh.material.uniforms.tFlip.value = background.isWebGLRenderTargetCube
				? 1
				: - 1;

			if (
				this.currentBackground !== background ||
				this.currentBackgroundVersion !== texture.version
			) {

				this.boxMesh.material.needsUpdate = true;

				this.currentBackground = background;
				this.currentBackgroundVersion = texture.version;

			}

			// push to the pre-sorted opaque render list
			renderList.unshift(
				this.boxMesh,
				this.boxMesh.geometry,
				this.boxMesh.material,
				0,
				0,
				null
			);

		} else if ( background && background.isTexture ) {

			if ( this.planeMesh === undefined ) {

				this.planeMesh = new Mesh(
					new PlaneBufferGeometry( 2, 2 ),
					new ShaderMaterial( {
						type: 'BackgroundMaterial',
						uniforms: cloneUniforms( ShaderLib.background.uniforms ),
						vertexShader: ShaderLib.background.vertexShader,
						fragmentShader: ShaderLib.background.fragmentShader,
						side: FrontSide,
						depthTest: false,
						depthWrite: false,
						fog: false,
					} )
				);

				this.planeMesh.geometry.removeAttribute( 'normal' );

				// enable code injection for non-built-in material
				Object.defineProperty( this.planeMesh.material, 'map', {
					get: function () {

						return this.uniforms.t2D.value;

					},
				} );

				this.objects.update( this.planeMesh );

			}

			this.planeMesh.material.uniforms.t2D.value = background;

			if ( background.matrixAutoUpdate === true ) {

				background.updateMatrix();

			}

			this.planeMesh.material.uniforms.uvTransform.value.copy(
				background.matrix
			);

			if (
				this.currentBackground !== background ||
				this.currentBackgroundVersion !== background.version
			) {

				this.planeMesh.material.needsUpdate = true;

				this.currentBackground = background;
				this.currentBackgroundVersion = background.version;

			}

			// push to the pre-sorted opaque render list
			renderList.unshift(
				this.planeMesh,
				this.planeMesh.geometry,
				this.planeMesh.material,
				0,
				0,
				null
			);

		}

	}

	private setClear( color: any, alpha: any ) {

		this.state.buffers.color.setClear(
			color.r,
			color.g,
			color.b,
			alpha,
			this.premultipliedAlpha
		);

	}

	getClearColor() {

		return this.clearColor;

	}

	setClearColor( color: any, alpha: any ) {

		this.clearColor.set( color );
		this.clearAlpha = alpha !== undefined ? alpha : 1;
		this.setClear( this.clearColor, this.clearAlpha );

	}

	getClearAlpha() {

		return this.clearAlpha;

	}

	setClearAlpha( alpha: any ) {

		this.clearAlpha = alpha;
		this.setClear( this.clearColor, this.clearAlpha );

	}

}
