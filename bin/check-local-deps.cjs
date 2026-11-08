#!/usr/bin/env node
/**
 * Stops a publish when package.json still has local dependency links.
 *
 * Packages in this repo depend on each other with `file:../utils`, so they
 * use the local source during development. `lerna publish` replaces those
 * links with real versions (e.g. `^0.14.0`) and writes package.json before
 * `prepublishOnly` runs, so this check passes. A direct `npm publish` keeps
 * the links, and the published package could not be installed, so this
 * check fails it.
 *
 * Usage, in a package's package.json:
 * "prepublishOnly": "node ../../bin/check-local-deps.cjs"
 */
const fs = require( 'fs' );
const path = require( 'path' );

const manifestPath = path.join( process.cwd(), 'package.json' );
const manifest = JSON.parse( fs.readFileSync( manifestPath, 'utf8' ) );

// devDependencies are not installed by consumers, so they may stay local.
const FIELDS = [ 'dependencies', 'peerDependencies', 'optionalDependencies' ];
const LOCAL = /^(file|link):/;

const found = FIELDS.flatMap( ( field ) =>
	Object.entries( manifest[ field ] || {} )
		.filter( ( [ , spec ] ) => LOCAL.test( spec ) )
		.map( ( [ name, spec ] ) => `  ${ field }: "${ name }": "${ spec }"` )
);

if ( found.length > 0 ) {
	console.error(
		[
			`\n${ manifest.name } has local dependency links:`,
			...found,
			'\nPublish with "npx lerna publish" from the repository root.',
			'Lerna replaces these links with real versions before publishing.\n',
		].join( '\n' )
	);
	process.exit( 1 );
}
