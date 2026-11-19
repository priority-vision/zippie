import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'ava';
import createZip from '../lib/command-create.js';

test('creates an archive with included files and excludes matching files', async t => {
	const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'zippie-test-'));
	t.teardown(() => fs.rm(cwd, { recursive: true, force: true }));
	await fs.mkdir(path.join(cwd, 'src'));
	await fs.writeFile(path.join(cwd, 'src', 'alpha.txt'), 'alpha');
	await fs.writeFile(path.join(cwd, 'src', 'beta.txt'), 'beta');
	await fs.writeFile(path.join(cwd, 'src', 'source.map'), 'map');
	await fs.writeFile(path.join(cwd, '.distzip'), 'src/*:!*.map\n');

	await createZip('dist/archive.zip', { cwd, config: '.distzip', verbose: false });

	const archive = await fs.readFile(path.join(cwd, 'dist', 'archive.zip'));
	t.is(archive.readUInt32LE(0), 0x04034b50);
	const end = archive.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
	t.true(end >= 0);
	t.is(archive.readUInt16LE(end + 10), 2);
	t.true(archive.includes(Buffer.from('src/alpha.txt')));
	t.true(archive.includes(Buffer.from('src/beta.txt')));
	t.false(archive.includes(Buffer.from('src/source.map')));
});
