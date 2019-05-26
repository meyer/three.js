import { InterpolateDiscrete } from '../../constants';
import { KeyframeTrack } from '../KeyframeTrack';

/**
 *
 * A Track that interpolates Strings
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

export class StringKeyframeTrack extends KeyframeTrack {

	ValueTypeName = 'string' as const;
	ValueBufferType = Array;

	DefaultInterpolation = InterpolateDiscrete;

	InterpolantFactoryMethodLinear = undefined;

	InterpolantFactoryMethodSmooth = undefined;

}
