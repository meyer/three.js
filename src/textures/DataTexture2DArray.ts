/**
 * @author Takahiro https://github.com/takahirox
 */

import { Texture } from './Texture';
import { ClampToEdgeWrapping, NearestFilter, Wrapping } from '../constants';

export class DataTexture2DArray extends Texture {

	constructor( data: any, width: number, height: number, depth: number ) {

		super( null );

		this.image = { data: data, width: width, height: height, depth: depth };

		this.magFilter = NearestFilter;
		this.minFilter = NearestFilter;

		this.wrapR = ClampToEdgeWrapping;

		this.generateMipmaps = false;
		this.flipY = false;

	}

	wrapR: Wrapping;

	isDataTexture2DArray = true as const;

}
