import { Object3D } from '../core/Object3D';

/**
 * @author mrdoob / http://mrdoob.com/
 */

export class Group extends Object3D {

	type = 'Group' as const;
	isGroup = true as const;

}
