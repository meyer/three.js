import { EventDispatcher } from '../core/EventDispatcher';
import { Texture } from '../textures/Texture';
import { LinearFilter } from '../constants';
import { Vector4 } from '../math/Vector4';

/**
 * @author szimek / https://github.com/szimek/
 * @author alteredq / http://alteredqualia.com/
 * @author Marius Kintel / https://github.com/kintel
 */

/*
 In options, we can specify:
 * Texture parameters for an auto-generated target texture
 * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
*/
export class WebGLRenderTarget extends EventDispatcher {

	constructor( width: number, height: number, options: any ) {

		super();

		this.width = width;
		this.height = height;

		this.scissor = new Vector4( 0, 0, width, height );
		this.scissorTest = false;

		this.viewport = new Vector4( 0, 0, width, height );

		options = options || {};

		this.texture = new Texture(
			undefined,
			undefined,
			options.wrapS,
			options.wrapT,
			options.magFilter,
			options.minFilter,
			options.format,
			options.type,
			options.anisotropy,
			options.encoding
		);

		this.texture.generateMipmaps =
			options.generateMipmaps !== undefined ? options.generateMipmaps : false;
		this.texture.minFilter =
			options.minFilter !== undefined ? options.minFilter : LinearFilter;

		this.depthBuffer =
			options.depthBuffer !== undefined ? options.depthBuffer : true;
		this.stencilBuffer =
			options.stencilBuffer !== undefined ? options.stencilBuffer : true;
		this.depthTexture =
			options.depthTexture !== undefined ? options.depthTexture : null;

	}

	width: number;
	height: number;
	scissor: Vector4;
	scissorTest: boolean;
	viewport: Vector4;
	texture: Texture;
	depthBuffer: boolean;
	stencilBuffer: boolean;
	depthTexture: any | null;

	isWebGLRenderTarget = true;

	setSize( width: number, height: number ) {

		if ( this.width !== width || this.height !== height ) {

			this.width = width;
			this.height = height;

			this.dispose();

		}

		this.viewport.set( 0, 0, width, height );
		this.scissor.set( 0, 0, width, height );

	}

	clone() {

		return new ( this as any ).constructor()().copy( this );

	}

	copy( source: WebGLRenderTarget ) {

		this.width = source.width;
		this.height = source.height;

		this.viewport.copy( source.viewport );

		this.texture = source.texture.clone();

		this.depthBuffer = source.depthBuffer;
		this.stencilBuffer = source.stencilBuffer;
		this.depthTexture = source.depthTexture;

		return this;

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}
