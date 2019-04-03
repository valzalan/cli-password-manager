#!/usr/bin/env node
const { SHA3 } = require('sha3');
const ini = require("ini");
const fs = require("fs");
const readline = require('readline');
const KEYLIMIT = 10;

const commands = ["init", "show", "set"];
const flags = ["k", "masterpass"];

parseArgv( process.argv );

process.exit(0);

function generateHash( keys ) {
  const hash = new SHA3( 256 );
  let masterPass = "";
  hash.update( keys.join( "" ) + masterPass );
  const hashString = hash.digest( "base64" ).substr( 0, 16 );
  console.log(hashString);
}

function parseArgv( argv ) {
  if ( argv[2] == undefined || commands.indexOf(argv[2]) == -1 && !isFlag(argv[2]) ) {
    console.error("Invalid command");
    printHelp();
  } else if ( isFlag( argv[2] ) ) {
    switch (argv[2].substr(1)) {
      // k
      case flags[0]:
        let keys = collectKeys( argv );
        generateHash( keys )
    }
  } else {
    switch (argv[2]) {
      case commands[0]:
        init();
        break;
      case commands[1]:
        break;
      case commands[2]:
        setMasterPass();
        break;
      default:
        console.error("Internal error");
    }
  }
}

function init() {
  console.log("This process will set up your personal password manager.");
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ""
  });
  
  let config = {
    masterPassHash: ""
  };

  fs.writeFileSync("./config.ini", ini.stringify(config));

  console.log("Do you want to set a master password? Y/N (Recommended)");
  rl.on("line", (answer) => {
    if(["n", "N", "no", "NO", "No"].includes(answer)) {
      console.log("Initialized without a master password.");
      console.log("You can set the master password later using set -masterpass");
      rl.close();
    } else if(["y", "Y", "yes", "YES", "Yes"].includes(answer)) {
      setMasterPass();
      rl.close();
      console.log("Initialized with a master password.");
      console.log("You can change it using set -masterpass");
    } else {
      console.log("Answer should be Y or N.");
    }
  });
  process.exit(0);
}

function setMasterPass() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));
  
  //const masterPassExists
  // A master password is already set. Ask for it before setting a new one.
  if ( config.masterPassHash != "" ) {
    let tries = 0;
    let oldMasterPassHash = "";
    //TODO: Reevaluate do loop
    console.log("Enter your current master password:");

    rl.on("line", ( oldMasterPass ) => { 
      if ( oldMasterPass == "" ) {
        rl.close();
        return;
      }
      if( generateHash( oldMasterPass ) != config.masterPassHash && tries < 5 ) {
        console.log("Incorrect password. Try again.");
        tries++;
      }
    });
  }

  rl.question("Provide your master password:", (masterPass) => {
    config.masterPassHash = generateHash(masterPass);
    fs.writeFileSync("./config.ini", ini.stringify(config));
    rl.close();
  });
}

function collectKeys( argv ) {
  let keys = [];
  let limit = argv.length > KEYLIMIT + 3 ? KEYLIMIT + 3 : argv.length;
  for ( let i = 3; i < limit; i++ ) {
    keys.push(argv[i]);
  }
  return keys;
}

function printHelp() {
  console.log("-----PassW help-----");
  console.log("Available commands: ");
  console.log("make: Creates a new password.");
  console.log("show: Shows a previously created and saved password.");
}

function isFlag( str ) {
  return str[0] == "-" && flags.indexOf(str.substr(1)) != -1;
}