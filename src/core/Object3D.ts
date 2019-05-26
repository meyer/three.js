import { Quaternion } from '../math/Quaternion';
import { Vector3 } from '../math/Vector3';
import { Matrix4 } from '../math/Matrix4';
import { EventDispatcher } from './EventDispatcher';
import { Euler } from '../math/Euler';
import { Layers } from './Layers';
import { Matrix3 } from '../math/Matrix3';
import { _Math } from '../math/Math';
import { TrianglesDrawMode, TrianglesDrawModes } from '../constants';
import { Vector4 } from '../math/Vector4';
import { Material } from '../materials/Material';
import { Geometry } from './Geometry';
import { BufferGeometry } from './BufferGeometry';

interface SerializedOutput {
	metadata?: {
		version: number;
		type: string;
		generator: string;
	};
	object: SerializedObject;
	geometries?: any[];
	materials?: any[];
	textures?: any[];
	images?: any[];
	shapes?: any[];
}

interface Data {
	geometries: Record<string, any>;
	materials: Record<string, any>;
	textures: Record<string, any>;
	images: Record<string, any>;
	shapes: Record<string, any>;
}

interface SerializedObject {
	uuid: string;
	type: string;
	name: string;
	castShadow?: boolean;
	receiveShadow?: boolean;
	visible?: boolean;
	frustumCulled?: boolean;
	renderOrder?: number;
	userData?: Record<string, any>;
	layers: any;
	matrix: number[];
	matrixAutoUpdate: boolean;
	drawMode?: TrianglesDrawModes;
	geometry?: string;
	children?: SerializedObject[];
	material?: string | string[];
}

/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author elephantatwork / www.elephantatwork.ch
 */

var object3DId = 0;

export class Object3D extends EventDispatcher {

	constructor() {

		super();

		Object.defineProperty( this, 'id', { value: object3DId ++ } );

		this.uuid = _Math.generateUUID();

		this.name = '';
		this.type = 'Object3D';

		this.parent = null;
		this.children = [];

		this.up = Object3D.DefaultUp.clone();

		var position = new Vector3();
		var rotation = new Euler();
		var quaternion = new Quaternion();
		var scale = new Vector3( 1, 1, 1 );

		function onRotationChange() {

			quaternion.setFromEuler( rotation, false );

		}

		function onQuaternionChange() {

			rotation.setFromQuaternion( quaternion, undefined, false );

		}

		rotation.onChange( onRotationChange );
		quaternion.onChange( onQuaternionChange );

		Object.defineProperties( this, {
			position: {
				configurable: true,
				enumerable: true,
				value: position,
			},
			rotation: {
				configurable: true,
				enumerable: true,
				value: rotation,
			},
			quaternion: {
				configurable: true,
				enumerable: true,
				value: quaternion,
			},
			scale: {
				configurable: true,
				enumerable: true,
				value: scale,
			},
			modelViewMatrix: {
				value: new Matrix4(),
			},
			normalMatrix: {
				value: new Matrix3(),
			},
		} );

		this.matrix = new Matrix4();
		this.matrixWorld = new Matrix4();

		this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
		this.matrixWorldNeedsUpdate = false;

		this.layers = new Layers();
		this.visible = true;

		this.castShadow = false;
		this.receiveShadow = false;

		this.frustumCulled = true;
		this.renderOrder = 0;

		this.userData = {};

	}

	// defined with defineProperty
	id!: number;

	uuid: string;
	name: string;
	type: string;

	// TODO(meyer) use union of all Object3D subtypes
	parent: null | Object3D;

	// TODO(meyer) use union of all Object3D subtypes
	children: Object3D[];
	up: Vector3;
	matrix: Matrix4;
	matrixWorld: Matrix4;

	matrixAutoUpdate: boolean;
	matrixWorldNeedsUpdate: boolean;
	layers: Layers;
	visible: boolean;
	castShadow: boolean;
	receiveShadow: boolean;
	frustumCulled: boolean;
	renderOrder: number;
	userData: Record<string, any>;

	position?: Vector3;
	quaternion?: Quaternion;
	scale?: Vector3;
	material?: Material;
	geometry?: Geometry | BufferGeometry;
	morphTargetInfluences?: any;

	static DefaultUp = new Vector3( 0, 1, 0 );
	static DefaultMatrixAutoUpdate = true;

	isObject3D = true;
	isCamera: boolean | undefined;
	isLight: boolean | undefined;
	isMesh: boolean | undefined;
	isLine: boolean | undefined;
	isPoints: boolean | undefined;
	drawMode: TrianglesDrawModes | undefined;

	onBeforeRender() {}
	onAfterRender() {}

	applyMatrix( matrix: Matrix4 ) {

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		this.matrix.premultiply( matrix );

		this.matrix.decompose( this.position!, this.quaternion!, this.scale! );

	}

	applyQuaternion( q: Quaternion ) {

		this.quaternion!.premultiply( q );

		return this;

	}

	setRotationFromAxisAngle( axis: Vector3, angle: number ) {

		// assumes axis is normalized

		this.quaternion!.setFromAxisAngle( axis, angle );

	}

	setRotationFromEuler( euler: Euler ) {

		this.quaternion!.setFromEuler( euler, true );

	}

	setRotationFromMatrix( m: Matrix4 ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		this.quaternion!.setFromRotationMatrix( m );

	}

	setRotationFromQuaternion( q: Quaternion ) {

		// assumes q is normalized

		this.quaternion!.copy( q );

	}

	rotateOnAxis = ( () => {

		// rotate object on axis in object space
		// axis is assumed to be normalized

		var q1 = new Quaternion();

		const rotateOnAxis = ( axis: Vector3, angle: number ) => {

			q1.setFromAxisAngle( axis, angle );

			this.quaternion!.multiply( q1 );

			return this;

		};

		return rotateOnAxis;

	} )();

	rotateOnWorldAxis = ( () => {

		// rotate object on axis in world space
		// axis is assumed to be normalized
		// method assumes no rotated parent

		var q1 = new Quaternion();

		const rotateOnWorldAxis = ( axis: Vector3, angle: number ) => {

			q1.setFromAxisAngle( axis, angle );

			this.quaternion!.premultiply( q1 );

			return this;

		};

		return rotateOnWorldAxis;

	} )();

	rotateX = ( () => {

		var v1 = new Vector3( 1, 0, 0 );

		const rotateX = ( angle: number ) => {

			return this.rotateOnAxis( v1, angle );

		};

		return rotateX;

	} )();

	rotateY = ( () => {

		var v1 = new Vector3( 0, 1, 0 );

		const rotateY = ( angle: number ) => {

			return this.rotateOnAxis( v1, angle );

		};

		return rotateY;

	} )();

	rotateZ = ( () => {

		var v1 = new Vector3( 0, 0, 1 );

		const rotateZ = ( angle: number ) => {

			return this.rotateOnAxis( v1, angle );

		};

		return rotateZ;

	} )();

	translateOnAxis = ( () => {

		// translate object by distance along axis in object space
		// axis is assumed to be normalized

		var v1 = new Vector3();

		const translateOnAxis = ( axis: Vector3, distance: number ) => {

			v1.copy( axis ).applyQuaternion( this.quaternion! );

			this.position!.add( v1.multiplyScalar( distance ) );

			return this;

		};

		return translateOnAxis;

	} )();

	translateX = ( () => {

		var v1 = new Vector3( 1, 0, 0 );

		const translateX = ( distance: number ) => {

			return this.translateOnAxis( v1, distance );

		};

		return translateX;

	} )();

	translateY = ( () => {

		var v1 = new Vector3( 0, 1, 0 );

		const translateY = ( distance: number ) => {

			return this.translateOnAxis( v1, distance );

		};

		return translateY;

	} )();

	translateZ = ( () => {

		var v1 = new Vector3( 0, 0, 1 );

		const translateZ = ( distance: number ) => {

			return this.translateOnAxis( v1, distance );

		};

		return translateZ;

	} )();

	localToWorld( vector: Vector3 ) {

		return vector.applyMatrix4( this.matrixWorld );

	}

	worldToLocal = ( () => {

		var m1 = new Matrix4();

		const worldToLocal = ( vector: Vector3 | Vector4 ) => {

			return vector.applyMatrix4( m1.getInverse( this.matrixWorld ) );

		};

		return worldToLocal;

	} )();

	lookAt = ( () => {

		// This method does not support objects having non-uniformly-scaled parent(s)

		var q1 = new Quaternion();
		var m1 = new Matrix4();
		var target = new Vector3();
		var position = new Vector3();

		// TODO(meyer) better types
		return ( x: Vector3 | number, y?: number, z?: number ) => {

			if ( typeof x === 'object' && 'isVector3' in x ) {

				target.copy( x );

			} else {

				target.set( x, y!, z! );

			}

			var parent = this.parent;

			this.updateWorldMatrix( true, false );

			position.setFromMatrixPosition( this.matrixWorld );

			if ( this.isCamera || this.isLight ) {

				m1.lookAt( position, target, this.up );

			} else {

				m1.lookAt( target, position, this.up );

			}

			this.quaternion!.setFromRotationMatrix( m1 );

			if ( parent ) {

				m1.extractRotation( parent.matrixWorld );
				q1.setFromRotationMatrix( m1 );
				this.quaternion!.premultiply( q1.inverse() );

			}

		};

	} )();

	add( object: any ) {

		if ( arguments.length > 1 ) {

			for ( var i = 0; i < arguments.length; i ++ ) {

				this.add( arguments[ i ] );

			}

			return this;

		}

		if ( object === this ) {

			console.error(
				"THREE.Object3D.add: object can't be added as a child of itself.",
				object
			);
			return this;

		}

		if ( object && object.isObject3D ) {

			if ( object.parent !== null ) {

				object.parent.remove( object );

			}

			object.parent = this;
			object.dispatchEvent( { type: 'added' } );

			this.children.push( object );

		} else {

			console.error(
				'THREE.Object3D.add: object not an instance of THREE.Object3D.',
				object
			);

		}

		return this;

	}

	remove( object: Object3D ) {

		if ( arguments.length > 1 ) {

			for ( var i = 0; i < arguments.length; i ++ ) {

				this.remove( arguments[ i ] );

			}

			return this;

		}

		var index = this.children.indexOf( object );

		if ( index !== - 1 ) {

			object.parent = null;

			object.dispatchEvent( { type: 'removed' } );

			this.children.splice( index, 1 );

		}

		return this;

	}

	attach = ( () => {

		// adds object as a child of this, while maintaining the object's world transform

		var m = new Matrix4();

		const attach = ( object: any ) => {

			this.updateWorldMatrix( true, false );

			m.getInverse( this.matrixWorld );

			if ( object.parent !== null ) {

				object.parent.updateWorldMatrix( true, false );

				m.multiply( object.parent.matrixWorld );

			}

			object.applyMatrix( m );

			object.updateWorldMatrix( false, false );

			this.add( object );

			return this;

		};

	} )();

	getObjectById( id: number ) {

		return this.getObjectByProperty( 'id', id );

	}

	getObjectByName( name: string ) {

		return this.getObjectByProperty( 'name', name );

	}

	getObjectByProperty<K extends keyof Object3D>(
		name: K,
		value: Object3D[K]
	): any | undefined {

		if ( this[ name ] === value ) return this;

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			var child = this.children[ i ];
			var object = child.getObjectByProperty( name, value );

			if ( object !== undefined ) {

				return object;

			}

		}

		return undefined;

	}

	getWorldPosition( target: Vector3 ) {

		if ( target === undefined ) {

			console.warn(
				'THREE.Object3D: .getWorldPosition() target is now required'
			);
			target = new Vector3();

		}

		this.updateMatrixWorld( true );

		return target.setFromMatrixPosition( this.matrixWorld );

	}

	getWorldQuaternion = ( () => {

		var position = new Vector3();
		var scale = new Vector3();

		const getWorldQuaternion = ( target?: Quaternion ) => {

			if ( target === undefined ) {

				console.warn(
					'THREE.Object3D: .getWorldQuaternion() target is now required'
				);
				target = new Quaternion();

			}

			this.updateMatrixWorld( true );

			this.matrixWorld.decompose( position, target, scale );

			return target;

		};

		return getWorldQuaternion;

	} )();

	getWorldScale = ( () => {

		var position = new Vector3();
		var quaternion = new Quaternion();

		const getWorldScale = ( target?: Vector3 ) => {

			if ( target === undefined ) {

				console.warn( 'THREE.Object3D: .getWorldScale() target is now required' );
				target = new Vector3();

			}

			this.updateMatrixWorld( true );

			this.matrixWorld.decompose( position, quaternion, target );

			return target;

		};

		return getWorldScale;

	} )();

	getWorldDirection( target: Vector3 ) {

		if ( target === undefined ) {

			console.warn(
				'THREE.Object3D: .getWorldDirection() target is now required'
			);
			target = new Vector3();

		}

		this.updateMatrixWorld( true );

		var e = this.matrixWorld.elements;

		return target.set( e[ 8 ], e[ 9 ], e[ 10 ] ).normalize();

	}

	raycast( ...args: any[] ): void {}

	traverse( callback: ( obj: Object3D ) => void ) {

		callback( this );

		var children = this.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverse( callback );

		}

	}

	traverseVisible( callback: ( obj: Object3D ) => void ) {

		if ( this.visible === false ) return;

		callback( this );

		var children = this.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverseVisible( callback );

		}

	}

	traverseAncestors( callback: ( obj: Object3D ) => void ) {

		var parent = this.parent;

		if ( parent !== null ) {

			callback( parent );

			parent.traverseAncestors( callback );

		}

	}

	updateMatrix() {

		this.matrix.compose(
			this.position!,
			this.quaternion!,
			this.scale!
		);

		this.matrixWorldNeedsUpdate = true;

	}

	updateMatrixWorld( force?: boolean ) {

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		if ( this.matrixWorldNeedsUpdate || force ) {

			if ( this.parent === null ) {

				this.matrixWorld.copy( this.matrix );

			} else {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		var children = this.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( force );

		}

	}

	updateWorldMatrix( updateParents?: boolean, updateChildren?: boolean ) {

		var parent = this.parent;

		if ( updateParents === true && parent !== null ) {

			parent.updateWorldMatrix( true, false );

		}

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		if ( this.parent === null ) {

			this.matrixWorld.copy( this.matrix );

		} else {

			this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

		}

		// update children

		if ( updateChildren === true ) {

			var children = this.children;

			for ( var i = 0, l = children.length; i < l; i ++ ) {

				children[ i ].updateWorldMatrix( false, true );

			}

		}

	}

	toJSON( meta?: Data | string ) {

		// meta is a string when called from JSON.stringify
		var isRootObject = meta === undefined || typeof meta === 'string';

		var output: SerializedOutput = {} as any;

		// meta is a hash used to collect geometries, materials.
		// not providing it implies that this is the root object
		// being serialized.
		if ( isRootObject || meta === undefined || typeof meta === 'string' ) {

			// initialize meta obj
			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {},
				shapes: {},
			};

			output.metadata = {
				version: 4.5,
				type: 'Object',
				generator: 'Object3D.toJSON',
			};

		}

		// standard Object3D serialization

		var object: SerializedObject = {} as any;

		object.uuid = this.uuid;
		object.type = this.type;

		if ( this.name !== '' ) object.name = this.name;
		if ( this.castShadow === true ) object.castShadow = true;
		if ( this.receiveShadow === true ) object.receiveShadow = true;
		if ( this.visible === false ) object.visible = false;
		if ( this.frustumCulled === false ) object.frustumCulled = false;
		if ( this.renderOrder !== 0 ) object.renderOrder = this.renderOrder;
		if ( JSON.stringify( this.userData ) !== '{}' ) object.userData = this.userData;

		object.layers = this.layers.mask;
		object.matrix = this.matrix.toArray();

		if ( this.matrixAutoUpdate === false ) object.matrixAutoUpdate = false;

		// object specific properties

		if ( this.isMesh && this.drawMode !== TrianglesDrawMode )
			object.drawMode = this.drawMode;

		//

		function serialize( library: any, element: Object3D | Geometry ) {

			if ( library[ element.uuid ] === undefined ) {

				library[ element.uuid ] = element.toJSON( meta );

			}

			return element.uuid;

		}

		if ( this.isMesh || this.isLine || this.isPoints ) {

			object.geometry = serialize( meta.geometries, this.geometry! );

			var parameters = this.geometry!.parameters;

			if ( parameters !== undefined && parameters.shapes !== undefined ) {

				var shapes = parameters.shapes;

				if ( Array.isArray( shapes ) ) {

					for ( var i = 0, l = shapes.length; i < l; i ++ ) {

						var shape = shapes[ i ];

						serialize( meta.shapes, shape );

					}

				} else {

					serialize( meta.shapes, shapes );

				}

			}

		}

		if ( this.material !== undefined ) {

			if ( Array.isArray( this.material ) ) {

				var uuids = [];

				for ( var i = 0, l = this.material.length; i < l; i ++ ) {

					uuids.push( serialize( meta.materials, this.material[ i ] ) );

				}

				object.material = uuids;

			} else {

				object.material = serialize( meta.materials, this.material );

			}

		}

		//

		if ( this.children.length > 0 ) {

			object.children = [];

			for ( var i = 0; i < this.children.length; i ++ ) {

				object.children.push( this.children[ i ].toJSON( meta ).object );

			}

		}

		if ( isRootObject ) {

			var geometries = extractFromCache( meta.geometries );
			var materials = extractFromCache( meta.materials );
			var textures = extractFromCache( meta.textures );
			var images = extractFromCache( meta.images );
			var shapes = extractFromCache( meta.shapes );

			if ( geometries.length > 0 ) output.geometries = geometries;
			if ( materials.length > 0 ) output.materials = materials;
			if ( textures.length > 0 ) output.textures = textures;
			if ( images.length > 0 ) output.images = images;
			if ( shapes.length > 0 ) output.shapes = shapes;

		}

		output.object = object;

		return output;

		// extract data from the cache hash
		// remove metadata on each item
		// and return as array
		function extractFromCache( cache: Record<string, any> ) {

			var values = [];
			for ( var key in cache ) {

				var data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}
			return values;

		}

	}

	clone( recursive?: boolean ): this {

		return ( new ( this as any ).constructor() as InstanceType<
			typeof Object3D
		> ).copy( this, recursive );

	}

	copy<T extends Object3D>( source: T, recursive?: boolean ): T {

		if ( recursive === undefined ) recursive = true;

		this.name = source.name;

		this.up.copy( source.up );

		this.position!.copy( source.position! );
		this.quaternion!.copy( source.quaternion! );
		this.scale!.copy( source.scale! );

		this.matrix.copy( source.matrix );
		this.matrixWorld.copy( source.matrixWorld );

		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

		this.layers.mask = source.layers.mask;
		this.visible = source.visible;

		this.castShadow = source.castShadow;
		this.receiveShadow = source.receiveShadow;

		this.frustumCulled = source.frustumCulled;
		this.renderOrder = source.renderOrder;

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		if ( recursive === true ) {

			for ( var i = 0; i < source.children.length; i ++ ) {

				var child = source.children[ i ];
				this.add( child.clone() );

			}

		}

		return this;

	}

}
