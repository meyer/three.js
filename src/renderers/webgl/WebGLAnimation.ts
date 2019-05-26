export type AnimationCallback = ( ...args: any[] ) => void;

/**
 * @author mrdoob / http://mrdoob.com/
 */

export class WebGLAnimation {

	private context: any | null = null;
	private isAnimating = false;
	private animationLoop: AnimationCallback | null = null;

	private onAnimationFrame( time: number, frame: any ) {

		if ( this.isAnimating === false ) return;
		if ( this.animationLoop === null ) return;

		this.animationLoop( time, frame );

		this.context.requestAnimationFrame( this.onAnimationFrame );

	}

	public start() {

		if ( this.isAnimating === true ) return;
		if ( this.animationLoop === null ) return;

		this.context.requestAnimationFrame( this.onAnimationFrame );

		this.isAnimating = true;

	}

	stop() {

		this.isAnimating = false;

	}

	setAnimationLoop( callback: AnimationCallback ) {

		this.animationLoop = callback;

	}

	setContext( value: any ) {

		this.context = value;

	}

}
