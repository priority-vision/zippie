#!/usr/bin/env node
import meow from 'meow';
import createZip from './lib/command-create.js';

const cli = meow(`
	Usage
	  $ distzip [destination] [options]

	Arguments
	  destination    Path to the output zip file (default: output.zip)

	Options
	  --config, -c   Path to configuration file (default: .distzip)
	  --cwd, -d      Working directory (default: current directory)
	  --verbose, -v  Show verbose output

	Examples
	  $ distzip
	  $ distzip dist/theme.zip
	  $ distzip --config custom-config.txt
	  $ distzip theme.zip --verbose
`, {
	importMeta: import.meta,
	flags: {
		config: {
			type: 'string',
			shortFlag: 'c',
			default: '.distzip'
		},
		cwd: {
			type: 'string',
			shortFlag: 'd',
			default: process.cwd()
		},
		verbose: {
			type: 'boolean',
			shortFlag: 'v',
			default: false
		}
	}
});

// Get destination from first input or use default
const destination = cli.input[0] || 'output.zip';

// Call the create function with CLI options
createZip(destination, cli.flags);
