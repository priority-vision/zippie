import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { glob } from 'glob';
import chalk from 'chalk';
import ora from 'ora';
import archiver from 'archiver';

export default async function createZip(destination, options) {
	const { config, cwd, verbose } = options;

	const spinner = ora({
		text: 'Creating zip archive...',
		color: 'green',
		spinner: 'dots',
	}).start();

	try {
		// Resolve paths
		const configPath = path.resolve(cwd, config);
		const destPath = path.resolve(cwd, destination);

		// Ensure the destination directory exists
		const destDir = path.dirname(destPath);
		if (!fs.existsSync(destDir)) {
			fs.mkdirSync(destDir, { recursive: true });
		}

		// Check if config file exists
		if (!fs.existsSync(configPath)) {
			spinner.fail();
			console.log(chalk.red(`distzip: ❌ Configuration file not found: ${configPath}`));
			return;
		}

		// Read the config file
		const configContent = fs.readFileSync(configPath, 'utf8');

		// Parse the file patterns
		const patterns = configContent.split('\n')
			.map(line => line.trim())
			.filter(line => line && !line.startsWith('#'));

		if (patterns.length === 0) {
			spinner.fail();
			console.log(chalk.red('distzip: ❌ No patterns found in configuration file.'));
			return;
		}

		if (verbose) {
			spinner.info(`distzip: Found ${patterns.length} patterns in configuration file.`);
			spinner.start();
		}

		// Create a write stream for the zip file
		const output = createWriteStream(destPath);
		const archive = archiver('zip', { zlib: { level: 9 } });

		// Set up promise to track completion
		const archiveFinished = new Promise((resolve, reject) => {
			output.on('close', () => {
				resolve(archive.pointer());
			});

			archive.on('error', (err) => {
				reject(err);
			});
		});

		// Pipe archive data to the file
		archive.pipe(output);

		let totalFiles = 0;

		// Process each pattern
		for (const pattern of patterns) {
			if (pattern.includes(':!')) {
				// Handle inclusion with exclusion
				const [includePart, excludePart] = pattern.split(':!');

				// Convert exclusion pattern to a regex for matching
				const excludeRegex = new RegExp(excludePart.replace('*', '.*'));

				// Find files that match the include pattern
				const files = await glob(includePart, { cwd });

				// Filter out files that match the exclude pattern
				const filteredFiles = files.filter(file => !excludeRegex.test(path.basename(file)));

				filteredFiles.forEach(file => {
					const fullPath = path.resolve(cwd, file);
					archive.file(fullPath, { name: file });
					totalFiles++;
				});

				if (verbose) {
					spinner.info(`distzip: Pattern "${pattern}" matched ${filteredFiles.length} files.`);
					spinner.start();
				}
			} else {
				// Simple inclusion pattern
				const files = await glob(pattern, { cwd });

				files.forEach(file => {
					const fullPath = path.resolve(cwd, file);
					archive.file(fullPath, { name: file });
					totalFiles++;
				});

				if (verbose) {
					spinner.info(`distzip: Pattern "${pattern}" matched ${files.length} files.`);
					spinner.start();
				}
			}
		}

		// Finalize the archive
		await archive.finalize();

		// Wait for the archive to finish and get the size
		const size = await archiveFinished;

		spinner.succeed();
		console.log(chalk.green(`distzip: ✅ Archive created successfully: ${destination}`));
		console.log(chalk.green(`distzip: Total files: ${chalk.cyan(totalFiles)}`));
		console.log(chalk.green(`distzip: Archive size: ${chalk.cyan(formatBytes(size))}`));

	} catch (error) {
		spinner.fail();
		console.error(chalk.red(`distzip: ❌ Error creating zip: ${error.message}`));
		if (verbose) {
			console.error(error);
		}
		process.exit(1);
	}
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
