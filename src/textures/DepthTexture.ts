/**
 * @author Matt DesLauriers / @mattdesl
 * @author atix / arthursilber.de
 */

import { Texture } from './Texture';
import {
	NearestFilter,
	UnsignedShortType,
	UnsignedInt248Type,
	DepthFormat,
	DepthStencilFormat,
	PixelFormat,
	TextureFilter,
	Wrapping,
	TextureDataType,
} from '../constants';

export class DepthTexture extends Texture {

	constructor(
		width: number,
		height: number,
		type?: TextureDataType,
		mapping?: any,
		wrapS?: Wrapping,
		wrapT?: Wrapping,
		magFilter?: TextureFilter,
		minFilter?: TextureFilter,
		anisotropy?: any,
		format: PixelFormat.Depth | PixelFormat.DepthStencil = DepthFormat
	) {

		super(
			null,
			mapping,
			wrapS,
			wrapT,
			magFilter,
			minFilter,
			( () => {

				if ( format !== DepthFormat && format !== DepthStencilFormat ) {

					throw new Error(
						'DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat'
					);

				}

				return format;

			} )(),
			type !== undefined
				? type
				: format === DepthFormat
					? UnsignedShortType
					: format === DepthStencilFormat
						? UnsignedInt248Type
						: undefined,
			anisotropy
		);

		this.image = { width: width, height: height };

		this.magFilter = magFilter !== undefined ? magFilter : NearestFilter;
		this.minFilter = minFilter !== undefined ? minFilter : NearestFilter;

		this.flipY = false;
		this.generateMipmaps = false;

	}

	isDepthTexture = true as const;

}
