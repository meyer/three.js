import { Material } from './Material';
import { Color } from '../math/Color';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  size: <float>,
 *  sizeAttenuation: <bool>
 *
 *  morphTargets: <bool>
 * }
 */

export class PointsMaterial extends Material {

	constructor( parameters: Partial<Material> ) {

		super();

		this.color = new Color( 0xffffff );

		this.map = null;

		this.size = 1;
		this.sizeAttenuation = true;

		this.morphTargets = false;

		this.lights = false;

		this.setValues( parameters );

	}

	type = 'PointsMaterial' as const;
	color: Color;
	map: null | any;
	size: number;
	sizeAttenuation: boolean;
	morphTargets: boolean;
	lights: boolean;

	isPointsMaterial = true;

	setValues<K extends Extract<keyof PointsMaterial, string>>(
		values?: Pick<PointsMaterial, K>
	): void;

	setValues( ...args: any[] ): void {

		return super.setValues( ...args );

	}

	copy( source: Material ) {

		Material.prototype.copy.call( this, source );

		this.color.copy( source.color! );

		this.map = source.map;

		this.size = source.size;
		this.sizeAttenuation = source.sizeAttenuation;

		this.morphTargets = source.morphTargets;

		return this;

	}

}
