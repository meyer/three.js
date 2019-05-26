/**
 * @author Artur Trzesiok
 */

import { Texture } from './Texture';
import { ClampToEdgeWrapping, NearestFilter, Wrapping } from '../constants';

export class DataTexture3D extends Texture {

	constructor( data: any, width: number, height: number, depth: number ) {

		// We're going to add .setXXX() methods for setting properties later.
		// Users can still set in DataTexture3D directly.
		//
		//	var texture = new THREE.DataTexture3D( data, width, height, depth );
		// 	texture.anisotropy = 16;
		//
		// See #14839

		super( null );

		this.image = { data: data, width: width, height: height, depth: depth };

		this.magFilter = NearestFilter;
		this.minFilter = NearestFilter;

		this.wrapR = ClampToEdgeWrapping;

		this.generateMipmaps = false;
		this.flipY = false;

	}

	wrapR: Wrapping;

	isDataTexture3D = true;

}
