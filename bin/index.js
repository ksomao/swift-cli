#!/usr/bin/env node
const process = require('process');
const Command = require('./Command');
const File = require('./FileManager');

let arguments = process.argv.splice(2)
let file = new File();
let swift = new Command(file);
swift.exec(arguments)


