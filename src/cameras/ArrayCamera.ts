/**
 * @author mrdoob / http://mrdoob.com/
 */

import { PerspectiveCamera } from './PerspectiveCamera';
import { Camera } from './Camera';

export class ArrayCamera<T extends Camera> extends PerspectiveCamera {

	constructor( array: T[] ) {

		super();

		this.cameras = array || [];

	}

	cameras: T[];

	isArrayCamera = true as const;

}
