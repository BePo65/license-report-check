import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';

import { stub } from 'sinon';
import StreamTest from 'streamtest';

import config from '../lib/config.js';
import { getFormatter } from '../lib/formatter.js';

import {
  CheckLicenseTypeTransform,
  // createJsonReadable,
  FormatterWritable,
} from '../lib/util-stream.js';

describe('util-stream ', () => {
  describe('createJsonReadable', () => {
    it('creates a readable from a file', () => {
      // TODO add test here
    });
  });

  describe('CheckLicenseTypeTransform', () => {
    let sourceData;

    before(async () => {
      sourceData = JSON.parse(
        await readFile(
          new URL('../fixture/test-package.json', `${import.meta.url}/test`),
        ),
      ).map((element, index) => {
        return { key: index.toString(), value: element };
      });
    });

    it('classifies license types', async () => {
      const allowed = ['MIT'];
      const forbidden = ['Apache-2.0'];
      const [outputStream, resultPromise] = StreamTest.toObjects();

      await pipeline(
        StreamTest.fromObjects(sourceData),
        new CheckLicenseTypeTransform(allowed, forbidden),
        outputStream,
      );

      const result = await resultPromise;

      assert(Array.isArray(result));
      assert.equal(result.length, 1);
      assert.deepStrictEqual(result[0], EXPECTED_RESULT_CLASSIFICATION);
    });
  });

  describe('FormatterWritable', () => {
    let testConfig;

    beforeEach(() => {
      testConfig = structuredClone(config);
    });

    it('creates a writable with json formatter', async () => {
      const consoleStub = stub(console, 'log');
      testConfig.output = 'json';
      const outputFormatter = getFormatter(testConfig.output);

      const resultPromise = new Promise((resolve, reject) => {
        StreamTest.fromObjects([EXPECTED_RESULT_CLASSIFICATION])
          .pipe(new FormatterWritable(outputFormatter, testConfig))
          .on('finish', resolve)
          .on('error', reject);
      });

      await resultPromise;
      const expectedResult = JSON.stringify(EXPECTED_RESULT_CLASSIFICATION);

      assert(consoleStub.calledOnce);
      assert.deepStrictEqual(consoleStub.firstCall.firstArg, expectedResult);

      consoleStub.restore();
    });

    it('creates a writable with csv formatter', async () => {
      const consoleStub = stub(console, 'log');
      testConfig.output = 'csv';
      const outputFormatter = getFormatter(testConfig.output);

      const resultPromise = new Promise((resolve, reject) => {
        StreamTest.fromObjects([EXPECTED_RESULT_CLASSIFICATION])
          .pipe(new FormatterWritable(outputFormatter, testConfig))
          .on('finish', resolve)
          .on('error', reject);
      });

      await resultPromise;

      assert(consoleStub.calledOnce);
      assert.deepStrictEqual(
        consoleStub.firstCall.firstArg,
        EXPECTED_RESULT_CSV_FORMATTER,
      );

      consoleStub.restore();
    });

    it('creates a writable with table formatter', async () => {
      const consoleStub = stub(console, 'log');
      testConfig.output = 'table';
      const outputFormatter = getFormatter(testConfig.output);

      const resultPromise = new Promise((resolve, reject) => {
        StreamTest.fromObjects([EXPECTED_RESULT_CLASSIFICATION])
          .pipe(new FormatterWritable(outputFormatter, testConfig))
          .on('finish', resolve)
          .on('error', reject);
      });

      await resultPromise;

      assert(consoleStub.calledOnce);
      assert.deepStrictEqual(
        consoleStub.firstCall.firstArg,
        EXPECTED_RESULT_TABLE_FORMATTER,
      );

      consoleStub.restore();
    });
  });
});

// cSpell:disable
const EXPECTED_RESULT_CLASSIFICATION = {
  notAllowed: [
    {
      name: 'eol',
      link: 'git+https://github.com/ryanve/eol.git',
      remoteVersion: '0.10.0',
      installedVersion: '0.10.0',
      definedVersion: '^0.10.0',
      author: 'Ryan Van Etten',
    },
    {
      name: 'semver',
      licenseType: 'ISC',
      link: 'git+https://github.com/npm/node-semver.git',
      remoteVersion: '7.6.3',
      installedVersion: '7.6.3',
      definedVersion: '^7.6.3',
      author: 'GitHub Inc.',
    },
    {
      name: 'commit-and-tag-version',
      licenseType: 'ISC',
      link: 'git+https://github.com/absolute-version/commit-and-tag-version.git',
      remoteVersion: '12.5.0',
      installedVersion: '12.5.0',
      definedVersion: '^12.5.0',
      author: 'Ben Coe <ben@npmjs.com>',
    },
    {
      name: 'eslint-plugin-jsdoc',
      licenseType: 'BSD-3-Clause',
      link: 'git+https://github.com/gajus/eslint-plugin-jsdoc.git',
      remoteVersion: '50.6.0',
      installedVersion: '50.6.0',
      definedVersion: '^50.6.0',
      author: 'Gajus Kuizinas gajus@gajus.com http://gajus.com',
    },
    {
      name: 'eslint-plugin-security',
      licenseType: 'Apache-2.0',
      link: 'git+https://github.com/eslint-community/eslint-plugin-security.git',
      remoteVersion: '3.0.1',
      installedVersion: '3.0.1',
      definedVersion: '^3.0.1',
      author: 'Node Security Project',
    },
    {
      name: 'eslint-plugin-security-node',
      licenseType: 'ISC',
      link: 'git+https://github.com/gkouziik/eslint-plugin-security-node.git',
      remoteVersion: '1.1.4',
      installedVersion: '1.1.4',
      definedVersion: '^1.1.4',
      author: 'gkouziik',
    },
  ],
  forbidden: [
    {
      name: 'eol',
      link: 'git+https://github.com/ryanve/eol.git',
      remoteVersion: '0.10.0',
      installedVersion: '0.10.0',
      definedVersion: '^0.10.0',
      author: 'Ryan Van Etten',
    },
    {
      name: 'eslint-plugin-security',
      licenseType: 'Apache-2.0',
      link: 'git+https://github.com/eslint-community/eslint-plugin-security.git',
      remoteVersion: '3.0.1',
      installedVersion: '3.0.1',
      definedVersion: '^3.0.1',
      author: 'Node Security Project',
    },
  ],
  unknown: [
    {
      name: 'eol',
      link: 'git+https://github.com/ryanve/eol.git',
      remoteVersion: '0.10.0',
      installedVersion: '0.10.0',
      definedVersion: '^0.10.0',
      author: 'Ryan Van Etten',
    },
  ],
};
// cSpell:enable

const EXPECTED_RESULT_CSV_FORMATTER = `eol,,not allowed
semver,ISC,not allowed
commit-and-tag-version,ISC,not allowed
eslint-plugin-jsdoc,BSD-3-Clause,not allowed
eslint-plugin-security,Apache-2.0,not allowed
eslint-plugin-security-node,ISC,not allowed
eol,,forbidden
eslint-plugin-security,Apache-2.0,forbidden
eol,,unknown`;

const EXPECTED_RESULT_TABLE_FORMATTER = `name                         licenseType   classification
---------------------------  ------------  --------------
eol                                        not allowed   
semver                       ISC           not allowed   
commit-and-tag-version       ISC           not allowed   
eslint-plugin-jsdoc          BSD-3-Clause  not allowed   
eslint-plugin-security       Apache-2.0    not allowed   
eslint-plugin-security-node  ISC           not allowed   
eol                                        forbidden     
eslint-plugin-security       Apache-2.0    forbidden     
eol                                        unknown       
`;
