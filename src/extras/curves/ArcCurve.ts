import { EllipseCurve } from './EllipseCurve';


function ArcCurve( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

	EllipseCurve.call( this, aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );

	this.type = 'ArcCurve';

}

ArcCurve.prototype = Object.create( EllipseCurve.prototype );
ArcCurve.prototype.constructor = ArcCurve;

ArcCurve.prototype.isArcCurve = true;


export { ArcCurve };
