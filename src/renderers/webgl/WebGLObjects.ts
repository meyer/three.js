import { WebGLInfo } from './WebGLInfo';

/**
 * @author mrdoob / http://mrdoob.com/
 */

export class WebGLObjects {

	constructor( geometries: any, info: WebGLInfo ) {

		this.geometries = geometries;
		this.info = info;

	}

	private geometries: any;
	private info: WebGLInfo;
	private updateList: Record<string, any> = {};

	public update( object: any ) {

		var frame = this.info.render.frame;

		var geometry = object.geometry;
		var buffergeometry = this.geometries.get( object, geometry );

		// Update once per frame

		if ( this.updateList[ buffergeometry.id ] !== frame ) {

			if ( geometry.isGeometry ) {

				buffergeometry.updateFromObject( object );

			}

			this.geometries.update( buffergeometry );

			this.updateList[ buffergeometry.id ] = frame;

		}

		return buffergeometry;

	}

	public dispose() {

		this.updateList = {};

	}

}
