/**
 * @author abelnation / http://github.com/abelnation
 */

import { CylinderGeometry } from './CylinderGeometry';
import { CylinderBufferGeometry } from './CylinderGeometry';

// ConeGeometry

export class ConeGeometry extends CylinderGeometry {

	constructor(
		radius: number,
		height: number,
		radialSegments: any,
		heightSegments: any,
		openEnded: any,
		thetaStart: any,
		thetaLength: any
	) {

		super(
			0,
			radius,
			height,
			radialSegments,
			heightSegments,
			openEnded,
			thetaStart,
			thetaLength
		);

		this.type = 'ConeGeometry';

		this.parameters = {
			radius: radius,
			height: height,
			radialSegments: radialSegments,
			heightSegments: heightSegments,
			openEnded: openEnded,
			thetaStart: thetaStart,
			thetaLength: thetaLength,
		};

	}

	type: 'ConeGeometry';

	parameters: {
		radius: any;
		height: any;
		radialSegments: any;
		heightSegments: any;
		openEnded: any;
		thetaStart: any;
		thetaLength: any;
	};

}

// ConeBufferGeometry

export class ConeBufferGeometry extends CylinderBufferGeometry {

	constructor(
		radius: number,
		height: number,
		radialSegments: any,
		heightSegments: any,
		openEnded: any,
		thetaStart: any,
		thetaLength: any
	) {

		super(
			0,
			radius,
			height,
			radialSegments,
			heightSegments,
			openEnded,
			thetaStart,
			thetaLength
		);

		this.type = 'ConeBufferGeometry';

		this.parameters = {
			radius: radius,
			height: height,
			radialSegments: radialSegments,
			heightSegments: heightSegments,
			openEnded: openEnded,
			thetaStart: thetaStart,
			thetaLength: thetaLength,
		};

	}

	type: 'ConeBufferGeometry';

	parameters: {
		radius: any;
		height: any;
		radialSegments: any;
		heightSegments: any;
		openEnded: any;
		thetaStart: any;
		thetaLength: any;
	};

}
