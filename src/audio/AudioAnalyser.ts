import { Audio } from './Audio';

/**
 * @author mrdoob / http://mrdoob.com/
 */

export class AudioAnalyser {

	constructor( audio: Audio, fftSize ) {

		this.analyser = audio.context.createAnalyser();
		this.analyser.fftSize = fftSize !== undefined ? fftSize : 2048;

		this.data = new Uint8Array( this.analyser.frequencyBinCount );

		audio.getOutput().connect( this.analyser );

	}

	analyser: AnalyserNode;
	data: Uint8Array;

	getFrequencyData() {

		this.analyser.getByteFrequencyData( this.data );

		return this.data;

	}

	getAverageFrequency() {

		var value = 0,
			data = this.getFrequencyData();

		for ( var i = 0; i < data.length; i ++ ) {

			value += data[ i ];

		}

		return value / data.length;

	}

}
