/**
 * @author fordacious / fordacious.github.io
 */

export class WebGLProperties {

	private properties = new WeakMap<any>();

	public get( object: any ) {

		let map = this.properties.get( object );

		if ( map === undefined ) {

			map = {};
			this.properties.set( object, map );

		}

		return map;

	}

	public remove( object: any ) {

		this.properties.delete( object );

	}

	public update( object: any, key: string, value: any ) {

		this.properties.get( object )[ key ] = value;

	}

	public dispose() {

		this.properties = new WeakMap();

	}

}
