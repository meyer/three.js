/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Texture } from './Texture';
import {
	CubeReflectionMapping,
	RGBFormat,
	Wrapping,
	TextureFilter,
	PixelFormat,
	TextureDataType,
	TextureEncoding,
} from '../constants';

export class CubeTexture extends Texture {

	constructor(
		images: any[],
		mapping: any,
		wrapS: Wrapping,
		wrapT: Wrapping,
		magFilter: TextureFilter,
		minFilter: TextureFilter,
		format: PixelFormat,
		type: TextureDataType,
		anisotropy: any,
		encoding: TextureEncoding
	) {

		super(
			images !== undefined ? images : [],
			( mapping = mapping !== undefined ? mapping : CubeReflectionMapping ),
			wrapS,
			wrapT,
			magFilter,
			minFilter,
			( format = format !== undefined ? format : RGBFormat ),
			type,
			anisotropy,
			encoding
		);

		this.flipY = false;

	}

	isCubeTexture = true as const;

	get images() {

		return this.image;

	}

	set images( value ) {

		this.image = value;

	}

}
