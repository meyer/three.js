type XYZ = 'x' | 'y' | 'z';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Geometry } from '../core/Geometry';
import { BufferGeometry } from '../core/BufferGeometry';
import { Float32BufferAttribute } from '../core/BufferAttribute';
import { Vector3 } from '../math/Vector3';

// BoxGeometry

export class BoxGeometry extends Geometry {

	constructor(
		width: number,
		height: number,
		depth: any,
		widthSegments: any,
		heightSegments: any,
		depthSegments: any
	) {

		super();

		this.type = 'BoxGeometry';

		this.parameters = {
			width: width,
			height: height,
			depth: depth,
			widthSegments: widthSegments,
			heightSegments: heightSegments,
			depthSegments: depthSegments,
		};

		this.fromBufferGeometry(
			new BoxBufferGeometry(
				width,
				height,
				depth,
				widthSegments,
				heightSegments,
				depthSegments
			)
		);
		this.mergeVertices();

	}

	type: string;

	parameters: {
		width: any;
		height: any;
		depth: any;
		widthSegments: any;
		heightSegments: any;
		depthSegments: any;
	};

}

// BoxBufferGeometry

export class BoxBufferGeometry extends BufferGeometry {

	constructor(
		width?: number,
		height?: number,
		depth?: any,
		widthSegments?: any,
		heightSegments?: any,
		depthSegments?: any
	) {

		super();

		this.type = 'BoxBufferGeometry';

		this.parameters = {
			width: width,
			height: height,
			depth: depth,
			widthSegments: widthSegments,
			heightSegments: heightSegments,
			depthSegments: depthSegments,
		};

		var scope = this;

		width = width || 1;
		height = height || 1;
		depth = depth || 1;

		// segments

		widthSegments = Math.floor( widthSegments ) || 1;
		heightSegments = Math.floor( heightSegments ) || 1;
		depthSegments = Math.floor( depthSegments ) || 1;

		// buffers

		this.indices = [];
		this.vertices = [];
		this.normals = [];
		this.uvs = [];

		// helper variables

		var numberOfVertices = 0;
		var groupStart = 0;

		const buildPlane = (
			u: XYZ,
			v: XYZ,
			w: XYZ,
			udir: number,
			vdir: number,
			width: number,
			height: number,
			depth: number,
			gridX: number,
			gridY: number,
			materialIndex: number
		) => {

			var segmentWidth = width / gridX;
			var segmentHeight = height / gridY;

			var widthHalf = width / 2;
			var heightHalf = height / 2;
			var depthHalf = depth / 2;

			var gridX1 = gridX + 1;
			var gridY1 = gridY + 1;

			var vertexCounter = 0;
			var groupCount = 0;

			var ix: number, iy: number;

			var vector = new Vector3();

			// generate vertices, normals and uvs

			for ( iy = 0; iy < gridY1; iy ++ ) {

				var y = iy * segmentHeight - heightHalf;

				for ( ix = 0; ix < gridX1; ix ++ ) {

					var x = ix * segmentWidth - widthHalf;

					// set values to correct vector component

					vector[ u ] = x * udir;
					vector[ v ] = y * vdir;
					vector[ w ] = depthHalf;

					// now apply vector to vertex buffer

					this.vertices.push( vector.x, vector.y, vector.z );

					// set values to correct vector component

					vector[ u ] = 0;
					vector[ v ] = 0;
					vector[ w ] = depth > 0 ? 1 : - 1;

					// now apply vector to normal buffer

					this.normals.push( vector.x, vector.y, vector.z );

					// uvs

					this.uvs.push( ix / gridX );
					this.uvs.push( 1 - iy / gridY );

					// counters

					vertexCounter += 1;

				}

			}

			// indices

			// 1. you need three indices to draw a single face
			// 2. a single segment consists of two faces
			// 3. so we need to generate six (2*3) indices per segment

			for ( iy = 0; iy < gridY; iy ++ ) {

				for ( ix = 0; ix < gridX; ix ++ ) {

					var a = numberOfVertices + ix + gridX1 * iy;
					var b = numberOfVertices + ix + gridX1 * ( iy + 1 );
					var c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
					var d = numberOfVertices + ( ix + 1 ) + gridX1 * iy;

					// faces

					this.indices.push( a, b, d );
					this.indices.push( b, c, d );

					// increase counter

					groupCount += 6;

				}

			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup( groupStart, groupCount, materialIndex );

			// calculate new start value for groups

			groupStart += groupCount;

			// update total number of vertices

			numberOfVertices += vertexCounter;

		};

		// build each side of the box geometry

		buildPlane(
			'z',
			'y',
			'x',
			- 1,
			- 1,
			depth,
			height,
			width,
			depthSegments,
			heightSegments,
			0
		); // px
		buildPlane(
			'z',
			'y',
			'x',
			1,
			- 1,
			depth,
			height,
			- width,
			depthSegments,
			heightSegments,
			1
		); // nx
		buildPlane(
			'x',
			'z',
			'y',
			1,
			1,
			width,
			depth,
			height,
			widthSegments,
			depthSegments,
			2
		); // py
		buildPlane(
			'x',
			'z',
			'y',
			1,
			- 1,
			width,
			depth,
			- height,
			widthSegments,
			depthSegments,
			3
		); // ny
		buildPlane(
			'x',
			'y',
			'z',
			1,
			- 1,
			width,
			height,
			depth,
			widthSegments,
			heightSegments,
			4
		); // pz
		buildPlane(
			'x',
			'y',
			'z',
			- 1,
			- 1,
			width,
			height,
			- depth,
			widthSegments,
			heightSegments,
			5
		); // nz

		// build geometry

		this.setIndex( this.indices );
		this.addAttribute( 'position', new Float32BufferAttribute( this.vertices, 3 ) );
		this.addAttribute( 'normal', new Float32BufferAttribute( this.normals, 3 ) );
		this.addAttribute( 'uv', new Float32BufferAttribute( this.uvs, 2 ) );

	}

	private indices: any[];
	private vertices: any[];
	private normals: any[];
	private uvs: any[];

	public parameters: {
		width: any;
		height: any;
		depth: any;
		widthSegments: any;
		heightSegments: any;
		depthSegments: any;
	};

}
