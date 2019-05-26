import { WebGLExtensions } from './WebGLExtensions';
import { WebGLInfo } from './WebGLInfo';
import { WebGLCapabilities } from './WebGLCapabilities';

/**
 * @author mrdoob / http://mrdoob.com/
 */

export class WebGLIndexedBufferRenderer {

	constructor(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		extensions: WebGLExtensions,
		info: WebGLInfo,
		capabilities: WebGLCapabilities
	) {

		this.gl = gl;
		this.extensions = extensions;
		this.info = info;
		this.capabilities = capabilities;

	}

	private type: number = 0;
	private bytesPerElement: any;
	private mode: number = 0;
	private gl: WebGLRenderingContext | WebGL2RenderingContext;
	private extensions: WebGLExtensions;
	private info: WebGLInfo;
	private capabilities: WebGLCapabilities;

	public setMode( value: any ) {

		this.mode = value;

	}

	public setIndex( value: any ) {

		this.type = value.type;
		this.bytesPerElement = value.bytesPerElement;

	}

	public render( start: number, count: number ) {

		this.gl.drawElements(
			this.mode,
			count,
			this.type,
			start * this.bytesPerElement
		);

		this.info.update( count, this.mode );

	}

	public renderInstances( geometry: any, start: any, count: number ) {

		var extension: any;

		if ( this.capabilities.isWebGL2 ) {

			extension = this.gl;

		} else {

			extension = this.extensions.get( 'ANGLE_instanced_arrays' );

			if ( extension === null ) {

				console.error(
					'THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.'
				);
				return;

			}

		}

		extension[
			this.capabilities.isWebGL2
				? 'drawElementsInstanced'
				: 'drawElementsInstancedANGLE'
		](
			this.mode,
			count,
			this.type,
			start * this.bytesPerElement,
			geometry.maxInstancedCount
		);

		this.info.update( count, this.mode, geometry.maxInstancedCount );

	}

}
