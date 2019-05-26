/**
 * @author mrdoob / http://mrdoob.com/
 */

interface KnownExtensions {
	EXT_blend_minmax: EXT_blend_minmax | null;
	EXT_texture_filter_anisotropic: EXT_texture_filter_anisotropic | null;
	EXT_frag_depth: EXT_frag_depth | null;
	EXT_shader_texture_lod: EXT_shader_texture_lod | null;
	EXT_sRGB: EXT_sRGB | null;
	OES_vertex_array_object: OES_vertex_array_object | null;
	WEBGL_color_buffer_float: WEBGL_color_buffer_float | null;
	WEBGL_compressed_texture_astc: WEBGL_compressed_texture_astc | null;
	WEBGL_compressed_texture_s3tc_srgb: WEBGL_compressed_texture_s3tc_srgb | null;
	WEBGL_debug_shaders: WEBGL_debug_shaders | null;
	WEBGL_draw_buffers: WEBGL_draw_buffers | null;
	WEBGL_lose_context: WEBGL_lose_context | null;
	WEBGL_depth_texture: WEBGL_depth_texture | null;
	WEBGL_debug_renderer_info: WEBGL_debug_renderer_info | null;
	WEBGL_compressed_texture_s3tc: WEBGL_compressed_texture_s3tc | null;
	OES_texture_half_float_linear: OES_texture_half_float_linear | null;
	OES_texture_half_float: OES_texture_half_float | null;
	OES_texture_float_linear: OES_texture_float_linear | null;
	OES_texture_float: OES_texture_float | null;
	OES_standard_derivatives: OES_standard_derivatives | null;
	OES_element_index_uint: OES_element_index_uint | null;
	ANGLE_instanced_arrays: ANGLE_instanced_arrays | null;
}

export class WebGLExtensions {

	private extensions: Record<string, any | undefined> = {};
	private gl: WebGLRenderingContext | WebGL2RenderingContext;

	constructor( gl: WebGLRenderingContext | WebGL2RenderingContext ) {

		this.gl = gl;

	}

	get<K extends keyof KnownExtensions>( name: K ): KnownExtensions[K];
	get<K extends string>( name: K ): any;
	get( name: string ): any {

		if ( this.extensions[ name ] !== undefined ) {

			return this.extensions[ name ];

		}

		let extension: any;

		switch ( name ) {

			case 'WEBGL_depth_texture':
				extension =
					this.gl.getExtension( 'WEBGL_depth_texture' ) ||
					this.gl.getExtension( 'MOZ_WEBGL_depth_texture' ) ||
					this.gl.getExtension( 'WEBKIT_WEBGL_depth_texture' );
				break;

			case 'EXT_texture_filter_anisotropic':
				extension =
					this.gl.getExtension( 'EXT_texture_filter_anisotropic' ) ||
					this.gl.getExtension( 'MOZ_EXT_texture_filter_anisotropic' ) ||
					this.gl.getExtension( 'WEBKIT_EXT_texture_filter_anisotropic' );
				break;

			case 'WEBGL_compressed_texture_s3tc':
				extension =
					this.gl.getExtension( 'WEBGL_compressed_texture_s3tc' ) ||
					this.gl.getExtension( 'MOZ_WEBGL_compressed_texture_s3tc' ) ||
					this.gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_s3tc' );
				break;

			case 'WEBGL_compressed_texture_pvrtc':
				extension =
					this.gl.getExtension( 'WEBGL_compressed_texture_pvrtc' ) ||
					this.gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_pvrtc' );
				break;

			default:
				extension = this.gl.getExtension( name );

		}

		if ( extension === null ) {

			console.warn(
				'THREE.WebGLRenderer: ' + name + ' extension not supported.'
			);

		}

		this.extensions[ name ] = extension;

		return extension;

	}

}
