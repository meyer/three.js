/**
 * @author mrdoob / http://mrdoob.com/
 */

function addLineNumbers( string: string ) {

	var lines = string.split( '\n' );

	for ( var i = 0; i < lines.length; i ++ ) {

		lines[ i ] = i + 1 + ': ' + lines[ i ];

	}

	return lines.join( '\n' );

}

export function WebGLShader(
	gl: WebGLRenderingContext | WebGL2RenderingContext,
	type: any,
	string: string,
	debug?: boolean
) {

	var shader = gl.createShader( type );

	if ( ! shader ) {

		throw new Error( 'Could not create shader' );

	}

	gl.shaderSource( shader, string );
	gl.compileShader( shader );

	if ( debug === true ) {

		if ( gl.getShaderParameter( shader, gl.COMPILE_STATUS ) === false ) {

			console.error( "THREE.WebGLShader: Shader couldn't compile." );

		}

		if ( gl.getShaderInfoLog( shader ) !== '' ) {

			console.warn(
				'THREE.WebGLShader: gl.getShaderInfoLog()',
				type === gl.VERTEX_SHADER ? 'vertex' : 'fragment',
				gl.getShaderInfoLog( shader ),
				addLineNumbers( string )
			);

		}

	}

	// --enable-privileged-webgl-extension
	// console.log( type, gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

	return shader;

}
