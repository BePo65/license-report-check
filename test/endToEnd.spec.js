import assert from 'node:assert';
import cp from 'node:child_process';
import path from 'node:path';
import url from 'node:url';
import util from 'node:util';

const execAsPromise = util.promisify(cp.exec);

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const scriptPath = path
  .resolve(__dirname, '..', 'index.js')
  .replace(/(\s+)/g, '\\$1');

// test data for e2e test using the default fields
const packageJsonPath = path
  .resolve(__dirname, 'fixture', 'test-package.json')
  .replace(/(\s+)/g, '\\$1');

describe('end to end test', () => {
  describe('end to end test with default values', function () {
    this.timeout(60000);
    this.slow(5000);

    it('produce a json report', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --source=${packageJsonPath}`,
      );
      const result = JSON.parse(stdout);
      const expectedJsonResult = JSON.parse(
        '{"notAllowed":[],"forbidden":[],"unknown":[{"name":"eol","link":"git+https://github.com/ryanve/eol.git","remoteVersion":"0.10.0","installedVersion":"0.10.0","definedVersion":"^0.10.0","author":"Ryan Van Etten"}]}',
      );

      assert.deepStrictEqual(result, expectedJsonResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });
  });
});
