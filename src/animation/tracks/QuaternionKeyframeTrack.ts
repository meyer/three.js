import { InterpolateLinear } from '../../constants';
import { KeyframeTrack } from '../KeyframeTrack';
import { QuaternionLinearInterpolant } from '../../math/interpolants/QuaternionLinearInterpolant';

/**
 *
 * A Track of quaternion keyframe values.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

export class QuaternionKeyframeTrack extends KeyframeTrack {

	ValueTypeName = 'quaternion' as const;

	// ValueBufferType is inherited

	DefaultInterpolation = InterpolateLinear;

	InterpolantFactoryMethodLinear( result: any ) {

		return new QuaternionLinearInterpolant(
			this.times,
			this.values,
			this.getValueSize(),
			result
		);

	}

	InterpolantFactoryMethodSmooth = undefined; // not yet implemented

}
