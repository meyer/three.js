import { Color } from '../math/Color';
import { Vector3 } from '../math/Vector3';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

export class Face3 {

	constructor(
		a: number,
		b: number,
		c: number,
		normal?: Vector3,
		color?: Color,
		materialIndex?: number
	) {

		this.a = a;
		this.b = b;
		this.c = c;

		this.normal = normal && normal.isVector3 ? normal : new Vector3();
		this.vertexNormals = Array.isArray( normal ) ? normal : [];

		this.color = color && color.isColor ? color : new Color( 0 );
		this.vertexColors = Array.isArray( color ) ? color : [];

		this.materialIndex = materialIndex !== undefined ? materialIndex : 0;

	}

	a: number;
	b: number;
	c: number;
	normal: Vector3;
	vertexNormals: Vector3[];
	color: Color;
	vertexColors: Color[];
	materialIndex: number;

	__originalFaceNormal?: Vector3;
	__originalVertexNormals?: Vector3[];

	clone() {

		return new Face3( this.a, this.b, this.c ).copy( this );

	}

	copy( source: Face3 ) {

		this.a = source.a;
		this.b = source.b;
		this.c = source.c;

		this.normal.copy( source.normal );
		this.color.copy( source.color );

		this.materialIndex = source.materialIndex;

		for ( var i = 0, il = source.vertexNormals.length; i < il; i ++ ) {

			this.vertexNormals[ i ] = source.vertexNormals[ i ].clone();

		}

		for ( var i = 0, il = source.vertexColors.length; i < il; i ++ ) {

			this.vertexColors[ i ] = source.vertexColors[ i ].clone();

		}

		return this;

	}

}
