import { KeyframeTrack } from '../KeyframeTrack';

/**
 *
 * A Track of vectored keyframe values.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

export class VectorKeyframeTrack extends KeyframeTrack {

	ValueTypeName = 'vector' as const;

	// ValueBufferType is inherited

	// DefaultInterpolation is inherited

}
