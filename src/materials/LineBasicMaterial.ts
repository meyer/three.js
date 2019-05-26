import { Material } from './Material';
import { Color } from '../math/Color';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  linewidth: <float>,
 *  linecap: "round",
 *  linejoin: "round"
 * }
 */

export class LineBasicMaterial extends Material {

	constructor( parameters: any ) {

		super();

		this.type = 'LineBasicMaterial';

		this.color = new Color( 0xffffff );

		this.linewidth = 1;
		this.linecap = 'round';
		this.linejoin = 'round';

		this.lights = false;

		this.setValues( parameters );

	}

	linecap: string;
	linejoin: string;

	type = 'LineBasicMaterial' as const;
	isLineBasicMaterial = true as const;

	copy<T extends any>( source: T ): T {

		Material.prototype.copy.call( this, source );

		this.color!.copy( source.color );

		this.linewidth = source.linewidth;
		( this as LineBasicMaterial ).linecap = source.linecap;
		( this as LineBasicMaterial ).linejoin = source.linejoin;

		return this as any;

	}

}
