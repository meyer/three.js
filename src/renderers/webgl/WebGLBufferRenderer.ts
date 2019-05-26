import { Geometry } from '../../core/Geometry';
import { WebGLCapabilities } from './WebGLCapabilities';

/**
 * @author mrdoob / http://mrdoob.com/
 */

export class WebGLBufferRenderer {

	gl: WebGLRenderingContext | WebGL2RenderingContext;
	mode: number;
	info: any;
	capabilities: WebGLCapabilities;
	extensions: Map<
		| 'drawArraysInstanced'
		| 'drawArraysInstancedANGLE'
		| 'ANGLE_instanced_arrays',
		any
	>;

	constructor(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		extensions: any,
		info: any,
		capabilities: WebGLCapabilities
	) {

		this.gl = gl;
		this.mode = 0;
		this.info = info;
		this.capabilities = capabilities;
		this.extensions = extensions;

	}

	setMode( value: any ): void {

		this.mode = value;

	}

	render( start: number, count: number ) {

		this.gl.drawArrays( this.mode, start, count );

		this.info.update( count, this.mode );

	}

	renderInstances( geometry: Geometry, start: number, count: number ) {

		var extension;

		if ( this.capabilities.isWebGL2 ) {

			extension = this.gl;

		} else {

			extension = this.extensions.get( 'ANGLE_instanced_arrays' );

			if ( extension === null ) {

				console.error(
					'THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.'
				);
				return;

			}

		}

		extension[
			this.capabilities.isWebGL2
				? 'drawArraysInstanced'
				: 'drawArraysInstancedANGLE'
		]( this.mode, start, count, geometry.maxInstancedCount );

		this.info.update( count, this.mode, geometry.maxInstancedCount );

	}

}
