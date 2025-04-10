# Zippie

CLI tool to create zip archives using a configuration file.

## Table of Contents

- [Zippie](#zippie)
	- [Table of Contents](#table-of-contents)
	- [Installation](#installation)
	- [Usage](#usage)
	- [Configuration File](#configuration-file)
		- [Supported Pattern Types](#supported-pattern-types)
	- [Commands and Options](#commands-and-options)
	- [Examples](#examples)
	- [Developer Setup](#developer-setup)
	- [Copyright \& License](#copyright--license)

## Installation

Ensure you have Node.js installed. Then, install Zippie globally using npm:

```bash
npm install -g zippie
```

or install locally in your project:

```bash
npm install -D zippie
```

## Usage

```bash
zippie [destination] [options]
```

## Configuration File

Zippie uses a configuration file (default: `.distzip`) to specify which files to include in the zip archive. The file format is simple:

- Each line represents a pattern to include
- Lines starting with `#` are treated as comments
- Exclusion patterns can be specified using `:!` syntax

### Supported Pattern Types

1. **Simple glob patterns**:
   ```
   assets/*
   *.hbs
   package.json
   ```

2. **Exclusion patterns**:
   ```
   *.hbs:!demo-*
   ```
   This includes all `.hbs` files but excludes those starting with `demo-`.

3. **Directory patterns**:
   ```
   locales/**/*
   ```
   This includes all files in the `locales` directory and its subdirectories.

## Commands and Options

```bash
zippie [destination] [options]
```

| Argument     | Description                                | Default     |
| ------------ | :----------------------------------------- | :---------- |
| `destination` | Path to the output zip file                | `output.zip` |

| Option            | Description                                | Default     |
| ----------------- | :----------------------------------------- | :---------- |
| `-c`, `--config`  | Path to configuration file                 | `.distzip`  |
| `-d`, `--cwd`     | Working directory                          | Current dir |
| `-v`, `--verbose` | Show verbose output                        | `false`     |

## Examples

Create a zip file using the default configuration:

```bash
zippie
```

Specify a custom destination:

```bash
zippie dist/theme.zip
```

Use a custom configuration file:

```bash
zippie --config custom-config.txt
```

Show verbose output:

```bash
zippie theme.zip --verbose
```

## Developer Setup

1. Fork this repo
2. `git clone https://github.com/priority-vision/zippie.git path/to/your/workspace`
3. `cd path/to/your/workspace`
4. `npm install`

To run the CLI using your workspace files:

1. `npm link`
2. `zippie [destination] [options]` (you can run anywhere on your system)

## Copyright & License

- MIT License
- Copyright (c) 2025 Priority Vision.
