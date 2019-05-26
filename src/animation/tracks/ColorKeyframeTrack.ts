import { KeyframeTrack } from '../KeyframeTrack';
import { InterpolationModes } from '../../constants';

/**
 *
 * A Track of keyframe values that represent color.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

export class ColorKeyframeTrack extends KeyframeTrack {

	ValueTypeName = 'color' as const;

	// ValueBufferType is inherited

	// DefaultInterpolation is inherited

	// Note: Very basic implementation and nothing special yet.
	// However, this is the place for color space parameterization.

}
