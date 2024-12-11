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

// test data for e2e tests
const packageOkJsonPath = path
  .resolve(__dirname, 'fixture', 'package.ok.test.json')
  .replace(/(\s+)/g, '\\$1');
const packageUnknownJsonPath = path
  .resolve(__dirname, 'fixture', 'package.unknown.test.json')
  .replace(/(\s+)/g, '\\$1');

describe('end to end test', () => {
  describe('with default values', function () {
    this.timeout(60000);
    this.slow(5000);

    it('produces a json report', async () => {
      try {
        await execAsPromise(
          `node ${scriptPath} --source=${packageUnknownJsonPath}`,
        );
      } catch (err) {
        const result = JSON.parse(err.stdout);
        // cSpell:disable
        const expectedJsonResult = JSON.parse(
          '{"notAllowed":[],"forbidden":[],"unknown":[{"name":"eol","link":"git+https://github.com/ryanve/eol.git","remoteVersion":"0.10.0","installedVersion":"0.10.0","definedVersion":"^0.10.0","author":"Ryan Van Etten"}]}',
        );
        // cSpell:enable

        assert.deepStrictEqual(result, expectedJsonResult);
        assert.strictEqual(err.stderr, '', 'expected no warnings');
        assert.equal(err.code, 8);
      }
    });
  });

  describe('sets exit code to', function () {
    this.timeout(60000);
    this.slow(5000);

    it('0 - no errors', async () => {
      try {
        // Taken from https://github.com/nodejs/node/issues/34234#issuecomment-655504474
        await execAsPromise(`node ${scriptPath} --source=${packageOkJsonPath}`);
      } catch (err) {
        const result = JSON.parse(err.stdout);
        const expectedJsonResult = JSON.parse(
          '{"notAllowed":[],"forbidden":[],"unknown":[]}',
        );

        assert.deepStrictEqual(result, expectedJsonResult);
        assert.strictEqual(err.stderr, '', 'expected no warnings');
        assert.equal(err.code, 0);
      }
    });

    it('2 - not allowed licenses', async () => {
      try {
        // Taken from https://github.com/nodejs/node/issues/34234#issuecomment-655504474
        await execAsPromise(
          `node ${scriptPath} --source=${packageOkJsonPath} --allowed=MIT`,
        );
      } catch (err) {
        const result = JSON.parse(err.stdout);
        // cSpell:disable
        const expectedJsonResult = JSON.parse(
          '{"notAllowed":[{"author":"GitHub Inc.","definedVersion":"^7.6.3","installedVersion":"7.6.3","licenseType":"ISC","link":"git+https://github.com/npm/node-semver.git","name":"semver","remoteVersion":"7.6.3"},{"author":"Ben Coe <ben@npmjs.com>","definedVersion":"^12.5.0","installedVersion":"12.5.0","licenseType":"ISC","link":"git+https://github.com/absolute-version/commit-and-tag-version.git","name":"commit-and-tag-version","remoteVersion":"12.5.0"},{"author":"Gajus Kuizinas gajus@gajus.com http://gajus.com","definedVersion":"^50.6.0","installedVersion":"50.6.0","licenseType":"BSD-3-Clause","link":"git+https://github.com/gajus/eslint-plugin-jsdoc.git","name":"eslint-plugin-jsdoc","remoteVersion":"50.6.0"},{"author":"Node Security Project","definedVersion":"^3.0.1","installedVersion":"3.0.1","licenseType":"Apache-2.0","link":"git+https://github.com/eslint-community/eslint-plugin-security.git","name":"eslint-plugin-security","remoteVersion":"3.0.1"},{"author":"gkouziik","definedVersion":"^1.1.4","installedVersion":"1.1.4","licenseType":"ISC","link":"git+https://github.com/gkouziik/eslint-plugin-security-node.git","name":"eslint-plugin-security-node","remoteVersion":"1.1.4"}],"forbidden":[],"unknown":[]}',
        );
        // cSpell:enable

        assert.deepStrictEqual(result, expectedJsonResult);
        assert.strictEqual(err.stderr, '', 'expected no warnings');
        assert.equal(err.code, 2);
      }
    });

    it('4 - forbidden licenses', async () => {
      try {
        // Taken from https://github.com/nodejs/node/issues/34234#issuecomment-655504474
        await execAsPromise(
          `node ${scriptPath} --source=${packageOkJsonPath} --forbidden=Apache-2.0`,
        );
      } catch (err) {
        const result = JSON.parse(err.stdout);
        const expectedJsonResult = JSON.parse(
          '{"notAllowed":[],"forbidden":[{"author":"Node Security Project","definedVersion":"^3.0.1","installedVersion":"3.0.1","licenseType":"Apache-2.0","link":"git+https://github.com/eslint-community/eslint-plugin-security.git","name":"eslint-plugin-security","remoteVersion":"3.0.1"}],"unknown":[]}',
        );

        assert.deepStrictEqual(result, expectedJsonResult);
        assert.strictEqual(err.stderr, '', 'expected no warnings');
        assert.equal(err.code, 4);
      }
    });

    it('8 - unknown licenses', async () => {
      try {
        // Taken from https://github.com/nodejs/node/issues/34234#issuecomment-655504474
        await execAsPromise(
          `node ${scriptPath} --source=${packageUnknownJsonPath}`,
        );
      } catch (err) {
        const result = JSON.parse(err.stdout);
        // cSpell:disable
        const expectedJsonResult = JSON.parse(
          '{"notAllowed":[],"forbidden":[],"unknown":[{"name":"eol","link":"git+https://github.com/ryanve/eol.git","remoteVersion":"0.10.0","installedVersion":"0.10.0","definedVersion":"^0.10.0","author":"Ryan Van Etten"}]}',
        );
        // cSpell:enable

        assert.deepStrictEqual(result, expectedJsonResult);
        assert.strictEqual(err.stderr, '', 'expected no warnings');
        assert.equal(err.code, 8);
      }
    });

    it('14 - all result types', async () => {
      try {
        // Taken from https://github.com/nodejs/node/issues/34234#issuecomment-655504474
        await execAsPromise(
          `node ${scriptPath} --source=${packageUnknownJsonPath} --allowed=MIT --forbidden=Apache-2.0`,
        );
      } catch (err) {
        const result = JSON.parse(err.stdout);
        // cSpell:disable
        const expectedJsonResult = JSON.parse(
          '{"notAllowed":[{"name":"eol","link":"git+https://github.com/ryanve/eol.git","remoteVersion":"0.10.0","installedVersion":"0.10.0","definedVersion":"^0.10.0","author":"Ryan Van Etten"},{"name":"semver","licenseType":"ISC","link":"git+https://github.com/npm/node-semver.git","remoteVersion":"7.6.3","installedVersion":"7.6.3","definedVersion":"^7.6.3","author":"GitHub Inc."},{"name":"commit-and-tag-version","licenseType":"ISC","link":"git+https://github.com/absolute-version/commit-and-tag-version.git","remoteVersion":"12.5.0","installedVersion":"12.5.0","definedVersion":"^12.5.0","author":"Ben Coe <ben@npmjs.com>"},{"name":"eslint-plugin-jsdoc","licenseType":"BSD-3-Clause","link":"git+https://github.com/gajus/eslint-plugin-jsdoc.git","remoteVersion":"50.6.0","installedVersion":"50.6.0","definedVersion":"^50.6.0","author":"Gajus Kuizinas gajus@gajus.com http://gajus.com"},{"name":"eslint-plugin-security","licenseType":"Apache-2.0","link":"git+https://github.com/eslint-community/eslint-plugin-security.git","remoteVersion":"3.0.1","installedVersion":"3.0.1","definedVersion":"^3.0.1","author":"Node Security Project"},{"name":"eslint-plugin-security-node","licenseType":"ISC","link":"git+https://github.com/gkouziik/eslint-plugin-security-node.git","remoteVersion":"1.1.4","installedVersion":"1.1.4","definedVersion":"^1.1.4","author":"gkouziik"}],"forbidden":[{"name":"eol","link":"git+https://github.com/ryanve/eol.git","remoteVersion":"0.10.0","installedVersion":"0.10.0","definedVersion":"^0.10.0","author":"Ryan Van Etten"},{"name":"eslint-plugin-security","licenseType":"Apache-2.0","link":"git+https://github.com/eslint-community/eslint-plugin-security.git","remoteVersion":"3.0.1","installedVersion":"3.0.1","definedVersion":"^3.0.1","author":"Node Security Project"}],"unknown":[{"name":"eol","link":"git+https://github.com/ryanve/eol.git","remoteVersion":"0.10.0","installedVersion":"0.10.0","definedVersion":"^0.10.0","author":"Ryan Van Etten"}]}',
        );
        // cSpell:enable

        assert.deepStrictEqual(result, expectedJsonResult);
        assert.strictEqual(err.stderr, '', 'expected no warnings');
        assert.equal(err.code, 14);
      }
    });
  });
});
