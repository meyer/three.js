export interface WebGLCapabilitiesParams {
	precision?: 'lowp' | 'mediump' | 'highp';
	logarithmicDepthBuffer?: boolean;
}

/**
 * @author mrdoob / http://mrdoob.com/
 */

export class WebGLCapabilities {

	constructor(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		extensions: any,
		parameters: WebGLCapabilitiesParams
	) {

		this.gl = gl;
		this.extensions = extensions;

		this.isWebGL2 =
			typeof WebGL2RenderingContext !== 'undefined' &&
			this.gl instanceof WebGL2RenderingContext;

		this.precision =
			parameters.precision !== undefined ? parameters.precision : 'highp';
		var maxPrecision = this.getMaxPrecision( this.precision );

		if ( maxPrecision !== this.precision ) {

			console.warn(
				'THREE.WebGLRenderer:',
				this.precision,
				'not supported, using',
				maxPrecision,
				'instead.'
			);
			this.precision = maxPrecision;

		}

		this.logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;

		this.maxTextures = gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS );
		this.maxVertexTextures = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
		this.maxTextureSize = gl.getParameter( gl.MAX_TEXTURE_SIZE );
		this.maxCubemapSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE );

		this.maxAttributes = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );
		this.maxVertexUniforms = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS );
		this.maxVaryings = gl.getParameter( gl.MAX_VARYING_VECTORS );
		this.maxFragmentUniforms = gl.getParameter( gl.MAX_FRAGMENT_UNIFORM_VECTORS );

		this.vertexTextures = this.maxVertexTextures > 0;
		this.floatFragmentTextures =
			this.isWebGL2 || !! extensions.get( 'OES_texture_float' );
		this.floatVertexTextures =
			this.vertexTextures && this.floatFragmentTextures;

		this.maxSamples = 'MAX_SAMPLES' in gl ? gl.getParameter( gl.MAX_SAMPLES ) : 0;

	}

	private maxAnisotropy: any;
	private gl: WebGLRenderingContext | WebGL2RenderingContext;
	private extensions: any;

	public isWebGL2: boolean;
	public precision: any;
	public logarithmicDepthBuffer: boolean;
	public maxTextures: any;
	public maxVertexTextures: any;
	public maxTextureSize: any;
	public maxCubemapSize: any;
	public maxAttributes: any;
	public maxVertexUniforms: any;
	public maxVaryings: any;
	public maxFragmentUniforms: any;
	public vertexTextures: any;
	public floatFragmentTextures: any;
	public floatVertexTextures: any;
	public maxSamples: any;

	getMaxAnisotropy() {

		if ( this.maxAnisotropy !== undefined ) return this.maxAnisotropy;

		var extension = this.extensions.get( 'EXT_texture_filter_anisotropic' );

		if ( extension !== null ) {

			this.maxAnisotropy = this.gl.getParameter(
				extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT
			);

		} else {

			this.maxAnisotropy = 0;

		}

		return this.maxAnisotropy;

	}

	getMaxPrecision( precision?: any ): 'highp' | 'mediump' | 'lowp' {

		if ( precision === 'highp' ) {

			if (
				this.gl.getShaderPrecisionFormat(
					this.gl.VERTEX_SHADER,
					this.gl.HIGH_FLOAT
				)!.precision > 0 &&
				this.gl.getShaderPrecisionFormat(
					this.gl.FRAGMENT_SHADER,
					this.gl.HIGH_FLOAT
				)!.precision > 0
			) {

				return 'highp';

			}

			precision = 'mediump';

		}

		if ( precision === 'mediump' ) {

			if (
				this.gl.getShaderPrecisionFormat(
					this.gl.VERTEX_SHADER,
					this.gl.MEDIUM_FLOAT
				)!.precision > 0 &&
				this.gl.getShaderPrecisionFormat(
					this.gl.FRAGMENT_SHADER,
					this.gl.MEDIUM_FLOAT
				)!.precision > 0
			) {

				return 'mediump';

			}

		}

		return 'lowp';

	}

}
