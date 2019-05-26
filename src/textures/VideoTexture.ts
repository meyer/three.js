/**
 * @author mrdoob / http://mrdoob.com/
 */

import {
	RGBFormat,
	LinearFilter,
	Wrapping,
	TextureFilter,
	PixelFormat,
	TextureDataType,
} from '../constants';
import { Texture } from './Texture';

export class VideoTexture extends Texture {

	constructor(
		video: any,
		mapping: any,
		wrapS: Wrapping,
		wrapT: Wrapping,
		magFilter: TextureFilter,
		minFilter: TextureFilter,
		format: PixelFormat,
		type: TextureDataType,
		anisotropy: any
	) {

		super(
			video,
			mapping,
			wrapS,
			wrapT,
			magFilter,
			minFilter,
			format,
			type,
			anisotropy
		);

		this.format = format !== undefined ? format : RGBFormat;

		this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
		this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;

		this.generateMipmaps = false;

	}

	isVideoTexture = true as const;

	update() {

		var video = this.image;

		if ( video.readyState >= video.HAVE_CURRENT_DATA ) {

			this.needsUpdate = true;

		}

	}

}
