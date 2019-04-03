#!/usr/bin/env node
const { SHA3 } = require('sha3');
const readline = require('readline');
const KEYLIMIT = 10;

const masterPass = "";

const keys = [];
const commands = ["make", "show"];

console.log(process.argv.length);
console.log(process.argv);
//const argv = parseArgv( process.argv );

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log( "Provide the keys for the hash:" );

rl.on( "line", ( input ) => {
  console.log( `Received: ${input}` );
  if ( keys.length <= KEYLIMIT && input != "" ) {
    keys.push( input );
  } else {
    rl.close();
    console.log( "Finished receiving keys." );
    generateHash( keys );
  }
});

function generateHash( keys ) {
  const hash = new SHA3( 256 );
  hash.update( keys.join( "" ) + masterPass );
  const hashString = hash.digest( "base64" ).substr( 0, 16 );
  console.log(hashString);
}

function parseArgv( argv ) {
  for( let i = 0; i < argv.length; i++ ) {

  }
}
