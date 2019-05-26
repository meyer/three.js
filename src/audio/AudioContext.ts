/**
 * @author mrdoob / http://mrdoob.com/
 */

var context: AudioContext;

const AudioContextObj = {
	getContext(): AudioContext {

		if ( context === undefined ) {

			context = new ( AudioContext || ( window as any ).webkitAudioContext )();

		}

		return context;

	},

	setContext: function ( value: AudioContext ): void {

		context = value;

	},
};

export { AudioContextObj as AudioContext };
