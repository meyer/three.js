import { KeyframeTrack } from '../KeyframeTrack';

/**
 *
 * A Track of numeric keyframe values.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

export class NumberKeyframeTrack extends KeyframeTrack {

	ValueTypeName = 'number' as const;

	// ValueBufferType is inherited

	// DefaultInterpolation is inherited

}
