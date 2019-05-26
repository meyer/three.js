/**
 * @author mrdoob / http://mrdoob.com/
 */

import {
	Uint16BufferAttribute,
	Uint32BufferAttribute,
} from '../../core/BufferAttribute';
import { BufferGeometry } from '../../core/BufferGeometry';
import { arrayMax } from '../../utils';
import { WebGLAttributes } from './WebGLAttributes';

export class WebGLGeometries {

	constructor(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		attributes: WebGLAttributes,
		info: any
	) {

		this.gl = gl;
		this.attributes = attributes;
		this.info = info;

	}

	private geometries: Record<string, any> = {};
	private wireframeAttributes: Record<string, any> = {};

	private gl: WebGLRenderingContext | WebGL2RenderingContext;
	private attributes: WebGLAttributes;
	private info: any;

	private onGeometryDispose( event: any ) {

		var geometry = event.target;
		var buffergeometry = this.geometries[ geometry.id ];

		if ( buffergeometry.index !== null ) {

			this.attributes.remove( buffergeometry.index );

		}

		for ( var name in buffergeometry.attributes ) {

			this.attributes.remove( buffergeometry.attributes[ name ] );

		}

		geometry.removeEventListener( 'dispose', this.onGeometryDispose );

		delete this.geometries[ geometry.id ];

		var attribute = this.wireframeAttributes[ buffergeometry.id ];

		if ( attribute ) {

			this.attributes.remove( attribute );
			delete this.wireframeAttributes[ buffergeometry.id ];

		}

		//

		this.info.memory.geometries --;

	}

	public get( object: any, geometry: any ) {

		var buffergeometry = this.geometries[ geometry.id ];

		if ( buffergeometry ) return buffergeometry;

		geometry.addEventListener( 'dispose', this.onGeometryDispose );

		if ( geometry.isBufferGeometry ) {

			buffergeometry = geometry;

		} else if ( geometry.isGeometry ) {

			if ( geometry._bufferGeometry === undefined ) {

				geometry._bufferGeometry = new BufferGeometry().setFromObject( object );

			}

			buffergeometry = geometry._bufferGeometry;

		}

		this.geometries[ geometry.id ] = buffergeometry;

		this.info.memory.geometries ++;

		return buffergeometry;

	}

	public update( geometry: any ) {

		var index = geometry.index;
		var geometryAttributes = geometry.attributes;

		if ( index !== null ) {

			this.attributes.update( index, this.gl.ELEMENT_ARRAY_BUFFER );

		}

		for ( var name in geometryAttributes ) {

			this.attributes.update( geometryAttributes[ name ], this.gl.ARRAY_BUFFER );

		}

		// morph targets

		var morphAttributes = geometry.morphAttributes;

		for ( var name in morphAttributes ) {

			var array = morphAttributes[ name ];

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				this.attributes.update( array[ i ], this.gl.ARRAY_BUFFER );

			}

		}

	}

	public getWireframeAttribute( geometry: any ) {

		var attribute = this.wireframeAttributes[ geometry.id ];

		if ( attribute ) return attribute;

		var indices = [];

		var geometryIndex = geometry.index;
		var geometryAttributes = geometry.attributes;

		// console.time( 'wireframe' );

		if ( geometryIndex !== null ) {

			const array = geometryIndex.array;

			for ( let i = 0, l = array.length; i < l; i += 3 ) {

				const a = array[ i + 0 ];
				const b = array[ i + 1 ];
				const c = array[ i + 2 ];

				indices.push( a, b, b, c, c, a );

			}

		} else {

			const array: any[] = geometryAttributes.position.array;

			for ( let i = 0, l = array.length / 3 - 1; i < l; i += 3 ) {

				const a = i + 0;
				const b = i + 1;
				const c = i + 2;

				indices.push( a, b, b, c, c, a );

			}

		}

		// console.timeEnd( 'wireframe' );

		attribute = new ( arrayMax( indices ) > 65535
			? Uint32BufferAttribute
			: Uint16BufferAttribute )( indices, 1 );

		this.attributes.update( attribute, this.gl.ELEMENT_ARRAY_BUFFER );

		this.wireframeAttributes[ geometry.id ] = attribute;

		return attribute;

	}

}
