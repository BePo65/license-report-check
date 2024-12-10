import assert from 'node:assert';

import { stub } from 'sinon';

import config from '../lib/config.js';
import { getFormatter } from '../lib/formatter.js';

describe('getFormatter', () => {
  describe('formatter for json', () => {
    it('produces a report', () => {
      const jsonFormatter = getFormatter('json');
      const jsonResult = jsonFormatter(testData, config);

      assert.strictEqual(jsonResult, EXPECTED_JSON_RESULT);
    });

    it('produces a report for an empty data set', () => {
      const jsonFormatter = getFormatter('json');
      const jsonResult = jsonFormatter({}, config);

      assert.strictEqual(jsonResult, '{}');
    });
  });

  describe('formatter for csv', () => {
    let testConfig;

    beforeEach(() => {
      testConfig = structuredClone(config);
    });

    it('produces a report without header', () => {
      const csvFormatter = getFormatter('csv');
      const csvResult = csvFormatter(testData, testConfig);

      assert.strictEqual(csvResult, EXPECTED_CSV_RESULT);
    });

    it('produces a report with header', () => {
      testConfig.csvHeaders = true;
      const csvFormatter = getFormatter('csv');
      const csvResult = csvFormatter(testData, testConfig);
      const csvExpectedResult =
        EXPECTED_CSV_HEADER + '\n' + EXPECTED_CSV_RESULT;

      assert.strictEqual(csvResult, csvExpectedResult);
    });

    it('produces a report for data with delimiter in field value', () => {
      const consoleStub = stub(console, 'warn');
      testConfig.delimiter = '-';
      const csvFormatter = getFormatter('csv');
      const csvResult = csvFormatter(testDataWithCsvDelimiter, testConfig);

      assert.strictEqual(csvResult, EXPECTED_CSV_RESULT_WITH_DELIMITER);
      assert.equal(consoleStub.callCount, 8);
      assert.deepStrictEqual(
        consoleStub.firstCall.firstArg,
        'Warning: field contains delimiter; value: "commit-and-tag-version"',
      );
      assert.deepStrictEqual(
        consoleStub.lastCall.firstArg,
        'Warning: field contains delimiter; value: "Apache-2.0"',
      );

      consoleStub.restore();
    });

    it('produces a report for data with delimiter in field value - escaped', () => {
      const consoleStub = stub(console, 'warn');
      testConfig.delimiter = '-';
      testConfig.escapeCsvFields = true;
      const csvFormatter = getFormatter('csv');
      const csvResult = csvFormatter(testDataWithCsvDelimiter, testConfig);

      assert.strictEqual(csvResult, EXPECTED_CSV_RESULT_WITH_DELIMITER_ESCAPED);
      assert.equal(consoleStub.callCount, 8);
      assert.deepStrictEqual(
        consoleStub.firstCall.firstArg,
        'Warning: field contains delimiter; value: "commit-and-tag-version"',
      );
      assert.deepStrictEqual(
        consoleStub.lastCall.firstArg,
        'Warning: field contains delimiter; value: "Apache-2.0"',
      );

      consoleStub.restore();
    });

    it('produces a report for an empty data array', () => {
      const csvFormatter = getFormatter('csv');
      const csvResult = csvFormatter({}, testConfig);

      assert.strictEqual(csvResult, '');
    });

    it('produces a report with header for an empty data array', () => {
      testConfig.csvHeaders = true;
      const csvFormatter = getFormatter('csv');
      const csvResult = csvFormatter([], testConfig);

      assert.strictEqual(csvResult, EXPECTED_CSV_HEADER);
    });
  });

  describe('formatter for table', () => {
    let testConfig;

    beforeEach(() => {
      testConfig = structuredClone(config);
    });

    it('produces a report', () => {
      const tableFormatter = getFormatter('table');
      const tableResult = tableFormatter(testData, config);

      assert.strictEqual(tableResult, EXPECTED_TABLE_RESULT);
    });

    it('produces a report for an empty data set', () => {
      const tableFormatter = getFormatter('table');
      const tableResult = tableFormatter({}, config);

      assert.strictEqual(tableResult, EXPECTED_TABLE_RESULT_EMPTY_DATA);
    });

    it('produces a report with different classifications', () => {
      testConfig.outputClassifications.notAllowed = 'n.a.';
      testConfig.outputClassifications.forbidden = 'f';
      testConfig.outputClassifications.unknown = 'u';

      const tableFormatter = getFormatter('table');
      const tableResult = tableFormatter(testData, testConfig);

      assert.strictEqual(tableResult, EXPECTED_TABLE_RESULT_CLASSIFICATIONS);
    });

    it('produces a report with different columns', () => {
      testConfig.outputColumns.name = 'Package';
      testConfig.outputColumns.licenseType = 'License Type';
      testConfig.outputColumns.installedVersion = 'Installed Version';
      testConfig.outputColumns.classification = 'Classification';

      const tableFormatter = getFormatter('table');
      const tableResult = tableFormatter(testData, testConfig);

      assert.strictEqual(tableResult, EXPECTED_TABLE_RESULT_COLUMNS);
    });
  });
});

// cSpell:disable
const testData = {
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
const testDataWithCsvDelimiter = {
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

const EXPECTED_JSON_RESULT =
  '{"notAllowed":[{"name":"eol","link":"git+https://github.com/ryanve/eol.git","remoteVersion":"0.10.0","installedVersion":"0.10.0","definedVersion":"^0.10.0","author":"Ryan Van Etten"},{"name":"semver","licenseType":"ISC","link":"git+https://github.com/npm/node-semver.git","remoteVersion":"7.6.3","installedVersion":"7.6.3","definedVersion":"^7.6.3","author":"GitHub Inc."},{"name":"commit-and-tag-version","licenseType":"ISC","link":"git+https://github.com/absolute-version/commit-and-tag-version.git","remoteVersion":"12.5.0","installedVersion":"12.5.0","definedVersion":"^12.5.0","author":"Ben Coe <ben@npmjs.com>"},{"name":"eslint-plugin-jsdoc","licenseType":"BSD-3-Clause","link":"git+https://github.com/gajus/eslint-plugin-jsdoc.git","remoteVersion":"50.6.0","installedVersion":"50.6.0","definedVersion":"^50.6.0","author":"Gajus Kuizinas gajus@gajus.com http://gajus.com"},{"name":"eslint-plugin-security","licenseType":"Apache-2.0","link":"git+https://github.com/eslint-community/eslint-plugin-security.git","remoteVersion":"3.0.1","installedVersion":"3.0.1","definedVersion":"^3.0.1","author":"Node Security Project"},{"name":"eslint-plugin-security-node","licenseType":"ISC","link":"git+https://github.com/gkouziik/eslint-plugin-security-node.git","remoteVersion":"1.1.4","installedVersion":"1.1.4","definedVersion":"^1.1.4","author":"gkouziik"}],"forbidden":[{"name":"eol","link":"git+https://github.com/ryanve/eol.git","remoteVersion":"0.10.0","installedVersion":"0.10.0","definedVersion":"^0.10.0","author":"Ryan Van Etten"},{"name":"eslint-plugin-security","licenseType":"Apache-2.0","link":"git+https://github.com/eslint-community/eslint-plugin-security.git","remoteVersion":"3.0.1","installedVersion":"3.0.1","definedVersion":"^3.0.1","author":"Node Security Project"}],"unknown":[{"name":"eol","link":"git+https://github.com/ryanve/eol.git","remoteVersion":"0.10.0","installedVersion":"0.10.0","definedVersion":"^0.10.0","author":"Ryan Van Etten"}]}';
// cSpell:enable

const EXPECTED_CSV_HEADER = 'name,licenseType,classification';

const EXPECTED_CSV_RESULT = `eol,,not allowed
semver,ISC,not allowed
commit-and-tag-version,ISC,not allowed
eslint-plugin-jsdoc,BSD-3-Clause,not allowed
eslint-plugin-security,Apache-2.0,not allowed
eslint-plugin-security-node,ISC,not allowed
eol,,forbidden
eslint-plugin-security,Apache-2.0,forbidden
eol,,unknown`;

const EXPECTED_CSV_RESULT_WITH_DELIMITER = `eol--not allowed
semver-ISC-not allowed
commit-and-tag-version-ISC-not allowed
eslint-plugin-jsdoc-BSD-3-Clause-not allowed
eslint-plugin-security-Apache-2.0-not allowed
eslint-plugin-security-node-ISC-not allowed
eol--forbidden
eslint-plugin-security-Apache-2.0-forbidden
eol--unknown`;

const EXPECTED_CSV_RESULT_WITH_DELIMITER_ESCAPED = `eol--not allowed
semver-ISC-not allowed
"commit-and-tag-version"-ISC-not allowed
"eslint-plugin-jsdoc"-"BSD-3-Clause"-not allowed
"eslint-plugin-security"-"Apache-2.0"-not allowed
"eslint-plugin-security-node"-ISC-not allowed
eol--forbidden
"eslint-plugin-security"-"Apache-2.0"-forbidden
eol--unknown`;

const EXPECTED_TABLE_RESULT = `name                         licenseType   classification
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

const EXPECTED_TABLE_RESULT_CLASSIFICATIONS = `name                         licenseType   classification
---------------------------  ------------  --------------
eol                                        n.a.          
semver                       ISC           n.a.          
commit-and-tag-version       ISC           n.a.          
eslint-plugin-jsdoc          BSD-3-Clause  n.a.          
eslint-plugin-security       Apache-2.0    n.a.          
eslint-plugin-security-node  ISC           n.a.          
eol                                        f             
eslint-plugin-security       Apache-2.0    f             
eol                                        u             
`;

const EXPECTED_TABLE_RESULT_COLUMNS = `Package                      License Type  Classification  Installed Version
---------------------------  ------------  --------------  -----------------
eol                                        not allowed     0.10.0           
semver                       ISC           not allowed     7.6.3            
commit-and-tag-version       ISC           not allowed     12.5.0           
eslint-plugin-jsdoc          BSD-3-Clause  not allowed     50.6.0           
eslint-plugin-security       Apache-2.0    not allowed     3.0.1            
eslint-plugin-security-node  ISC           not allowed     1.1.4            
eol                                        forbidden       0.10.0           
eslint-plugin-security       Apache-2.0    forbidden       3.0.1            
eol                                        unknown         0.10.0           
`;

const EXPECTED_TABLE_RESULT_EMPTY_DATA = '\n\n';
