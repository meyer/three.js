/**
 * @author alteredq / http://alteredqualia.com/
 */

import { Texture } from './Texture';
import {
	NearestFilter,
	PixelFormat,
	TextureDataType,
	Wrapping,
	TextureFilter,
	TextureEncoding,
} from '../constants';

class DataTexture extends Texture {

	constructor(
		data?: any,
		width?: number,
		height?: number,
		format?: PixelFormat,
		type?: TextureDataType,
		mapping?: any,
		wrapS?: Wrapping,
		wrapT?: Wrapping,
		magFilter?: TextureFilter,
		minFilter?: TextureFilter,
		anisotropy?: any,
		encoding?: TextureEncoding
	) {

		super(
			null,
			mapping,
			wrapS,
			wrapT,
			magFilter,
			minFilter,
			format,
			type,
			anisotropy,
			encoding
		);

		this.image = { data: data, width: width, height: height };

		this.magFilter = magFilter !== undefined ? magFilter : NearestFilter;
		this.minFilter = minFilter !== undefined ? minFilter : NearestFilter;

		this.generateMipmaps = false;
		this.flipY = false;
		this.unpackAlignment = 1;

	}

	isDataTexture = true as const;

}

export { DataTexture };
