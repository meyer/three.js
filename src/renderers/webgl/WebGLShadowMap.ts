/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

import {
	FrontSide,
	BackSide,
	DoubleSide,
	RGBAFormat,
	NearestFilter,
	PCFShadowMap,
	RGBADepthPacking,
	NoBlending,
	Side,
} from '../../constants';
import { WebGLRenderTarget } from '../WebGLRenderTarget';
import { MeshDepthMaterial } from '../../materials/MeshDepthMaterial';
import { MeshDistanceMaterial } from '../../materials/MeshDistanceMaterial';
import { Vector4 } from '../../math/Vector4';
import { Vector3 } from '../../math/Vector3';
import { Vector2 } from '../../math/Vector2';
import { Matrix4 } from '../../math/Matrix4';
import { Frustum } from '../../math/Frustum';
import { WebGLRenderer } from '../WebGLRenderer';
import { Material } from '../../materials/Material';

export class WebGLShadowMap {

	constructor( _renderer: WebGLRenderer, _objects: any, maxTextureSize: number ) {

		this._renderer = _renderer;
		this._maxShadowMapSize = new Vector2( maxTextureSize, maxTextureSize );
		this._objects = _objects;
		// init

		for ( let i = 0; i !== this._NumberOfMaterialVariants; ++ i ) {

			const useMorphing = ( i & this._MorphingFlag ) !== 0;
			const useSkinning = ( i & this._SkinningFlag ) !== 0;

			const depthMaterial = new MeshDepthMaterial( {
				depthPacking: RGBADepthPacking,

				morphTargets: useMorphing,
				skinning: useSkinning,
			} );

			this._depthMaterials[ i ] = depthMaterial;

			//

			const distanceMaterial = new MeshDistanceMaterial( {
				morphTargets: useMorphing,
				skinning: useSkinning,
			} );

			this._distanceMaterials[ i ] = distanceMaterial;

		}

	}

	_renderer: WebGLRenderer;
	_objects: any;

	_frustum = new Frustum();
	_projScreenMatrix = new Matrix4();

	_shadowMapSize = new Vector2();
	_maxShadowMapSize: Vector2;

	_lookTarget = new Vector3();
	_lightPositionWorld = new Vector3();

	_MorphingFlag = 1 as const;
	_SkinningFlag = 2 as const;

	_NumberOfMaterialVariants = ( this._MorphingFlag | this._SkinningFlag ) + 1;

	_depthMaterials: MeshDepthMaterial[] = new Array(
		this._NumberOfMaterialVariants
	);
	_distanceMaterials: MeshDistanceMaterial[] = new Array(
		this._NumberOfMaterialVariants
	);

	_materialCache: Record<string, Material> = {};

	shadowSide: Record<number, Side> = {
		0: BackSide,
		1: FrontSide,
		2: DoubleSide,
	};

	cubeDirections = [
		new Vector3( 1, 0, 0 ),
		new Vector3( - 1, 0, 0 ),
		new Vector3( 0, 0, 1 ),
		new Vector3( 0, 0, - 1 ),
		new Vector3( 0, 1, 0 ),
		new Vector3( 0, - 1, 0 ),
	];

	cubeUps = [
		new Vector3( 0, 1, 0 ),
		new Vector3( 0, 1, 0 ),
		new Vector3( 0, 1, 0 ),
		new Vector3( 0, 1, 0 ),
		new Vector3( 0, 0, 1 ),
		new Vector3( 0, 0, - 1 ),
	];

	cube2DViewPorts = [
		new Vector4(),
		new Vector4(),
		new Vector4(),
		new Vector4(),
		new Vector4(),
		new Vector4(),
	];

	enabled = false;

	autoUpdate = true;
	needsUpdate = false;

	type = PCFShadowMap;

	render( lights: any[], scene: any, camera: any ) {

		if ( this.enabled === false ) return;
		if ( this.autoUpdate === false && this.needsUpdate === false ) return;

		if ( lights.length === 0 ) return;

		var currentRenderTarget = this._renderer.getRenderTarget();

		var _state = this._renderer.state;

		// Set GL state for depth map.
		_state.setBlending( NoBlending );
		_state.buffers.color.setClear( 1, 1, 1, 1 );
		_state.buffers.depth.setTest( true );
		_state.setScissorTest( false );

		// render depth map

		var faceCount;

		for ( var i = 0, il = lights.length; i < il; i ++ ) {

			var light = lights[ i ];
			var shadow = light.shadow;
			var isPointLight = light && light.isPointLight;

			if ( shadow === undefined ) {

				console.warn( 'THREE.WebGLShadowMap:', light, 'has no shadow.' );
				continue;

			}

			var shadowCamera = shadow.camera;

			this._shadowMapSize.copy( shadow.mapSize );
			this._shadowMapSize.min( this._maxShadowMapSize );

			if ( isPointLight ) {

				var vpWidth = this._shadowMapSize.x;
				var vpHeight = this._shadowMapSize.y;

				// These viewports map a cube-map onto a 2D texture with the
				// following orientation:
				//
				//  xzXZ
				//   y Y
				//
				// X - Positive x direction
				// x - Negative x direction
				// Y - Positive y direction
				// y - Negative y direction
				// Z - Positive z direction
				// z - Negative z direction

				// positive X
				this.cube2DViewPorts[ 0 ].set( vpWidth * 2, vpHeight, vpWidth, vpHeight );
				// negative X
				this.cube2DViewPorts[ 1 ].set( 0, vpHeight, vpWidth, vpHeight );
				// positive Z
				this.cube2DViewPorts[ 2 ].set( vpWidth * 3, vpHeight, vpWidth, vpHeight );
				// negative Z
				this.cube2DViewPorts[ 3 ].set( vpWidth, vpHeight, vpWidth, vpHeight );
				// positive Y
				this.cube2DViewPorts[ 4 ].set( vpWidth * 3, 0, vpWidth, vpHeight );
				// negative Y
				this.cube2DViewPorts[ 5 ].set( vpWidth, 0, vpWidth, vpHeight );

				this._shadowMapSize.x *= 4.0;
				this._shadowMapSize.y *= 2.0;

			}

			if ( shadow.map === null ) {

				var pars = {
					minFilter: NearestFilter,
					magFilter: NearestFilter,
					format: RGBAFormat,
				};

				shadow.map = new WebGLRenderTarget(
					this._shadowMapSize.x,
					this._shadowMapSize.y,
					pars
				);
				shadow.map.texture.name = light.name + '.shadowMap';

				shadowCamera.updateProjectionMatrix();

			}

			if ( shadow.isSpotLightShadow ) {

				shadow.update( light );

			}

			var shadowMap = shadow.map;
			var shadowMatrix = shadow.matrix;

			this._lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
			shadowCamera.position.copy( this._lightPositionWorld );

			if ( isPointLight ) {

				faceCount = 6;

				// for point lights we set the shadow matrix to be a translation-only matrix
				// equal to inverse of the light's position

				shadowMatrix.makeTranslation(
					- this._lightPositionWorld.x,
					- this._lightPositionWorld.y,
					- this._lightPositionWorld.z
				);

			} else {

				faceCount = 1;

				this._lookTarget.setFromMatrixPosition( light.target.matrixWorld );
				shadowCamera.lookAt( this._lookTarget );
				shadowCamera.updateMatrixWorld();

				// compute shadow matrix

				shadowMatrix.set(
					0.5,
					0.0,
					0.0,
					0.5,
					0.0,
					0.5,
					0.0,
					0.5,
					0.0,
					0.0,
					0.5,
					0.5,
					0.0,
					0.0,
					0.0,
					1.0
				);

				shadowMatrix.multiply( shadowCamera.projectionMatrix );
				shadowMatrix.multiply( shadowCamera.matrixWorldInverse );

			}

			this._renderer.setRenderTarget( shadowMap );
			this._renderer.clear();

			// render shadow map for each cube face (if omni-directional) or
			// run a single pass if not

			for ( var face = 0; face < faceCount; face ++ ) {

				if ( isPointLight ) {

					this._lookTarget.copy( shadowCamera.position );
					this._lookTarget.add( this.cubeDirections[ face ] );
					shadowCamera.up.copy( this.cubeUps[ face ] );
					shadowCamera.lookAt( this._lookTarget );
					shadowCamera.updateMatrixWorld();

					var vpDimensions = this.cube2DViewPorts[ face ];
					_state.viewport( vpDimensions );

				}

				// update camera matrices and frustum

				this._projScreenMatrix.multiplyMatrices(
					shadowCamera.projectionMatrix,
					shadowCamera.matrixWorldInverse
				);
				this._frustum.setFromMatrix( this._projScreenMatrix );

				// set object matrices & frustum culling

				this.renderObject( scene, camera, shadowCamera, isPointLight );

			}

		}

		this.needsUpdate = false;

		this._renderer.setRenderTarget( currentRenderTarget );

	}

	private getDepthMaterial(
		object: any,
		material: Material,
		isPointLight?: boolean,
		lightPositionWorld?: Vector3,
		shadowCameraNear?: boolean,
		shadowCameraFar?: boolean
	) {

		var geometry = object.geometry;

		var result = null;

		var materialVariants = this._depthMaterials;
		var customMaterial = object.customDepthMaterial;

		if ( isPointLight ) {

			materialVariants = this._distanceMaterials;
			customMaterial = object.customDistanceMaterial;

		}

		if ( ! customMaterial ) {

			var useMorphing = false;

			if ( material.morphTargets ) {

				if ( geometry && geometry.isBufferGeometry ) {

					useMorphing =
						geometry.morphAttributes &&
						geometry.morphAttributes.position &&
						geometry.morphAttributes.position.length > 0;

				} else if ( geometry && geometry.isGeometry ) {

					useMorphing =
						geometry.morphTargets && geometry.morphTargets.length > 0;

				}

			}

			if ( object.isSkinnedMesh && material.skinning === false ) {

				console.warn(
					'THREE.WebGLShadowMap: THREE.SkinnedMesh with material.skinning set to false:',
					object
				);

			}

			var useSkinning = object.isSkinnedMesh && material.skinning;

			var variantIndex = 0;

			if ( useMorphing ) variantIndex |= this._MorphingFlag;
			if ( useSkinning ) variantIndex |= this._SkinningFlag;

			result = materialVariants[ variantIndex ];

		} else {

			result = customMaterial;

		}

		if (
			this._renderer.localClippingEnabled &&
			material.clipShadows === true &&
			material.clippingPlanes.length !== 0
		) {

			// in this case we need a unique material instance reflecting the
			// appropriate state

			var keyA = result.uuid,
				keyB = material.uuid;

			let materialsForVariant: any = this._materialCache[ keyA ];

			if ( materialsForVariant === undefined ) {

				materialsForVariant = {};
				this._materialCache[ keyA ] = materialsForVariant;

			}

			var cachedMaterial = materialsForVariant[ keyB ];

			if ( cachedMaterial === undefined ) {

				cachedMaterial = result.clone();
				materialsForVariant[ keyB ] = cachedMaterial;

			}

			result = cachedMaterial;

		}

		result.visible = material.visible;
		result.wireframe = material.wireframe;

		result.side =
			material.shadowSide != null
				? material.shadowSide
				: this.shadowSide[ material.side ];

		result.clipShadows = material.clipShadows;
		result.clippingPlanes = material.clippingPlanes;
		result.clipIntersection = material.clipIntersection;

		result.wireframeLinewidth = material.wireframeLinewidth;
		result.linewidth = material.linewidth;

		if ( isPointLight && result.isMeshDistanceMaterial ) {

			result.referencePosition.copy( lightPositionWorld );
			result.nearDistance = shadowCameraNear;
			result.farDistance = shadowCameraFar;

		}

		return result;

	}

	renderObject( object: any, camera: any, shadowCamera: any, isPointLight: any ) {

		if ( object.visible === false ) return;

		var visible = object.layers.test( camera.layers );

		if ( visible && ( object.isMesh || object.isLine || object.isPoints ) ) {

			if (
				object.castShadow &&
				( ! object.frustumCulled || this._frustum.intersectsObject( object ) )
			) {

				object.modelViewMatrix.multiplyMatrices(
					shadowCamera.matrixWorldInverse,
					object.matrixWorld
				);

				var geometry = this._objects.update( object );
				var material = object.material;

				if ( Array.isArray( material ) ) {

					var groups = geometry.groups;

					for ( var k = 0, kl = groups.length; k < kl; k ++ ) {

						var group = groups[ k ];
						var groupMaterial = material[ group.materialIndex ];

						if ( groupMaterial && groupMaterial.visible ) {

							var depthMaterial = this.getDepthMaterial(
								object,
								groupMaterial,
								isPointLight,
								this._lightPositionWorld,
								shadowCamera.near,
								shadowCamera.far
							);
							this._renderer.renderBufferDirect(
								shadowCamera,
								null,
								geometry,
								depthMaterial,
								object,
								group
							);

						}

					}

				} else if ( material.visible ) {

					var depthMaterial = this.getDepthMaterial(
						object,
						material,
						isPointLight,
						this._lightPositionWorld,
						shadowCamera.near,
						shadowCamera.far
					);
					this._renderer.renderBufferDirect(
						shadowCamera,
						null,
						geometry,
						depthMaterial,
						object,
						null
					);

				}

			}

		}

		var children = object.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			this.renderObject( children[ i ], camera, shadowCamera, isPointLight );

		}

	}

}
