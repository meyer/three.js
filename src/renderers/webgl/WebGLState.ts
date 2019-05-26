/**
 * @author mrdoob / http://mrdoob.com/
 */

import {
	NotEqualDepth,
	GreaterDepth,
	GreaterEqualDepth,
	EqualDepth,
	LessEqualDepth,
	LessDepth,
	AlwaysDepth,
	NeverDepth,
	CullFaceFront,
	CullFaceBack,
	CullFaceNone,
	CustomBlending,
	MultiplyBlending,
	SubtractiveBlending,
	AdditiveBlending,
	NoBlending,
	NormalBlending,
	AddEquation,
	DoubleSide,
	BackSide,
	DepthModes,
	Blending,
	CullFace,
} from '../../constants';
import { Vector4 } from '../../math/Vector4';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLUtils } from './WebGLUtils';
import { WebGLCapabilities } from './WebGLCapabilities';
import { Material } from '../../materials/Material';

class ColorBuffer {

	constructor( gl: WebGLRenderingContext | WebGL2RenderingContext ) {

		this.gl = gl;

	}

	gl: WebGLRenderingContext | WebGL2RenderingContext;

	locked = false;

	color = new Vector4();
	currentColorMask: any = null;
	currentColorClear = new Vector4( 0, 0, 0, 0 );

	setMask( colorMask: boolean ) {

		if ( this.currentColorMask !== colorMask && ! this.locked ) {

			this.gl.colorMask( colorMask, colorMask, colorMask, colorMask );
			this.currentColorMask = colorMask;

		}

	}

	setLocked( lock: any ) {

		this.locked = lock;

	}

	setClear(
		r: number,
		g: number,
		b: number,
		a: number,
		premultipliedAlpha?: boolean
	) {

		if ( premultipliedAlpha === true ) {

			r *= a;
			g *= a;
			b *= a;

		}

		this.color.set( r, g, b, a );

		if ( this.currentColorClear.equals( this.color ) === false ) {

			this.gl.clearColor( r, g, b, a );
			this.currentColorClear.copy( this.color );

		}

	}

	reset() {

		this.locked = false;

		this.currentColorMask = null;
		this.currentColorClear.set( - 1, 0, 0, 0 ); // set to invalid state

	}

}

class DepthBuffer {

	constructor(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		enable: ( id: number ) => void,
		disable: ( id: number ) => void
	) {

		this.gl = gl;
		this.enable = enable;
		this.disable = disable;

	}

	gl: WebGLRenderingContext | WebGL2RenderingContext;
	enable: ( id: number ) => void;
	disable: ( id: number ) => void;

	locked = false;

	currentDepthMask: any = null;
	currentDepthFunc: any = null;
	currentDepthClear: any = null;

	setTest( depthTest?: Boolean ) {

		if ( depthTest ) {

			this.enable( this.gl.DEPTH_TEST );

		} else {

			this.disable( this.gl.DEPTH_TEST );

		}

	}

	setMask( depthMask: boolean ) {

		if ( this.currentDepthMask !== depthMask && ! this.locked ) {

			this.gl.depthMask( depthMask );
			this.currentDepthMask = depthMask;

		}

	}

	setFunc( depthFunc: DepthModes ) {

		if ( this.currentDepthFunc !== depthFunc ) {

			if ( depthFunc ) {

				switch ( depthFunc ) {

					case NeverDepth:
						this.gl.depthFunc( this.gl.NEVER );
						break;

					case AlwaysDepth:
						this.gl.depthFunc( this.gl.ALWAYS );
						break;

					case LessDepth:
						this.gl.depthFunc( this.gl.LESS );
						break;

					case LessEqualDepth:
						this.gl.depthFunc( this.gl.LEQUAL );
						break;

					case EqualDepth:
						this.gl.depthFunc( this.gl.EQUAL );
						break;

					case GreaterEqualDepth:
						this.gl.depthFunc( this.gl.GEQUAL );
						break;

					case GreaterDepth:
						this.gl.depthFunc( this.gl.GREATER );
						break;

					case NotEqualDepth:
						this.gl.depthFunc( this.gl.NOTEQUAL );
						break;

					default:
						this.gl.depthFunc( this.gl.LEQUAL );

				}

			} else {

				this.gl.depthFunc( this.gl.LEQUAL );

			}

			this.currentDepthFunc = depthFunc;

		}

	}

	setLocked( lock: boolean ) {

		this.locked = lock;

	}

	setClear( depth: DepthModes ) {

		if ( this.currentDepthClear !== depth ) {

			this.gl.clearDepth( depth );
			this.currentDepthClear = depth;

		}

	}

	reset() {

		this.locked = false;

		this.currentDepthMask = null;
		this.currentDepthFunc = null;
		this.currentDepthClear = null;

	}

}

class StencilBuffer {

	constructor(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		enable: ( id: number ) => void,
		disable: ( id: number ) => void
	) {

		this.gl = gl;
		this.enable = enable;
		this.disable = disable;

	}

	gl: WebGLRenderingContext | WebGL2RenderingContext;
	enable: ( id: number ) => void;
	disable: ( id: number ) => void;

	locked = false;

	currentStencilMask: any = null;
	currentStencilFunc: any = null;
	currentStencilRef: any = null;
	currentStencilFuncMask: any = null;
	currentStencilFail: any = null;
	currentStencilZFail: any = null;
	currentStencilZPass: any = null;
	currentStencilClear: any = null;

	setTest( stencilTest?: boolean ) {

		if ( stencilTest ) {

			this.enable( this.gl.STENCIL_TEST );

		} else {

			this.disable( this.gl.STENCIL_TEST );

		}

	}

	setMask( stencilMask: number ) {

		if ( this.currentStencilMask !== stencilMask && ! this.locked ) {

			this.gl.stencilMask( stencilMask );
			this.currentStencilMask = stencilMask;

		}

	}

	setFunc( stencilFunc: number, stencilRef: number, stencilMask: number ) {

		if (
			this.currentStencilFunc !== stencilFunc ||
			this.currentStencilRef !== stencilRef ||
			this.currentStencilFuncMask !== stencilMask
		) {

			this.gl.stencilFunc( stencilFunc, stencilRef, stencilMask );

			this.currentStencilFunc = stencilFunc;
			this.currentStencilRef = stencilRef;
			this.currentStencilFuncMask = stencilMask;

		}

	}

	setOp( stencilFail: number, stencilZFail: number, stencilZPass: number ) {

		if (
			this.currentStencilFail !== stencilFail ||
			this.currentStencilZFail !== stencilZFail ||
			this.currentStencilZPass !== stencilZPass
		) {

			this.gl.stencilOp( stencilFail, stencilZFail, stencilZPass );

			this.currentStencilFail = stencilFail;
			this.currentStencilZFail = stencilZFail;
			this.currentStencilZPass = stencilZPass;

		}

	}

	setLocked( lock: boolean ) {

		this.locked = lock;

	}

	setClear( stencil: number ) {

		if ( this.currentStencilClear !== stencil ) {

			this.gl.clearStencil( stencil );
			this.currentStencilClear = stencil;

		}

	}

	reset() {

		this.locked = false;

		this.currentStencilMask = null;
		this.currentStencilFunc = null;
		this.currentStencilRef = null;
		this.currentStencilFuncMask = null;
		this.currentStencilFail = null;
		this.currentStencilZFail = null;
		this.currentStencilZPass = null;
		this.currentStencilClear = null;

	}

}

export class WebGLState {

	public buffers: {
		color: ColorBuffer;
		depth: DepthBuffer;
		stencil: StencilBuffer;
	};

	private maxVertexAttributes: any;
	private newAttributes: Uint8Array;
	private enabledAttributes: Uint8Array;
	private attributeDivisors: Uint8Array;

	private enabledCapabilities: Record<number, boolean> = {};

	private compressedTextureFormats: any = null;

	private currentProgram: any = null;

	private currentBlendingEnabled: any = null;
	private currentBlending: any = null;
	private currentBlendEquation: any = null;
	private currentBlendSrc: any = null;
	private currentBlendDst: any = null;
	private currentBlendEquationAlpha: any = null;
	private currentBlendSrcAlpha: any = null;
	private currentBlendDstAlpha: any = null;
	private currentPremultipledAlpha: any = false;

	private currentFlipSided: any = null;
	private currentCullFace: any = null;

	private currentLineWidth: any = null;

	private currentPolygonOffsetFactor: any = null;
	private currentPolygonOffsetUnits: any = null;

	private maxTextures: any;

	private lineWidthAvailable = false;
	private version = 0;
	private glVersion: any;

	private currentTextureSlot: any = null;
	private currentBoundTextures: Record<string, any> = {};

	private currentScissor = new Vector4();
	private currentViewport = new Vector4();

	private emptyTextures: Record<number, WebGLTexture | null> = {};

	private gl: WebGLRenderingContext | WebGL2RenderingContext;
	private extensions: WebGLExtensions;
	private utils: WebGLUtils;
	private capabilities: WebGLCapabilities;

	constructor(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		extensions: WebGLExtensions,
		utils: WebGLUtils,
		capabilities: WebGLCapabilities
	) {

		this.gl = gl;
		this.extensions = extensions;
		this.utils = utils;
		this.capabilities = capabilities;

		var colorBuffer = new ColorBuffer( gl );
		var depthBuffer = new DepthBuffer( gl, this.enable, this.disable );
		var stencilBuffer = new StencilBuffer( gl, this.enable, this.disable );

		this.buffers = {
			color: colorBuffer,
			depth: depthBuffer,
			stencil: stencilBuffer,
		};

		this.maxVertexAttributes = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );
		this.newAttributes = new Uint8Array( this.maxVertexAttributes );
		this.enabledAttributes = new Uint8Array( this.maxVertexAttributes );
		this.attributeDivisors = new Uint8Array( this.maxVertexAttributes );

		this.maxTextures = gl.getParameter( gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS );
		this.glVersion = gl.getParameter( gl.VERSION );

		if ( this.glVersion.indexOf( 'WebGL' ) !== - 1 ) {

			this.version = parseFloat( /^WebGL\ ([0-9])/.exec( this.glVersion )![ 1 ] );
			this.lineWidthAvailable = this.version >= 1.0;

		} else if ( this.glVersion.indexOf( 'OpenGL ES' ) !== - 1 ) {

			this.version = parseFloat(
				/^OpenGL\ ES\ ([0-9])/.exec( this.glVersion )![ 1 ]
			);
			this.lineWidthAvailable = this.version >= 2.0;

		}

		this.emptyTextures[ gl.TEXTURE_2D ] = this.createTexture(
			gl.TEXTURE_2D,
			gl.TEXTURE_2D,
			1
		);
		this.emptyTextures[ gl.TEXTURE_CUBE_MAP ] = this.createTexture(
			gl.TEXTURE_CUBE_MAP,
			gl.TEXTURE_CUBE_MAP_POSITIVE_X,
			6
		);

		// init

		colorBuffer.setClear( 0, 0, 0, 1 );
		depthBuffer.setClear( 1 );
		stencilBuffer.setClear( 0 );

		this.enable( this.gl.DEPTH_TEST );
		depthBuffer.setFunc( LessEqualDepth );

		this.setFlipSided( false );
		this.setCullFace( CullFaceBack );
		this.enable( gl.CULL_FACE );

		this.setBlending( NoBlending );

	}

	createTexture( type: number, target: number, count: number ) {

		var data = new Uint8Array( 4 ); // 4 is required to match default unpack alignment of 4.
		var texture = this.gl.createTexture();

		this.gl.bindTexture( type, texture );
		this.gl.texParameteri( type, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST );
		this.gl.texParameteri( type, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST );

		for ( var i = 0; i < count; i ++ ) {

			this.gl.texImage2D(
				target + i,
				0,
				this.gl.RGBA,
				1,
				1,
				0,
				this.gl.RGBA,
				this.gl.UNSIGNED_BYTE,
				data
			);

		}

		return texture;

	}

	initAttributes() {

		for ( var i = 0, l = this.newAttributes.length; i < l; i ++ ) {

			this.newAttributes[ i ] = 0;

		}

	}

	enableAttribute( attribute: number ) {

		this.enableAttributeAndDivisor( attribute, 0 );

	}

	enableAttributeAndDivisor( attribute: number, meshPerAttribute: number ) {

		this.newAttributes[ attribute ] = 1;

		if ( this.enabledAttributes[ attribute ] === 0 ) {

			this.gl.enableVertexAttribArray( attribute );
			this.enabledAttributes[ attribute ] = 1;

		}

		if ( this.attributeDivisors[ attribute ] !== meshPerAttribute ) {

			const extension = this.capabilities.isWebGL2
				? this.gl
				: this.extensions.get( 'ANGLE_instanced_arrays' )!;

			( extension as any )[
				this.capabilities.isWebGL2
					? 'vertexAttribDivisor'
					: 'vertexAttribDivisorANGLE'
			]( attribute, meshPerAttribute );
			this.attributeDivisors[ attribute ] = meshPerAttribute;

		}

	}

	disableUnusedAttributes() {

		for ( var i = 0, l = this.enabledAttributes.length; i !== l; ++ i ) {

			if ( this.enabledAttributes[ i ] !== this.newAttributes[ i ] ) {

				this.gl.disableVertexAttribArray( i );
				this.enabledAttributes[ i ] = 0;

			}

		}

	}

	enable( id: number ) {

		if ( this.enabledCapabilities[ id ] !== true ) {

			this.gl.enable( id );
			this.enabledCapabilities[ id ] = true;

		}

	}

	disable( id: number ) {

		if ( this.enabledCapabilities[ id ] !== false ) {

			this.gl.disable( id );
			this.enabledCapabilities[ id ] = false;

		}

	}

	getCompressedTextureFormats() {

		if ( this.compressedTextureFormats === null ) {

			this.compressedTextureFormats = [];

			if (
				this.extensions.get( 'WEBGL_compressed_texture_pvrtc' ) ||
				this.extensions.get( 'WEBGL_compressed_texture_s3tc' ) ||
				this.extensions.get( 'WEBGL_compressed_texture_etc1' ) ||
				this.extensions.get( 'WEBGL_compressed_texture_astc' )
			) {

				var formats = this.gl.getParameter( this.gl.COMPRESSED_TEXTURE_FORMATS );

				for ( var i = 0; i < formats.length; i ++ ) {

					this.compressedTextureFormats.push( formats[ i ] );

				}

			}

		}

		return this.compressedTextureFormats;

	}

	useProgram( program: WebGLProgram | null ) {

		if ( this.currentProgram !== program ) {

			this.gl.useProgram( program );

			this.currentProgram = program;

			return true;

		}

		return false;

	}

	setBlending(
		blending: Blending,
		blendEquation?: number,
		blendSrc?: any,
		blendDst?: any,
		blendEquationAlpha?: any,
		blendSrcAlpha?: any,
		blendDstAlpha?: any,
		premultipliedAlpha?: any
	) {

		if ( blending === NoBlending ) {

			if ( this.currentBlendingEnabled ) {

				this.disable( this.gl.BLEND );
				this.currentBlendingEnabled = false;

			}

			return;

		}

		if ( ! this.currentBlendingEnabled ) {

			this.enable( this.gl.BLEND );
			this.currentBlendingEnabled = true;

		}

		if ( blending !== CustomBlending ) {

			if (
				blending !== this.currentBlending ||
				premultipliedAlpha !== this.currentPremultipledAlpha
			) {

				if (
					this.currentBlendEquation !== AddEquation ||
					this.currentBlendEquationAlpha !== AddEquation
				) {

					this.gl.blendEquation( this.gl.FUNC_ADD );

					this.currentBlendEquation = AddEquation;
					this.currentBlendEquationAlpha = AddEquation;

				}

				if ( premultipliedAlpha ) {

					switch ( blending ) {

						case NormalBlending:
							this.gl.blendFuncSeparate(
								this.gl.ONE,
								this.gl.ONE_MINUS_SRC_ALPHA,
								this.gl.ONE,
								this.gl.ONE_MINUS_SRC_ALPHA
							);
							break;

						case AdditiveBlending:
							this.gl.blendFunc( this.gl.ONE, this.gl.ONE );
							break;

						case SubtractiveBlending:
							this.gl.blendFuncSeparate(
								this.gl.ZERO,
								this.gl.ZERO,
								this.gl.ONE_MINUS_SRC_COLOR,
								this.gl.ONE_MINUS_SRC_ALPHA
							);
							break;

						case MultiplyBlending:
							this.gl.blendFuncSeparate(
								this.gl.ZERO,
								this.gl.SRC_COLOR,
								this.gl.ZERO,
								this.gl.SRC_ALPHA
							);
							break;

						default:
							console.error( 'THREE.WebGLState: Invalid blending: ', blending );
							break;

					}

				} else {

					switch ( blending ) {

						case NormalBlending:
							this.gl.blendFuncSeparate(
								this.gl.SRC_ALPHA,
								this.gl.ONE_MINUS_SRC_ALPHA,
								this.gl.ONE,
								this.gl.ONE_MINUS_SRC_ALPHA
							);
							break;

						case AdditiveBlending:
							this.gl.blendFunc( this.gl.SRC_ALPHA, this.gl.ONE );
							break;

						case SubtractiveBlending:
							this.gl.blendFunc( this.gl.ZERO, this.gl.ONE_MINUS_SRC_COLOR );
							break;

						case MultiplyBlending:
							this.gl.blendFunc( this.gl.ZERO, this.gl.SRC_COLOR );
							break;

						default:
							console.error( 'THREE.WebGLState: Invalid blending: ', blending );
							break;

					}

				}

				this.currentBlendSrc = null;
				this.currentBlendDst = null;
				this.currentBlendSrcAlpha = null;
				this.currentBlendDstAlpha = null;

				this.currentBlending = blending;
				this.currentPremultipledAlpha = premultipliedAlpha;

			}

			return;

		}

		// custom blending

		blendEquationAlpha = blendEquationAlpha || blendEquation;
		blendSrcAlpha = blendSrcAlpha || blendSrc;
		blendDstAlpha = blendDstAlpha || blendDst;

		if (
			blendEquation !== this.currentBlendEquation ||
			blendEquationAlpha !== this.currentBlendEquationAlpha
		) {

			this.gl.blendEquationSeparate(
				this.utils.convert( blendEquation ),
				this.utils.convert( blendEquationAlpha )
			);

			this.currentBlendEquation = blendEquation;
			this.currentBlendEquationAlpha = blendEquationAlpha;

		}

		if (
			blendSrc !== this.currentBlendSrc ||
			blendDst !== this.currentBlendDst ||
			blendSrcAlpha !== this.currentBlendSrcAlpha ||
			blendDstAlpha !== this.currentBlendDstAlpha
		) {

			this.gl.blendFuncSeparate(
				this.utils.convert( blendSrc ),
				this.utils.convert( blendDst ),
				this.utils.convert( blendSrcAlpha ),
				this.utils.convert( blendDstAlpha )
			);

			this.currentBlendSrc = blendSrc;
			this.currentBlendDst = blendDst;
			this.currentBlendSrcAlpha = blendSrcAlpha;
			this.currentBlendDstAlpha = blendDstAlpha;

		}

		this.currentBlending = blending;
		this.currentPremultipledAlpha = null;

	}

	setMaterial( material: Material, frontFaceCW?: boolean ) {

		material.side === DoubleSide
			? this.disable( this.gl.CULL_FACE )
			: this.enable( this.gl.CULL_FACE );

		var flipSided = material.side === BackSide;
		if ( frontFaceCW ) flipSided = ! flipSided;

		this.setFlipSided( flipSided );

		material.blending === NormalBlending && material.transparent === false
			? this.setBlending( NoBlending )
			: this.setBlending(
				material.blending,
				material.blendEquation,
				material.blendSrc,
				material.blendDst,
				material.blendEquationAlpha,
				material.blendSrcAlpha,
				material.blendDstAlpha,
				material.premultipliedAlpha
			  );

		this.buffers.depth.setFunc( material.depthFunc );
		this.buffers.depth.setTest( material.depthTest );
		this.buffers.depth.setMask( material.depthWrite );
		this.buffers.color.setMask( material.colorWrite );

		this.setPolygonOffset(
			material.polygonOffset,
			material.polygonOffsetFactor,
			material.polygonOffsetUnits
		);

	}

	//

	setFlipSided( flipSided?: boolean ) {

		if ( this.currentFlipSided !== flipSided ) {

			if ( flipSided ) {

				this.gl.frontFace( this.gl.CW );

			} else {

				this.gl.frontFace( this.gl.CCW );

			}

			this.currentFlipSided = flipSided;

		}

	}

	setCullFace( cullFace: CullFace ) {

		if ( cullFace !== CullFaceNone ) {

			this.enable( this.gl.CULL_FACE );

			if ( cullFace !== this.currentCullFace ) {

				if ( cullFace === CullFaceBack ) {

					this.gl.cullFace( this.gl.BACK );

				} else if ( cullFace === CullFaceFront ) {

					this.gl.cullFace( this.gl.FRONT );

				} else {

					this.gl.cullFace( this.gl.FRONT_AND_BACK );

				}

			}

		} else {

			this.disable( this.gl.CULL_FACE );

		}

		this.currentCullFace = cullFace;

	}

	setLineWidth( width: number ) {

		if ( width !== this.currentLineWidth ) {

			if ( this.lineWidthAvailable ) this.gl.lineWidth( width );

			this.currentLineWidth = width;

		}

	}

	setPolygonOffset( polygonOffset: boolean, factor: number, units: number ) {

		if ( polygonOffset ) {

			this.enable( this.gl.POLYGON_OFFSET_FILL );

			if (
				this.currentPolygonOffsetFactor !== factor ||
				this.currentPolygonOffsetUnits !== units
			) {

				this.gl.polygonOffset( factor, units );

				this.currentPolygonOffsetFactor = factor;
				this.currentPolygonOffsetUnits = units;

			}

		} else {

			this.disable( this.gl.POLYGON_OFFSET_FILL );

		}

	}

	setScissorTest( scissorTest?: boolean ) {

		if ( scissorTest ) {

			this.enable( this.gl.SCISSOR_TEST );

		} else {

			this.disable( this.gl.SCISSOR_TEST );

		}

	}

	// texture

	activeTexture( webglSlot?: number ) {

		if ( webglSlot === undefined )
			webglSlot = this.gl.TEXTURE0 + this.maxTextures - 1;

		if ( this.currentTextureSlot !== webglSlot ) {

			this.gl.activeTexture( webglSlot );
			this.currentTextureSlot = webglSlot;

		}

	}

	bindTexture( webglType: number, webglTexture?: WebGLTexture ) {

		if ( this.currentTextureSlot === null ) {

			this.activeTexture();

		}

		var boundTexture = this.currentBoundTextures[ this.currentTextureSlot ];

		if ( boundTexture === undefined ) {

			boundTexture = { type: undefined, texture: undefined };
			this.currentBoundTextures[ this.currentTextureSlot ] = boundTexture;

		}

		if (
			boundTexture.type !== webglType ||
			boundTexture.texture !== webglTexture
		) {

			this.gl.bindTexture(
				webglType,
				webglTexture || this.emptyTextures[ webglType ]
			);

			boundTexture.type = webglType;
			boundTexture.texture = webglTexture;

		}

	}

	compressedTexImage2D(
		...args: Parameters<WebGLRenderingContext['compressedTexImage2D']>
	) {

		try {

			this.gl.compressedTexImage2D( ...args );

		} catch ( error ) {

			console.error( 'THREE.WebGLState:', error );

		}

	}

	texImage2D( ...args: Parameters<WebGLRenderingContext['texImage2D']> ) {

		try {

			this.gl.texImage2D( ...args );

		} catch ( error ) {

			console.error( 'THREE.WebGLState:', error );

		}

	}

	texImage3D( ...args: Parameters<WebGL2RenderingContext['texImage3D']> ) {

		try {

			if ( ! ( 'texImage3D' in this.gl ) ) {

				throw new Error( 'texImage3D not supported' );

			}
			this.gl.texImage3D( ...args );

		} catch ( error ) {

			console.error( 'THREE.WebGLState:', error );

		}

	}

	//

	scissor( scissor: Vector4 ) {

		if ( this.currentScissor.equals( scissor ) === false ) {

			this.gl.scissor( scissor.x, scissor.y, scissor.z, scissor.w );
			this.currentScissor.copy( scissor );

		}

	}

	viewport( viewport: Vector4 ) {

		if ( this.currentViewport.equals( viewport ) === false ) {

			this.gl.viewport( viewport.x, viewport.y, viewport.z, viewport.w );
			this.currentViewport.copy( viewport );

		}

	}

	//

	reset() {

		for ( var i = 0; i < this.enabledAttributes.length; i ++ ) {

			if ( this.enabledAttributes[ i ] === 1 ) {

				this.gl.disableVertexAttribArray( i );
				this.enabledAttributes[ i ] = 0;

			}

		}

		this.enabledCapabilities = {};

		this.compressedTextureFormats = null;

		this.currentTextureSlot = null;
		this.currentBoundTextures = {};

		this.currentProgram = null;

		this.currentBlending = null;

		this.currentFlipSided = null;
		this.currentCullFace = null;

		this.buffers.color.reset();
		this.buffers.depth.reset();
		this.buffers.stencil.reset();

	}

}
