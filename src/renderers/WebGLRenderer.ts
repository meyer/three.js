import {
	REVISION,
	RGBAFormat,
	HalfFloatType,
	FloatType,
	UnsignedByteType,
	TriangleFanDrawMode,
	TriangleStripDrawMode,
	TrianglesDrawMode,
	LinearToneMapping,
	BackSide
} from '../constants';
import { _Math } from '../math/Math';
import { DataTexture } from '../textures/DataTexture';
import { Frustum } from '../math/Frustum';
import { Matrix4 } from '../math/Matrix4';
import { ShaderLib } from './shaders/ShaderLib';
import { UniformsLib } from './shaders/UniformsLib';
import { cloneUniforms } from './shaders/UniformsUtils';
import { Vector2 } from '../math/Vector2';
import { Vector3 } from '../math/Vector3';
import { Vector4 } from '../math/Vector4';
import { WebGLAnimation } from './webgl/WebGLAnimation';
import { WebGLAttributes } from './webgl/WebGLAttributes';
import { WebGLBackground } from './webgl/WebGLBackground';
import { WebGLBufferRenderer } from './webgl/WebGLBufferRenderer';
import { WebGLCapabilities, WebGLCapabilitiesParams } from './webgl/WebGLCapabilities';
import { WebGLClipping } from './webgl/WebGLClipping';
import { WebGLExtensions } from './webgl/WebGLExtensions';
import { WebGLGeometries } from './webgl/WebGLGeometries';
import { WebGLIndexedBufferRenderer } from './webgl/WebGLIndexedBufferRenderer';
import { WebGLInfo } from './webgl/WebGLInfo';
import { WebGLMorphtargets } from './webgl/WebGLMorphtargets';
import { WebGLObjects } from './webgl/WebGLObjects';
import { WebGLPrograms } from './webgl/WebGLPrograms';
import { WebGLProperties } from './webgl/WebGLProperties';
import { WebGLRenderLists } from './webgl/WebGLRenderLists';
import { WebGLRenderStates } from './webgl/WebGLRenderStates';
import { WebGLShadowMap } from './webgl/WebGLShadowMap';
import { WebGLState } from './webgl/WebGLState';
import { WebGLTextures } from './webgl/WebGLTextures';
import { WebGLUniforms } from './webgl/WebGLUniforms';
import { WebGLUtils } from './webgl/WebGLUtils';
import { WebVRManager } from './webvr/WebVRManager';
import { WebXRManager } from './webvr/WebXRManager';
import { Material } from '../materials/Material';
import { Camera } from '../cameras/Camera';

/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 * @author tschw
 */

export class WebGLRenderer {
	constructor( parameters: any ) {

	console.log( 'THREE.WebGLRenderer', REVISION );

	parameters = parameters || {};

		this._canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' ),
		this._context = parameters.context !== undefined ? parameters.context : null,

		this._alpha = parameters.alpha !== undefined ? parameters.alpha : false,
		this._depth = parameters.depth !== undefined ? parameters.depth : true,
		this._stencil = parameters.stencil !== undefined ? parameters.stencil : true,
		this._antialias = parameters.antialias !== undefined ? parameters.antialias : false,
		this._premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true,
		this._preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false,
		this._powerPreference = parameters.powerPreference !== undefined ? parameters.powerPreference : 'default',
		this._failIfMajorPerformanceCaveat = parameters.failIfMajorPerformanceCaveat !== undefined ? parameters.failIfMajorPerformanceCaveat : false;


	// public properties

	this.domElement = this._canvas;
	this.context = null;

	// Debug configuration container
	this.debug = {

		/**
		 * Enables error checking and reporting when shader programs are being compiled
		 * @type {boolean}
		 */
		checkShaderErrors: true
	};

	// clearing

	this.autoClear = true;
	this.autoClearColor = true;
	this.autoClearDepth = true;
	this.autoClearStencil = true;

	// scene graph

	this.sortObjects = true;

	// user-defined clipping

	this.clippingPlanes = [];
	this.localClippingEnabled = false;

	// physically based shading

	this.gammaFactor = 2.0;	// for backwards compatibility
	this.gammaInput = false;
	this.gammaOutput = false;

	// physical lights

	this.physicallyCorrectLights = false;

	// tone mapping

	this.toneMapping = LinearToneMapping;
	this.toneMappingExposure = 1.0;
	this.toneMappingWhitePoint = 1.0;

	// morphs

	this.maxMorphTargets = 8;
	this.maxMorphNormals = 4;

	// internal properties

		this._isContextLost = false;

		// internal state cache

		this._framebuffer = null;

		this._currentRenderTarget = null;
		this._currentFramebuffer = null;
		this._currentMaterialId = - 1;

		// geometry and program caching

		this._currentGeometryProgram = {
			geometry: null,
			program: null,
			wireframe: false
		},

		this._currentCamera = null;
		this._currentArrayCamera = null;

		this._currentViewport = new Vector4();
		this._currentScissor = new Vector4();
		this._currentScissorTest = null;

		//

		this._width = this._canvas.width;
		this._height = this._canvas.height;

		this._pixelRatio = 1;

		this._viewport = new Vector4( 0, 0, this._width, this._height );
		this._scissor = new Vector4( 0, 0, this._width, this._height );
		this._scissorTest = false;

		// frustum

		this._frustum = new Frustum();

		// clipping

		this._clipping = new WebGLClipping();
		this._clippingEnabled = false;
		this._localClippingEnabled = false;

		// camera matrices cache

		this._projScreenMatrix = new Matrix4();

		this._vector3 = new Vector3();

	// initialize


	try {

		var contextAttributes = {
			alpha: this._alpha,
			depth: this._depth,
			stencil: this._stencil,
			antialias: this._antialias,
			premultipliedAlpha: this._premultipliedAlpha,
			preserveDrawingBuffer: this._preserveDrawingBuffer,
			powerPreference: this._powerPreference,
			failIfMajorPerformanceCaveat: this._failIfMajorPerformanceCaveat
		};

		// event listeners must be registered before WebGL context is created, see #12753

		this._canvas.addEventListener( 'webglcontextlost', this.onContextLost, false );
		this._canvas.addEventListener( 'webglcontextrestored', this.onContextRestore, false );

		this._gl = this._context || this._canvas.getContext( 'webgl', contextAttributes ) || this._canvas.getContext( 'experimental-webgl', contextAttributes );

		if ( this._gl === null ) {

			if ( this._canvas.getContext( 'webgl' ) !== null ) {

				throw new Error( 'Error creating WebGL context with your selected attributes.' );

			} else {

				throw new Error( 'Error creating WebGL context.' );

			}

		}

		// Some experimental-webgl implementations do not have getShaderPrecisionFormat

		if ( this._gl.getShaderPrecisionFormat === undefined ) {

			this._gl.getShaderPrecisionFormat = function () {

				return { 'rangeMin': 1, 'rangeMax': 1, 'precision': 1 };

			};

		}

	} catch ( error ) {

		console.error( 'THREE.WebGLRenderer: ' + error.message );
		throw error;

	}


	this.initGLContext();

	// vr

	this.vr = ( typeof navigator !== 'undefined' && 'xr' in navigator && 'requestDevice' in (navigator as any).xr ) ? new WebXRManager( this ) : new WebVRManager( this );

	// shadow map

	this.shadowMap = new WebGLShadowMap( this, this.objects, this.capabilities.maxTextureSize );

	// Animation Loop

	var onAnimationFrameCallback: ((time: number) => any) | null = null;

	const onAnimationFrame = ( time: number ) => {

		if ( this.vr.isPresenting() ) return;
		if ( onAnimationFrameCallback ) onAnimationFrameCallback( time );

	}

	this.animation = new WebGLAnimation();
	this.animation.setAnimationLoop( onAnimationFrame );

	if ( typeof window !== 'undefined' ) this.animation.setContext( window );




}

private animation: WebGLAnimation;

private setAnimationLoop ( callback: (time: number) => void ): void {

	this.onAnimationFrameCallback = callback;
	this.vr.setAnimationLoop( callback );

	this.animation.start();

};

private currentRenderList: any = null;
private currentRenderState: any = null;


	private _gl:   WebGLRenderingContext;

public domElement: any;
public context: any;
public debug: any;
public autoClear: any;
public autoClearColor: any;
public autoClearDepth: any;
public autoClearStencil: any;
public sortObjects: any;
public clippingPlanes: any;
public localClippingEnabled: any;
public gammaFactor: any;
public gammaInput: any;
public gammaOutput: any;
public physicallyCorrectLights: any;
public toneMapping: any;
public toneMappingExposure: any;
public toneMappingWhitePoint: any;
public maxMorphTargets: any;
public maxMorphNormals: any;

private _isContextLost: any;
private _framebuffer: any;
private _currentRenderTarget: any;
private _currentFramebuffer: any;
private _currentMaterialId: any;
private _currentGeometryProgram: any;
private _currentCamera: any;
private _currentArrayCamera: any;
private _currentViewport: Vector4;
private _currentScissor: Vector4;
private _currentScissorTest: any;
private _width: number;
private _height: number;
private _pixelRatio: number;
private _viewport: Vector4;
private _scissor: Vector4;
private _scissorTest: any;
private _frustum: any;
private _clipping: any;
private _clippingEnabled: any;
private _localClippingEnabled: any;
private _projScreenMatrix: any;
private _vector3: any;

private _canvas: HTMLCanvasElement;
private _context: any;
private _alpha: any;
private _depth: any;
private _stencil: any;
private _antialias: any;
private _premultipliedAlpha: any;
private _preserveDrawingBuffer: any;
private _powerPreference: any;
private _failIfMajorPerformanceCaveat: any;



	private extensions: WebGLExtensions;
	private capabilities: WebGLCapabilities;
	public state: any;
	private info: any;
	private properties: WebGLProperties;
	private parameters: WebGLCapabilitiesParams;
	private textures: any;
	private attributes: any;
	private geometries: any;
	private objects: any;
	private programCache: any;
	private renderLists: any;
	private renderStates: any;

	private background: any;
	private morphtargets: any;
	private bufferRenderer: any;
	private indexedBufferRenderer: any;

	public shadowMap: WebGLShadowMap;

	private utils: any;

	vr: WebXRManager | WebVRManager;

	private getTargetPixelRatio() {

		return this._currentRenderTarget === null ? this._pixelRatio : 1;

	}




	private initGLContext() {

		this.extensions = new WebGLExtensions( this._gl );

		this.capabilities = new WebGLCapabilities( this._gl, this.extensions, this.parameters );

		if ( ! this.capabilities.isWebGL2 ) {

			this.extensions.get( 'WEBGL_depth_texture' );
			this.extensions.get( 'OES_texture_float' );
			this.extensions.get( 'OES_texture_half_float' );
			this.extensions.get( 'OES_texture_half_float_linear' );
			this.extensions.get( 'OES_standard_derivatives' );
			this.extensions.get( 'OES_element_index_uint' );
			this.extensions.get( 'ANGLE_instanced_arrays' );

		}

		this.extensions.get( 'OES_texture_float_linear' );

		this.utils = new WebGLUtils( this._gl, this.extensions, this.capabilities );

		this.state = new WebGLState( this._gl, this.extensions, this.utils, this.capabilities );
		this.state.scissor( this._currentScissor.copy( this._scissor ).multiplyScalar( this._pixelRatio ) );
		this.state.viewport( this._currentViewport.copy( this._viewport ).multiplyScalar( this._pixelRatio ) );

		this.info = new WebGLInfo( this._gl );
		this.properties = new WebGLProperties();
		this.textures = new WebGLTextures( this._gl, this.extensions, state, properties, capabilities, this.utils, info );
		this.attributes = new WebGLAttributes( this._gl );
		this.geometries = new WebGLGeometries( this._gl, attributes, info );
		this.objects = new WebGLObjects( geometries, info );
		this.morphtargets = new WebGLMorphtargets( this._gl );
		this.programCache = new WebGLPrograms( this, this.extensions, capabilities, textures );
		this.renderLists = new WebGLRenderLists();
		this.renderStates = new WebGLRenderStates();

		this.background = new WebGLBackground( this, state, objects, _premultipliedAlpha );

		this.bufferRenderer = new WebGLBufferRenderer( this._gl, this.extensions, info, capabilities );
		this.indexedBufferRenderer = new WebGLIndexedBufferRenderer( this._gl, this.extensions, info, capabilities );

		this.info.programs = this.programCache.programs;

		this.context = this._gl;
	}

	// API

	getContext () {

		return this._gl;

	};

	getContextAttributes () {

		return this._gl.getContextAttributes();

	};

	forceContextLoss () {

		var extension = this.extensions.get( 'WEBGL_lose_context' );
		if ( extension ) extension.loseContext();

	};

	forceContextRestore () {

		var extension = this.extensions.get( 'WEBGL_lose_context' );
		if ( extension ) extension.restoreContext();

	};

	getPixelRatio () {

		return this._pixelRatio;

	};

	setPixelRatio ( value?: number ) {

		if ( value === undefined ) return;

		this._pixelRatio = value;

		this.setSize( this._width, this._height, false );

	};

	getSize ( target: Vector2 ) {

		if ( target === undefined ) {

			console.warn( 'WebGLRenderer: .getsize() now requires a Vector2 as an argument' );

			target = new Vector2();

		}

		return target.set( this._width, this._height );

	};

	setSize ( width: number, height: number, updateStyle?: boolean ) {

		if ( this.vr.isPresenting() ) {

			console.warn( 'THREE.WebGLRenderer: Can\'t change size while VR device is presenting.' );
			return;

		}

		this._width = width;
		this._height = height;

		this._canvas.width = width * this._pixelRatio;
		this._canvas.height = height * this._pixelRatio;

		if ( updateStyle !== false ) {

			this._canvas.style.width = width + 'px';
			this._canvas.style.height = height + 'px';

		}

		this.setViewport( 0, 0, width, height );

	};

	getDrawingBufferSize ( target: Vector2 ) {

		if ( target === undefined ) {

			console.warn( 'WebGLRenderer: .getdrawingBufferSize() now requires a Vector2 as an argument' );

			target = new Vector2();

		}

		return target.set( this._width * this._pixelRatio, this._height * this._pixelRatio );

	};

	setDrawingBufferSize ( width: number, height: number, pixelRatio: number ) {

		this._width = width;
		this._height = height;

		this._pixelRatio = pixelRatio;

		this._canvas.width = width * pixelRatio;
		this._canvas.height = height * pixelRatio;

		this.setViewport( 0, 0, width, height );

	};

	getCurrentViewport  ( target: Vector4 ) {

		if ( target === undefined ) {

			console.warn( 'WebGLRenderer: .getCurrentViewport() now requires a Vector4 as an argument' );

			target = new Vector4();

		}

		return target.copy( this._currentViewport );

	};

	getViewport ( target: Vector4 ) {

		return target.copy( this._viewport );

	};

	setViewport ( x: Vector4 , y: Vector4, width: number, height: number ): any;
	setViewport ( x: number , y: number, width: number, height: number ): any;

	// TODO(meyer) explicitly check both X and Y
	setViewport ( x: Vector4 | number, y: Vector4 | number, width: number, height: number ) {

		if ( typeof x === 'number' ) {

			this._viewport.set( x, y as number, width, height );
			
		} else {
			
			this._viewport.set( x.x, x.y, x.z, x.w );

		}

		this.state.viewport( this._currentViewport.copy( this._viewport ).multiplyScalar( this._pixelRatio ) );

	};

	getScissor ( target: Vector4 ) {

		return target.copy( this._scissor );

	};

	setScissor ( x: Vector4, y: Vector4, width: number, height: number ): any;
	setScissor ( x: number, y: number, width: number, height: number ): any;
	
	// TODO(meyer) explicitly check both X and Y
	setScissor( x: Vector4 | number, y: Vector4 | number, width: number, height: number ) {

		if ( typeof x === 'object' ) {

			this._scissor.set( x.x, x.y, x.z, x.w );

		} else {

			this._scissor.set( x, y as number, width, height );

		}

		this.state.scissor( this._currentScissor.copy( this._scissor ).multiplyScalar( this._pixelRatio ) );

	};

	getScissorTest () {

		return this._scissorTest;

	};

	setScissorTest ( boolean: boolean ) {

		this.state.setScissorTest( this._scissorTest = boolean );

	};

	// Clearing

	getClearColor () {

		return this.background.getClearColor();

	};

	setClearColor () {

		this.background.setClearColor.apply( this.background, arguments );

	};

	getClearAlpha () {

		return this.background.getClearAlpha();

	};

	setClearAlpha () {

		this.background.setClearAlpha.apply( this.background, arguments );

	};

	clear ( color?: boolean, depth?: boolean, stencil?: boolean ) {

		var bits = 0;

		if ( color === undefined || color ) bits |= this._gl.COLOR_BUFFER_BIT;
		if ( depth === undefined || depth ) bits |= this._gl.DEPTH_BUFFER_BIT;
		if ( stencil === undefined || stencil ) bits |= this._gl.STENCIL_BUFFER_BIT;

		this._gl.clear( bits );

	};

	clearColor  () {

		this.clear( true, false, false );

	};

	clearDepth () {

		this.clear( false, true, false );

	};

	clearStencil () {

		this.clear( false, false, true );

	};

	//

	dispose () {

		this._canvas.removeEventListener( 'webglcontextlost', this.onContextLost, false );
		this._canvas.removeEventListener( 'webglcontextrestored', this.onContextRestore, false );

		this.renderLists.dispose();
		this.renderStates.dispose();
		this.properties.dispose();
		this.objects.dispose();

		this.vr.dispose();

		this.animation.stop();

	};

	// Events

	private onContextLost( event: Event ) {

		event.preventDefault();

		console.log( 'THREE.WebGLRenderer: Context Lost.' );

		this._isContextLost = true;

	}

	private onContextRestore( /* event */ ) {

		console.log( 'THREE.WebGLRenderer: Context Restored.' );

		this._isContextLost = false;

		this.initGLContext();

	}

	private onMaterialDispose( event: Event ) {

		var material = event.target as any as Material;

		material.removeEventListener( 'dispose', this.onMaterialDispose );

		this.deallocateMaterial( material );

	}

	// Buffer deallocation

	private deallocateMaterial( material: Material ) {

		this.releaseMaterialProgramReference( material );

		this.properties.remove( material );

	}


	private releaseMaterialProgramReference( material: Material ) {

		var programInfo = this.properties.get( material ).program;

		(material as any).program = undefined;

		if ( programInfo !== undefined ) {

			this.programCache.releaseProgram( programInfo );

		}

	}

	// Buffer rendering

	private renderObjectImmediate( object: any, program: any ) {

		object.render(  ( object: any ) => {

			this.renderBufferImmediate( object, program );

		} );

	}

	private renderBufferImmediate ( object: any, program: any ) {

		this.state.initAttributes();

		var buffers = this.properties.get( object );

		if ( object.hasPositions && ! buffers.position ) buffers.position = this._gl.createBuffer();
		if ( object.hasNormals && ! buffers.normal ) buffers.normal = this._gl.createBuffer();
		if ( object.hasUvs && ! buffers.uv ) buffers.uv = this._gl.createBuffer();
		if ( object.hasColors && ! buffers.color ) buffers.color = this._gl.createBuffer();

		var programAttributes = program.getAttributes();

		if ( object.hasPositions ) {

			this._gl.bindBuffer( this._gl.ARRAY_BUFFER, buffers.position );
			this._gl.bufferData( this._gl.ARRAY_BUFFER, object.positionArray, this._gl.DYNAMIC_DRAW );

			this.state.enableAttribute( programAttributes.position );
			this._gl.vertexAttribPointer( programAttributes.position, 3, this._gl.FLOAT, false, 0, 0 );

		}

		if ( object.hasNormals ) {

			this._gl.bindBuffer( this._gl.ARRAY_BUFFER, buffers.normal );
			this._gl.bufferData( this._gl.ARRAY_BUFFER, object.normalArray, this._gl.DYNAMIC_DRAW );

			this.state.enableAttribute( programAttributes.normal );
			this._gl.vertexAttribPointer( programAttributes.normal, 3, this._gl.FLOAT, false, 0, 0 );

		}

		if ( object.hasUvs ) {

			this._gl.bindBuffer( this._gl.ARRAY_BUFFER, buffers.uv );
			this._gl.bufferData( this._gl.ARRAY_BUFFER, object.uvArray, this._gl.DYNAMIC_DRAW );

			this.state.enableAttribute( programAttributes.uv );
			this._gl.vertexAttribPointer( programAttributes.uv, 2, this._gl.FLOAT, false, 0, 0 );

		}

		if ( object.hasColors ) {

			this._gl.bindBuffer( this._gl.ARRAY_BUFFER, buffers.color );
			this._gl.bufferData( this._gl.ARRAY_BUFFER, object.colorArray, this._gl.DYNAMIC_DRAW );

			this.state.enableAttribute( programAttributes.color );
			this._gl.vertexAttribPointer( programAttributes.color, 3, this._gl.FLOAT, false, 0, 0 );

		}

		this.state.disableUnusedAttributes();

		this._gl.drawArrays( this._gl.TRIANGLES, 0, object.count );

		object.count = 0;

	};

	public renderBufferDirect ( camera: Camera, fog: any, geometry: any, material: Material, object: any, group: any ) {

		var frontFaceCW = ( object.isMesh && object.matrixWorld.determinant() < 0 );

		this.state.setMaterial( material, frontFaceCW );

		var program = this.setProgram( camera, fog, material, object );

		var updateBuffers = false;

		if ( this._currentGeometryProgram.geometry !== geometry.id ||
			this._currentGeometryProgram.program !== program.id ||
			this._currentGeometryProgram.wireframe !== ( material.wireframe === true ) ) {

			this._currentGeometryProgram.geometry = geometry.id;
			this._currentGeometryProgram.program = program.id;
			this._currentGeometryProgram.wireframe = material.wireframe === true;
			updateBuffers = true;

		}

		if ( object.morphTargetInfluences ) {

			this.morphtargets.update( object, geometry, material, program );

			updateBuffers = true;

		}

		//

		var index = geometry.index;
		var position = geometry.attributes.position;
		var rangeFactor = 1;

		if ( material.wireframe === true ) {

			index = this.geometries.getWireframeAttribute( geometry );
			rangeFactor = 2;

		}

		var attribute;
		var renderer = this.bufferRenderer;

		if ( index !== null ) {

			attribute = this.attributes.get( index );

			renderer = this.indexedBufferRenderer;
			renderer.setIndex( attribute );

		}

		if ( updateBuffers ) {

			this.setupVertexAttributes( material, program, geometry );

			if ( index !== null ) {

				this._gl.bindBuffer( this._gl.ELEMENT_ARRAY_BUFFER, attribute.buffer );

			}

		}

		//

		var dataCount = Infinity;

		if ( index !== null ) {

			dataCount = index.count;

		} else if ( position !== undefined ) {

			dataCount = position.count;

		}

		var rangeStart = geometry.drawRange.start * rangeFactor;
		var rangeCount = geometry.drawRange.count * rangeFactor;

		var groupStart = group !== null ? group.start * rangeFactor : 0;
		var groupCount = group !== null ? group.count * rangeFactor : Infinity;

		var drawStart = Math.max( rangeStart, groupStart );
		var drawEnd = Math.min( dataCount, rangeStart + rangeCount, groupStart + groupCount ) - 1;

		var drawCount = Math.max( 0, drawEnd - drawStart + 1 );

		if ( drawCount === 0 ) return;

		//

		if ( object.isMesh ) {

			if ( material.wireframe === true ) {

				this.state.setLineWidth( material.wireframeLinewidth * this.getTargetPixelRatio() );
				renderer.setMode( this._gl.LINES );

			} else {

				switch ( object.drawMode ) {

					case TrianglesDrawMode:
						renderer.setMode( this._gl.TRIANGLES );
						break;

					case TriangleStripDrawMode:
						renderer.setMode( this._gl.TRIANGLE_STRIP );
						break;

					case TriangleFanDrawMode:
						renderer.setMode( this._gl.TRIANGLE_FAN );
						break;

				}

			}


		} else if ( object.isLine ) {

			var lineWidth = material.linewidth;

			if ( lineWidth === undefined ) lineWidth = 1; // Not using Line*Material

			this.state.setLineWidth( lineWidth * this.getTargetPixelRatio() );

			if ( object.isLineSegments ) {

				renderer.setMode( this._gl.LINES );

			} else if ( object.isLineLoop ) {

				renderer.setMode( this._gl.LINE_LOOP );

			} else {

				renderer.setMode( this._gl.LINE_STRIP );

			}

		} else if ( object.isPoints ) {

			renderer.setMode( this._gl.POINTS );

		} else if ( object.isSprite ) {

			renderer.setMode( this._gl.TRIANGLES );

		}

		if ( geometry && geometry.isInstancedBufferGeometry ) {

			if ( geometry.maxInstancedCount > 0 ) {

				renderer.renderInstances( geometry, drawStart, drawCount );

			}

		} else {

			renderer.render( drawStart, drawCount );

		}

	};

	private setupVertexAttributes( material: any, program: any, geometry: any ) {

		if ( geometry && geometry.isInstancedBufferGeometry && ! this.capabilities.isWebGL2 ) {

			if ( this.extensions.get( 'ANGLE_instanced_arrays' ) === null ) {

				console.error( 'THREE.WebGLRenderer.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
				return;

			}

		}

		this.state.initAttributes();

		var geometryAttributes = geometry.attributes;

		var programAttributes = program.getAttributes();

		var materialDefaultAttributeValues = material.defaultAttributeValues;

		for ( var name in programAttributes ) {

			var programAttribute = programAttributes[ name ];

			if ( programAttribute >= 0 ) {

				var geometryAttribute = geometryAttributes[ name ];

				if ( geometryAttribute !== undefined ) {

					var normalized = geometryAttribute.normalized;
					var size = geometryAttribute.itemSize;

					var attribute = this.attributes.get( geometryAttribute );

					// TODO Attribute may not be available on context restore

					if ( attribute === undefined ) continue;

					var buffer = attribute.buffer;
					var type = attribute.type;
					var bytesPerElement = attribute.bytesPerElement;

					if ( geometryAttribute.isInterleavedBufferAttribute ) {

						var data = geometryAttribute.data;
						var stride = data.stride;
						var offset = geometryAttribute.offset;

						if ( data && data.isInstancedInterleavedBuffer ) {

							this.state.enableAttributeAndDivisor( programAttribute, data.meshPerAttribute );

							if ( geometry.maxInstancedCount === undefined ) {

								geometry.maxInstancedCount = data.meshPerAttribute * data.count;

							}

						} else {

							this.state.enableAttribute( programAttribute );

						}

						this._gl.bindBuffer( this._gl.ARRAY_BUFFER, buffer );
						this._gl.vertexAttribPointer( programAttribute, size, type, normalized, stride * bytesPerElement, offset * bytesPerElement );

					} else {

						if ( geometryAttribute.isInstancedBufferAttribute ) {

							this.state.enableAttributeAndDivisor( programAttribute, geometryAttribute.meshPerAttribute );

							if ( geometry.maxInstancedCount === undefined ) {

								geometry.maxInstancedCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

							}

						} else {

							this.state.enableAttribute( programAttribute );

						}

						this._gl.bindBuffer( this._gl.ARRAY_BUFFER, buffer );
						this._gl.vertexAttribPointer( programAttribute, size, type, normalized, 0, 0 );

					}

				} else if ( materialDefaultAttributeValues !== undefined ) {

					var value = materialDefaultAttributeValues[ name ];

					if ( value !== undefined ) {

						switch ( value.length ) {

							case 2:
								this._gl.vertexAttrib2fv( programAttribute, value );
								break;

							case 3:
								this._gl.vertexAttrib3fv( programAttribute, value );
								break;

							case 4:
								this._gl.vertexAttrib4fv( programAttribute, value );
								break;

							default:
								this._gl.vertexAttrib1fv( programAttribute, value );

						}

					}

				}

			}

		}

		this.state.disableUnusedAttributes();

	}

	// Compile

	compile ( scene: any, camera: Camera ) {

		this.currentRenderState = this.renderStates.get( scene, camera );
		this.currentRenderState.init();

		scene.traverse( ( object: any ) => {

			if ( object.isLight ) {

				this.currentRenderState.pushLight( object );

				if ( object.castShadow ) {

					this.currentRenderState.pushShadow( object );

				}

			}

		} );

		this.currentRenderState.setupLights( camera );

		scene.traverse( ( object: any ) => {

			if ( object.material ) {

				if ( Array.isArray( object.material ) ) {

					for ( var i = 0; i < object.material.length; i ++ ) {

						this.initMaterial( object.material[ i ], scene.fog, object );

					}

				} else {

					this.initMaterial( object.material, scene.fog, object );

				}

			}

		} );

	};



	// Rendering

	render ( scene: any, camera: Camera ) {

		var renderTarget, forceClear;

		if ( arguments[ 2 ] !== undefined ) {

			console.warn( 'THREE.WebGLRenderer.render(): the renderTarget argument has been removed. Use .setRenderTarget() instead.' );
			renderTarget = arguments[ 2 ];

		}

		if ( arguments[ 3 ] !== undefined ) {

			console.warn( 'THREE.WebGLRenderer.render(): the forceClear argument has been removed. Use .clear() instead.' );
			forceClear = arguments[ 3 ];

		}

		if ( ! ( camera && camera.isCamera ) ) {

			console.error( 'THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.' );
			return;

		}

		if ( this._isContextLost ) return;

		// reset caching for this frame

		this._currentGeometryProgram.geometry = null;
		this._currentGeometryProgram.program = null;
		this._currentGeometryProgram.wireframe = false;
		this._currentMaterialId = - 1;
		this._currentCamera = null;

		// update scene graph

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

		// update camera matrices and frustum

		if ( camera.parent === null ) camera.updateMatrixWorld();

		if ( this.vr.enabled ) {

			camera = this.vr.getCamera( camera );

		}

		//

		this.currentRenderState = this.renderStates.get( scene, camera );
		this.currentRenderState.init();

		scene.onBeforeRender( this, scene, camera, renderTarget || this._currentRenderTarget );

		this._projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		this._frustum.setFromMatrix( this._projScreenMatrix );

		this._localClippingEnabled = this.localClippingEnabled;
		this._clippingEnabled = this._clipping.init( this.clippingPlanes, this._localClippingEnabled, camera );

		this.currentRenderList = this.renderLists.get( scene, camera );
		this.currentRenderList.init();

		this.projectObject( scene, camera, 0, this.sortObjects );

		if ( this.sortObjects === true ) {

			this.currentRenderList.sort();

		}

		//

		if ( this._clippingEnabled ) this._clipping.beginShadows();

		var shadowsArray = this.currentRenderState.state.shadowsArray;

		this.shadowMap.render( shadowsArray, scene, camera );

		this.currentRenderState.setupLights( camera );

		if ( this._clippingEnabled ) this._clipping.endShadows();

		//

		if ( this.info.autoReset ) this.info.reset();

		if ( renderTarget !== undefined ) {

			this.setRenderTarget( renderTarget );

		}

		//

		this.background.render( this.currentRenderList, scene, camera, forceClear );

		// render scene

		var opaqueObjects = this.currentRenderList.opaque;
		var transparentObjects = this.currentRenderList.transparent;

		if ( scene.overrideMaterial ) {

			var overrideMaterial = scene.overrideMaterial;

			if ( opaqueObjects.length ) this.renderObjects( opaqueObjects, scene, camera, overrideMaterial );
			if ( transparentObjects.length ) this.renderObjects( transparentObjects, scene, camera, overrideMaterial );

		} else {

			// opaque pass (front-to-back order)

			if ( opaqueObjects.length ) this.renderObjects( opaqueObjects, scene, camera );

			// transparent pass (back-to-front order)

			if ( transparentObjects.length ) this.renderObjects( transparentObjects, scene, camera );

		}

		//

		scene.onAfterRender( this, scene, camera );

		//

		if ( this._currentRenderTarget !== null ) {

			// Generate mipmap if we're using any kind of mipmap filtering

			this.textures.updateRenderTargetMipmap( this._currentRenderTarget );

			// resolve multisample renderbuffers to a single-sample texture if necessary

			this.textures.updateMultisampleRenderTarget( this._currentRenderTarget );

		}

		// Ensure depth buffer writing is enabled so it can be cleared on next render

		this.state.buffers.depth.setTest( true );
		this.state.buffers.depth.setMask( true );
		this.state.buffers.color.setMask( true );

		this.state.setPolygonOffset( false );

		if ( this.vr.enabled ) {

			this.vr.submitFrame();

		}

		// this._gl.finish();

		this.currentRenderList = null;
		this.currentRenderState = null;

	};

	private projectObject( object: any, camera: any, groupOrder: number, sortObjects: any ) {

		if ( object.visible === false ) return;

		var visible = object.layers.test( camera.layers );

		if ( visible ) {

			if ( object.isGroup ) {

				groupOrder = object.renderOrder;

			} else if ( object.isLight ) {

				this.currentRenderState.pushLight( object );

				if ( object.castShadow ) {

					this.currentRenderState.pushShadow( object );

				}

			} else if ( object.isSprite ) {

				if ( ! object.frustumCulled || this._frustum.intersectsSprite( object ) ) {

					if ( sortObjects ) {

						this._vector3.setFromMatrixPosition( object.matrixWorld )
							.applyMatrix4( this._projScreenMatrix );

					}

					var geometry = this.objects.update( object );
					var material = object.material;

					if ( material.visible ) {

						this.currentRenderList.push( object, geometry, material, groupOrder, this._vector3.z, null );

					}

				}

			} else if ( object.isImmediateRenderObject ) {

				if ( sortObjects ) {

					this._vector3.setFromMatrixPosition( object.matrixWorld )
						.applyMatrix4( this._projScreenMatrix );

				}

				this.currentRenderList.push( object, null, object.material, groupOrder, this._vector3.z, null );

			} else if ( object.isMesh || object.isLine || object.isPoints ) {

				if ( object.isSkinnedMesh ) {

					object.skeleton.update();

				}

				if ( ! object.frustumCulled || this._frustum.intersectsObject( object ) ) {

					if ( sortObjects ) {

						this._vector3.setFromMatrixPosition( object.matrixWorld )
							.applyMatrix4( this._projScreenMatrix );

					}

					var geometry = this.objects.update( object );
					var material = object.material;

					if ( Array.isArray( material ) ) {

						var groups = geometry.groups;

						for ( var i = 0, l = groups.length; i < l; i ++ ) {

							var group = groups[ i ];
							var groupMaterial = material[ group.materialIndex ];

							if ( groupMaterial && groupMaterial.visible ) {

								this.currentRenderList.push( object, geometry, groupMaterial, groupOrder, this._vector3.z, group );

							}

						}

					} else if ( material.visible ) {

						this.currentRenderList.push( object, geometry, material, groupOrder, this._vector3.z, null );

					}

				}

			}

		}

		var children = object.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			this.projectObject( children[ i ], camera, groupOrder, sortObjects );

		}

	}

	private renderObjects( renderList: any, scene: any, camera: any, overrideMaterial?: any ) {

		for ( var i = 0, l = renderList.length; i < l; i ++ ) {

			var renderItem = renderList[ i ];

			var object = renderItem.object;
			var geometry = renderItem.geometry;
			var material = overrideMaterial === undefined ? renderItem.material : overrideMaterial;
			var group = renderItem.group;

			if ( camera.isArrayCamera ) {

				this._currentArrayCamera = camera;

				var cameras = camera.cameras;

				for ( var j = 0, jl = cameras.length; j < jl; j ++ ) {

					var camera2 = cameras[ j ];

					if ( object.layers.test( camera2.layers ) ) {

						this.state.viewport( this._currentViewport.copy( camera2.viewport ) );

						this.currentRenderState.setupLights( camera2 );

						this.renderObject( object, scene, camera2, geometry, material, group );

					}

				}

			} else {

				_currentArrayCamera = null;

				this.renderObject( object, scene, camera, geometry, material, group );

			}

		}

	}

	private renderObject( object, scene, camera, geometry, material, group ) {

		object.onBeforeRender( this, scene, camera, geometry, material, group );
		currentRenderState = renderStates.get( scene, _currentArrayCamera || camera );

		object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

		if ( object.isImmediateRenderObject ) {

			this.state.setMaterial( material );

			var program = setProgram( camera, scene.fog, material, object );

			this._currentGeometryProgram.geometry = null;
			this._currentGeometryProgram.program = null;
			this._currentGeometryProgram.wireframe = false;

			this.renderObjectImmediate( object, program );

		} else {

			this.renderBufferDirect( camera, scene.fog, geometry, material, object, group );

		}

		object.onAfterRender( this, scene, camera, geometry, material, group );
		currentRenderState = renderStates.get( scene, _currentArrayCamera || camera );

	}

	private initMaterial( material, fog, object ) {

		var materialProperties = properties.get( material );

		var lights = this.currentRenderState.state.lights;
		var shadowsArray = this.currentRenderState.state.shadowsArray;

		var lightsHash = materialProperties.lightsHash;
		var lightsStateHash = lights.state.hash;

		var parameters = programCache.getParameters(
			material, lights.state, shadowsArray, fog, _clipping.numPlanes, _clipping.numIntersection, object );

		var code = programCache.getProgramCode( material, parameters );

		var program = materialProperties.program;
		var programChange = true;

		if ( program === undefined ) {

			// new material
			material.addEventListener( 'dispose', onMaterialDispose );

		} else if ( program.code !== code ) {

			// changed glsl or parameters
			releaseMaterialProgramReference( material );

		} else if ( lightsHash.stateID !== lightsStateHash.stateID ||
			lightsHash.directionalLength !== lightsStateHash.directionalLength ||
			lightsHash.pointLength !== lightsStateHash.pointLength ||
			lightsHash.spotLength !== lightsStateHash.spotLength ||
			lightsHash.rectAreaLength !== lightsStateHash.rectAreaLength ||
			lightsHash.hemiLength !== lightsStateHash.hemiLength ||
			lightsHash.shadowsLength !== lightsStateHash.shadowsLength ) {

			lightsHash.stateID = lightsStateHash.stateID;
			lightsHash.directionalLength = lightsStateHash.directionalLength;
			lightsHash.pointLength = lightsStateHash.pointLength;
			lightsHash.spotLength = lightsStateHash.spotLength;
			lightsHash.rectAreaLength = lightsStateHash.rectAreaLength;
			lightsHash.hemiLength = lightsStateHash.hemiLength;
			lightsHash.shadowsLength = lightsStateHash.shadowsLength;

			programChange = false;

		} else if ( parameters.shaderID !== undefined ) {

			// same glsl and uniform list
			return;

		} else {

			// only rebuild uniform list
			programChange = false;

		}

		if ( programChange ) {

			if ( parameters.shaderID ) {

				var shader = ShaderLib[ parameters.shaderID ];

				materialProperties.shader = {
					name: material.type,
					uniforms: cloneUniforms( shader.uniforms ),
					vertexShader: shader.vertexShader,
					fragmentShader: shader.fragmentShader
				};

			} else {

				materialProperties.shader = {
					name: material.type,
					uniforms: material.uniforms,
					vertexShader: material.vertexShader,
					fragmentShader: material.fragmentShader
				};

			}

			material.onBeforeCompile( materialProperties.shader, this );

			// Computing code again as onBeforeCompile may have changed the shaders
			code = programCache.getProgramCode( material, parameters );

			program = programCache.acquireProgram( material, materialProperties.shader, parameters, code );

			materialProperties.program = program;
			material.program = program;

		}

		var programAttributes = program.getAttributes();

		if ( material.morphTargets ) {

			material.numSupportedMorphTargets = 0;

			for ( var i = 0; i < this.maxMorphTargets; i ++ ) {

				if ( programAttributes[ 'morphTarget' + i ] >= 0 ) {

					material.numSupportedMorphTargets ++;

				}

			}

		}

		if ( material.morphNormals ) {

			material.numSupportedMorphNormals = 0;

			for ( var i = 0; i < this.maxMorphNormals; i ++ ) {

				if ( programAttributes[ 'morphNormal' + i ] >= 0 ) {

					material.numSupportedMorphNormals ++;

				}

			}

		}

		var uniforms = materialProperties.shader.uniforms;

		if ( ! material.isShaderMaterial &&
			! material.isRawShaderMaterial ||
			material.clipping === true ) {

			materialProperties.numClippingPlanes = _clipping.numPlanes;
			materialProperties.numIntersection = _clipping.numIntersection;
			uniforms.clippingPlanes = _clipping.uniform;

		}

		materialProperties.fog = fog;

		// store the light setup it was created for
		if ( lightsHash === undefined ) {

			materialProperties.lightsHash = lightsHash = {};

		}

		lightsHash.stateID = lightsStateHash.stateID;
		lightsHash.directionalLength = lightsStateHash.directionalLength;
		lightsHash.pointLength = lightsStateHash.pointLength;
		lightsHash.spotLength = lightsStateHash.spotLength;
		lightsHash.rectAreaLength = lightsStateHash.rectAreaLength;
		lightsHash.hemiLength = lightsStateHash.hemiLength;
		lightsHash.shadowsLength = lightsStateHash.shadowsLength;

		if ( material.lights ) {

			// wire up the material to this renderer's lighting state

			uniforms.ambientLightColor.value = lights.state.ambient;
			uniforms.lightProbe.value = lights.state.probe;
			uniforms.directionalLights.value = lights.state.directional;
			uniforms.spotLights.value = lights.state.spot;
			uniforms.rectAreaLights.value = lights.state.rectArea;
			uniforms.pointLights.value = lights.state.point;
			uniforms.hemisphereLights.value = lights.state.hemi;

			uniforms.directionalShadowMap.value = lights.state.directionalShadowMap;
			uniforms.directionalShadowMatrix.value = lights.state.directionalShadowMatrix;
			uniforms.spotShadowMap.value = lights.state.spotShadowMap;
			uniforms.spotShadowMatrix.value = lights.state.spotShadowMatrix;
			uniforms.pointShadowMap.value = lights.state.pointShadowMap;
			uniforms.pointShadowMatrix.value = lights.state.pointShadowMatrix;
			// TODO (abelnation): add area lights shadow info to uniforms

		}

		var progUniforms = materialProperties.program.getUniforms(),
			uniformsList =
				WebGLUniforms.seqWithValue( progUniforms.seq, uniforms );

		materialProperties.uniformsList = uniformsList;

	}

	private setProgram( camera, fog, material, object ) {

		textures.resetTextureUnits();

		var materialProperties = properties.get( material );
		var lights = this.currentRenderState.state.lights;

		var lightsHash = materialProperties.lightsHash;
		var lightsStateHash = lights.state.hash;

		if ( this._clippingEnabled ) {

			if ( _localClippingEnabled || camera !== _currentCamera ) {

				var useCache =
					camera === _currentCamera &&
					material.id === _currentMaterialId;

				// we might want to call this function with some ClippingGroup
				// object instead of the material, once it becomes feasible
				// (#8465, #8379)
				_clipping.setState(
					material.clippingPlanes, material.clipIntersection, material.clipShadows,
					camera, materialProperties, useCache );

			}

		}

		if ( material.needsUpdate === false ) {

			if ( materialProperties.program === undefined ) {

				material.needsUpdate = true;

			} else if ( material.fog && materialProperties.fog !== fog ) {

				material.needsUpdate = true;

			} else if ( material.lights && ( lightsHash.stateID !== lightsStateHash.stateID ||
				lightsHash.directionalLength !== lightsStateHash.directionalLength ||
				lightsHash.pointLength !== lightsStateHash.pointLength ||
				lightsHash.spotLength !== lightsStateHash.spotLength ||
				lightsHash.rectAreaLength !== lightsStateHash.rectAreaLength ||
				lightsHash.hemiLength !== lightsStateHash.hemiLength ||
				lightsHash.shadowsLength !== lightsStateHash.shadowsLength ) ) {

				material.needsUpdate = true;

			} else if ( materialProperties.numClippingPlanes !== undefined &&
				( materialProperties.numClippingPlanes !== _clipping.numPlanes ||
				materialProperties.numIntersection !== _clipping.numIntersection ) ) {

				material.needsUpdate = true;

			}

		}

		if ( material.needsUpdate ) {

			initMaterial( material, fog, object );
			material.needsUpdate = false;

		}

		var refreshProgram = false;
		var refreshMaterial = false;
		var refreshLights = false;

		var program = materialProperties.program,
			p_uniforms = program.getUniforms(),
			m_uniforms = materialProperties.shader.uniforms;

		if ( state.useProgram( program.program ) ) {

			refreshProgram = true;
			refreshMaterial = true;
			refreshLights = true;

		}

		if ( material.id !== _currentMaterialId ) {

			_currentMaterialId = material.id;

			refreshMaterial = true;

		}

		if ( refreshProgram || _currentCamera !== camera ) {

			p_uniforms.setValue( this._gl, 'projectionMatrix', camera.projectionMatrix );

			if ( capabilities.logarithmicDepthBuffer ) {

				p_uniforms.setValue( this._gl, 'logDepthBufFC',
					2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 ) );

			}

			if ( _currentCamera !== camera ) {

				_currentCamera = camera;

				// lighting uniforms depend on the camera so enforce an update
				// now, in case this material supports lights - or later, when
				// the next material that does gets activated:

				refreshMaterial = true;		// set to true on material change
				refreshLights = true;		// remains set until update done

			}

			// load material specific uniforms
			// (shader material also gets them for the sake of genericity)

			if ( material.isShaderMaterial ||
				material.isMeshPhongMaterial ||
				material.isMeshStandardMaterial ||
				material.envMap ) {

				var uCamPos = p_uniforms.map.cameraPosition;

				if ( uCamPos !== undefined ) {

					uCamPos.setValue( this._gl,
						this._vector3.setFromMatrixPosition( camera.matrixWorld ) );

				}

			}

			if ( material.isMeshPhongMaterial ||
				material.isMeshLambertMaterial ||
				material.isMeshBasicMaterial ||
				material.isMeshStandardMaterial ||
				material.isShaderMaterial ||
				material.skinning ) {

				p_uniforms.setValue( this._gl, 'viewMatrix', camera.matrixWorldInverse );

			}

		}

		// skinning uniforms must be set even if material didn't change
		// auto-setting of texture unit for bone texture must go before other textures
		// not sure why, but otherwise weird things happen

		if ( material.skinning ) {

			p_uniforms.setOptional( this._gl, object, 'bindMatrix' );
			p_uniforms.setOptional( this._gl, object, 'bindMatrixInverse' );

			var skeleton = object.skeleton;

			if ( skeleton ) {

				var bones = skeleton.bones;

				if ( capabilities.floatVertexTextures ) {

					if ( skeleton.boneTexture === undefined ) {

						// layout (1 matrix = 4 pixels)
						//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
						//  with  8x8  pixel texture max   16 bones * 4 pixels =  (8 * 8)
						//       16x16 pixel texture max   64 bones * 4 pixels = (16 * 16)
						//       32x32 pixel texture max  256 bones * 4 pixels = (32 * 32)
						//       64x64 pixel texture max 1024 bones * 4 pixels = (64 * 64)


						var size = Math.sqrt( bones.length * 4 ); // 4 pixels needed for 1 matrix
						size = _Math.ceilPowerOfTwo( size );
						size = Math.max( size, 4 );

						var boneMatrices = new Float32Array( size * size * 4 ); // 4 floats per RGBA pixel
						boneMatrices.set( skeleton.boneMatrices ); // copy current values

						var boneTexture = new DataTexture( boneMatrices, size, size, RGBAFormat, FloatType );
						boneTexture.needsUpdate = true;

						skeleton.boneMatrices = boneMatrices;
						skeleton.boneTexture = boneTexture;
						skeleton.boneTextureSize = size;

					}

					p_uniforms.setValue( this._gl, 'boneTexture', skeleton.boneTexture, textures );
					p_uniforms.setValue( this._gl, 'boneTextureSize', skeleton.boneTextureSize );

				} else {

					p_uniforms.setOptional( this._gl, skeleton, 'boneMatrices' );

				}

			}

		}

		if ( refreshMaterial ) {

			p_uniforms.setValue( this._gl, 'toneMappingExposure', this.toneMappingExposure );
			p_uniforms.setValue( this._gl, 'toneMappingWhitePoint', this.toneMappingWhitePoint );

			if ( material.lights ) {

				// the current material requires lighting info

				// note: all lighting uniforms are always set correctly
				// they simply reference the renderer's state for their
				// values
				//
				// use the current material's .needsUpdate flags to set
				// the GL state when required

				markUniformsLightsNeedsUpdate( m_uniforms, refreshLights );

			}

			// refresh uniforms common to several materials

			if ( fog && material.fog ) {

				refreshUniformsFog( m_uniforms, fog );

			}

			if ( material.isMeshBasicMaterial ) {

				refreshUniformsCommon( m_uniforms, material );

			} else if ( material.isMeshLambertMaterial ) {

				refreshUniformsCommon( m_uniforms, material );
				refreshUniformsLambert( m_uniforms, material );

			} else if ( material.isMeshPhongMaterial ) {

				refreshUniformsCommon( m_uniforms, material );

				if ( material.isMeshToonMaterial ) {

					refreshUniformsToon( m_uniforms, material );

				} else {

					refreshUniformsPhong( m_uniforms, material );

				}

			} else if ( material.isMeshStandardMaterial ) {

				refreshUniformsCommon( m_uniforms, material );

				if ( material.isMeshPhysicalMaterial ) {

					refreshUniformsPhysical( m_uniforms, material );

				} else {

					refreshUniformsStandard( m_uniforms, material );

				}

			} else if ( material.isMeshMatcapMaterial ) {

				refreshUniformsCommon( m_uniforms, material );

				refreshUniformsMatcap( m_uniforms, material );

			} else if ( material.isMeshDepthMaterial ) {

				refreshUniformsCommon( m_uniforms, material );
				refreshUniformsDepth( m_uniforms, material );

			} else if ( material.isMeshDistanceMaterial ) {

				refreshUniformsCommon( m_uniforms, material );
				refreshUniformsDistance( m_uniforms, material );

			} else if ( material.isMeshNormalMaterial ) {

				refreshUniformsCommon( m_uniforms, material );
				refreshUniformsNormal( m_uniforms, material );

			} else if ( material.isLineBasicMaterial ) {

				refreshUniformsLine( m_uniforms, material );

				if ( material.isLineDashedMaterial ) {

					refreshUniformsDash( m_uniforms, material );

				}

			} else if ( material.isPointsMaterial ) {

				refreshUniformsPoints( m_uniforms, material );

			} else if ( material.isSpriteMaterial ) {

				refreshUniformsSprites( m_uniforms, material );

			} else if ( material.isShadowMaterial ) {

				m_uniforms.color.value.copy( material.color );
				m_uniforms.opacity.value = material.opacity;

			}

			// RectAreaLight Texture
			// TODO (mrdoob): Find a nicer implementation

			if ( m_uniforms.ltc_1 !== undefined ) m_uniforms.ltc_1.value = UniformsLib.LTC_1;
			if ( m_uniforms.ltc_2 !== undefined ) m_uniforms.ltc_2.value = UniformsLib.LTC_2;

			WebGLUniforms.upload( this._gl, materialProperties.uniformsList, m_uniforms, textures );

		}

		if ( material.isShaderMaterial && material.uniformsNeedUpdate === true ) {

			WebGLUniforms.upload( this._gl, materialProperties.uniformsList, m_uniforms, textures );
			material.uniformsNeedUpdate = false;

		}

		if ( material.isSpriteMaterial ) {

			p_uniforms.setValue( this._gl, 'center', object.center );

		}

		// common matrices

		p_uniforms.setValue( this._gl, 'modelViewMatrix', object.modelViewMatrix );
		p_uniforms.setValue( this._gl, 'normalMatrix', object.normalMatrix );
		p_uniforms.setValue( this._gl, 'modelMatrix', object.matrixWorld );

		return program;

	}

	// Uniforms (refresh uniforms objects)

	private refreshUniformsCommon( uniforms, material ) {

		uniforms.opacity.value = material.opacity;

		if ( material.color ) {

			uniforms.diffuse.value.copy( material.color );

		}

		if ( material.emissive ) {

			uniforms.emissive.value.copy( material.emissive ).multiplyScalar( material.emissiveIntensity );

		}

		if ( material.map ) {

			uniforms.map.value = material.map;

		}

		if ( material.alphaMap ) {

			uniforms.alphaMap.value = material.alphaMap;

		}

		if ( material.specularMap ) {

			uniforms.specularMap.value = material.specularMap;

		}

		if ( material.envMap ) {

			uniforms.envMap.value = material.envMap;

			// don't flip CubeTexture envMaps, flip everything else:
			//  WebGLRenderTargetCube will be flipped for backwards compatibility
			//  WebGLRenderTargetCube.texture will be flipped because it's a Texture and NOT a CubeTexture
			// this check must be handled differently, or removed entirely, if WebGLRenderTargetCube uses a CubeTexture in the future
			uniforms.flipEnvMap.value = material.envMap.isCubeTexture ? - 1 : 1;

			uniforms.reflectivity.value = material.reflectivity;
			uniforms.refractionRatio.value = material.refractionRatio;

			uniforms.maxMipLevel.value = properties.get( material.envMap ).__maxMipLevel;

		}

		if ( material.lightMap ) {

			uniforms.lightMap.value = material.lightMap;
			uniforms.lightMapIntensity.value = material.lightMapIntensity;

		}

		if ( material.aoMap ) {

			uniforms.aoMap.value = material.aoMap;
			uniforms.aoMapIntensity.value = material.aoMapIntensity;

		}

		// uv repeat and offset setting priorities
		// 1. color map
		// 2. specular map
		// 3. normal map
		// 4. bump map
		// 5. alpha map
		// 6. emissive map

		var uvScaleMap;

		if ( material.map ) {

			uvScaleMap = material.map;

		} else if ( material.specularMap ) {

			uvScaleMap = material.specularMap;

		} else if ( material.displacementMap ) {

			uvScaleMap = material.displacementMap;

		} else if ( material.normalMap ) {

			uvScaleMap = material.normalMap;

		} else if ( material.bumpMap ) {

			uvScaleMap = material.bumpMap;

		} else if ( material.roughnessMap ) {

			uvScaleMap = material.roughnessMap;

		} else if ( material.metalnessMap ) {

			uvScaleMap = material.metalnessMap;

		} else if ( material.alphaMap ) {

			uvScaleMap = material.alphaMap;

		} else if ( material.emissiveMap ) {

			uvScaleMap = material.emissiveMap;

		}

		if ( uvScaleMap !== undefined ) {

			// backwards compatibility
			if ( uvScaleMap.isWebGLRenderTarget ) {

				uvScaleMap = uvScaleMap.texture;

			}

			if ( uvScaleMap.matrixAutoUpdate === true ) {

				uvScaleMap.updateMatrix();

			}

			uniforms.uvTransform.value.copy( uvScaleMap.matrix );

		}

	}

	private refreshUniformsLine( uniforms, material ) {

		uniforms.diffuse.value.copy( material.color );
		uniforms.opacity.value = material.opacity;

	}

	private refreshUniformsDash( uniforms, material ) {

		uniforms.dashSize.value = material.dashSize;
		uniforms.totalSize.value = material.dashSize + material.gapSize;
		uniforms.scale.value = material.scale;

	}

	private refreshUniformsPoints( uniforms, material ) {

		uniforms.diffuse.value.copy( material.color );
		uniforms.opacity.value = material.opacity;
		uniforms.size.value = material.size * _pixelRatio;
		uniforms.scale.value = _height * 0.5;

		uniforms.map.value = material.map;

		if ( material.map !== null ) {

			if ( material.map.matrixAutoUpdate === true ) {

				material.map.updateMatrix();

			}

			uniforms.uvTransform.value.copy( material.map.matrix );

		}

	}

	private refreshUniformsSprites( uniforms, material ) {

		uniforms.diffuse.value.copy( material.color );
		uniforms.opacity.value = material.opacity;
		uniforms.rotation.value = material.rotation;
		uniforms.map.value = material.map;

		if ( material.map !== null ) {

			if ( material.map.matrixAutoUpdate === true ) {

				material.map.updateMatrix();

			}

			uniforms.uvTransform.value.copy( material.map.matrix );

		}

	}

	private refreshUniformsFog( uniforms, fog ) {

		uniforms.fogColor.value.copy( fog.color );

		if ( fog.isFog ) {

			uniforms.fogNear.value = fog.near;
			uniforms.fogFar.value = fog.far;

		} else if ( fog.isFogExp2 ) {

			uniforms.fogDensity.value = fog.density;

		}

	}

	private refreshUniformsLambert( uniforms, material ) {

		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}

	}

	private refreshUniformsPhong( uniforms, material ) {

		uniforms.specular.value.copy( material.specular );
		uniforms.shininess.value = Math.max( material.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )

		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide ) uniforms.bumpScale.value *= - 1;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide ) uniforms.normalScale.value.negate();

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	private refreshUniformsToon( uniforms, material ) {

		refreshUniformsPhong( uniforms, material );

		if ( material.gradientMap ) {

			uniforms.gradientMap.value = material.gradientMap;

		}

	}

	private refreshUniformsStandard( uniforms, material ) {

		uniforms.roughness.value = material.roughness;
		uniforms.metalness.value = material.metalness;

		if ( material.roughnessMap ) {

			uniforms.roughnessMap.value = material.roughnessMap;

		}

		if ( material.metalnessMap ) {

			uniforms.metalnessMap.value = material.metalnessMap;

		}

		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide ) uniforms.bumpScale.value *= - 1;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide ) uniforms.normalScale.value.negate();

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

		if ( material.envMap ) {

			//uniforms.envMap.value = material.envMap; // part of uniforms common
			uniforms.envMapIntensity.value = material.envMapIntensity;

		}

	}

	private refreshUniformsPhysical( uniforms, material ) {

		refreshUniformsStandard( uniforms, material );

		uniforms.reflectivity.value = material.reflectivity; // also part of uniforms common

		uniforms.clearCoat.value = material.clearCoat;
		uniforms.clearCoatRoughness.value = material.clearCoatRoughness;

	}

	private refreshUniformsMatcap( uniforms, material ) {

		if ( material.matcap ) {

			uniforms.matcap.value = material.matcap;

		}

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide ) uniforms.bumpScale.value *= - 1;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide ) uniforms.normalScale.value.negate();

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	private refreshUniformsDepth( uniforms, material ) {

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	private refreshUniformsDistance( uniforms, material ) {

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

		uniforms.referencePosition.value.copy( material.referencePosition );
		uniforms.nearDistance.value = material.nearDistance;
		uniforms.farDistance.value = material.farDistance;

	}

	private refreshUniformsNormal( uniforms, material ) {

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide ) uniforms.bumpScale.value *= - 1;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide ) uniforms.normalScale.value.negate();

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	// If uniforms are marked as clean, they don't need to be loaded to the GPU.

	private markUniformsLightsNeedsUpdate( uniforms, value ) {

		uniforms.ambientLightColor.needsUpdate = value;
		uniforms.lightProbe.needsUpdate = value;

		uniforms.directionalLights.needsUpdate = value;
		uniforms.pointLights.needsUpdate = value;
		uniforms.spotLights.needsUpdate = value;
		uniforms.rectAreaLights.needsUpdate = value;
		uniforms.hemisphereLights.needsUpdate = value;

	}

	//

	setFramebuffer ( value: any ) {

		this._framebuffer = value;

	};

	getRenderTarget () {

		return this._currentRenderTarget;

	};

	setRenderTarget ( renderTarget: any, activeCubeFace?: any, activeMipMapLevel?: any ) {

		this._currentRenderTarget = renderTarget;

		if ( renderTarget && this.properties.get( renderTarget ).__webglFramebuffer === undefined ) {

			this.textures.setupRenderTarget( renderTarget );

		}

		var framebuffer = this._framebuffer;
		var isCube = false;

		if ( renderTarget ) {

			var __webglFramebuffer = this.properties.get( renderTarget ).__webglFramebuffer;

			if ( renderTarget.isWebGLRenderTargetCube ) {

				framebuffer = __webglFramebuffer[ activeCubeFace || 0 ];
				isCube = true;

			} else if ( renderTarget.isWebGLMultisampleRenderTarget ) {

				framebuffer = this.properties.get( renderTarget ).__webglMultisampledFramebuffer;

			} else {

				framebuffer = __webglFramebuffer;

			}

			this._currentViewport.copy( renderTarget.viewport );
			this._currentScissor.copy( renderTarget.scissor );
			this._currentScissorTest = renderTarget.scissorTest;

		} else {

			this._currentViewport.copy( this._viewport ).multiplyScalar( this._pixelRatio );
			this._currentScissor.copy( this._scissor ).multiplyScalar( this._pixelRatio );
			this._currentScissorTest = this._scissorTest;

		}

		if ( this._currentFramebuffer !== framebuffer ) {

			this._gl.bindFramebuffer( this._gl.FRAMEBUFFER, framebuffer );
			this._currentFramebuffer = framebuffer;

		}

		this.state.viewport( _currentViewport );
		this.state.scissor( _currentScissor );
		this.state.setScissorTest( _currentScissorTest );

		if ( isCube ) {

			var textureProperties = properties.get( renderTarget.texture );
			this._gl.framebufferTexture2D( this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + ( activeCubeFace || 0 ), textureProperties.__webglTexture, activeMipMapLevel || 0 );

		}

	};

	readRenderTargetPixels ( renderTarget, x, y, width, height, buffer, activeCubeFaceIndex ) {

		if ( ! ( renderTarget && renderTarget.isWebGLRenderTarget ) ) {

			console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.' );
			return;

		}

		var framebuffer = properties.get( renderTarget ).__webglFramebuffer;

		if ( renderTarget.isWebGLRenderTargetCube && activeCubeFaceIndex !== undefined ) {

			framebuffer = framebuffer[ activeCubeFaceIndex ];

		}

		if ( framebuffer ) {

			var restore = false;

			if ( framebuffer !== this._currentFramebuffer ) {

				this._gl.bindFramebuffer( this._gl.FRAMEBUFFER, framebuffer );

				restore = true;

			}

			try {

				var texture = renderTarget.texture;
				var textureFormat = texture.format;
				var textureType = texture.type;

				if ( textureFormat !== RGBAFormat && this.utils.convert( textureFormat ) !== this._gl.getParameter( this._gl.IMPLEMENTATION_COLOR_READ_FORMAT ) ) {

					console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.' );
					return;

				}

				if ( textureType !== UnsignedByteType && this.utils.convert( textureType ) !== this._gl.getParameter( this._gl.IMPLEMENTATION_COLOR_READ_TYPE ) && // IE11, Edge and Chrome Mac < 52 (#9513)
					! ( textureType === FloatType && ( capabilities.isWebGL2 || this.extensions.get( 'OES_texture_float' ) || this.extensions.get( 'WEBGL_color_buffer_float' ) ) ) && // Chrome Mac >= 52 and Firefox
					! ( textureType === HalfFloatType && ( capabilities.isWebGL2 ? this.extensions.get( 'EXT_color_buffer_float' ) : this.extensions.get( 'EXT_color_buffer_half_float' ) ) ) ) {

					console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.' );
					return;

				}

				if ( this._gl.checkFramebufferStatus( this._gl.FRAMEBUFFER ) === this._gl.FRAMEBUFFER_COMPLETE ) {

					// the following if statement ensures valid read requests (no out-of-bounds pixels, see #8604)

					if ( ( x >= 0 && x <= ( renderTarget.width - width ) ) && ( y >= 0 && y <= ( renderTarget.height - height ) ) ) {

						this._gl.readPixels( x, y, width, height, this.utils.convert( textureFormat ), this.utils.convert( textureType ), buffer );

					}

				} else {

					console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.' );

				}

			} finally {

				if ( restore ) {

					this._gl.bindFramebuffer( this._gl.FRAMEBUFFER, this._currentFramebuffer );

				}

			}

		}

	};

	copyFramebufferToTexture ( position: any, texture: any, level: any ) {

		var width = texture.image.width;
		var height = texture.image.height;
		var glFormat = this.utils.convert( texture.format );

		this.textures.setTexture2D( texture, 0 );

		this._gl.copyTexImage2D( this._gl.TEXTURE_2D, level || 0, glFormat, position.x, position.y, width, height, 0 );

	}

	copyTextureToTexture ( position: any, srcTexture: any, dstTexture: any, level: any ) {

		var width = srcTexture.image.width;
		var height = srcTexture.image.height;
		var glFormat = this.utils.convert( dstTexture.format );
		var glType = this.utils.convert( dstTexture.type );

		textures.setTexture2D( dstTexture, 0 );

		if ( srcTexture.isDataTexture ) {

			this._gl.texSubImage2D( this._gl.TEXTURE_2D, level || 0, position.x, position.y, width, height, glFormat, glType, srcTexture.image.data );

		} else {

			this._gl.texSubImage2D( this._gl.TEXTURE_2D, level || 0, position.x, position.y, glFormat, glType, srcTexture.image );

		}

	};

}
