/**
 * @author mrdoob / http://mrdoob.com/
 */

export class Layers {

	mask = 1 | 0;

	set( channel: number ) {

		this.mask = ( 1 << channel ) | 0;

	}

	enable( channel: number ) {

		this.mask |= ( 1 << channel ) | 0;

	}

	toggle( channel: number ) {

		this.mask ^= ( 1 << channel ) | 0;

	}

	disable( channel: number ) {

		this.mask &= ~ ( ( 1 << channel ) | 0 );

	}

	test( layers: Layers ) {

		return ( this.mask & layers.mask ) !== 0;

	}

}
