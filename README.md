# license-report-check - an add-on to license-report tool

![Version](https://img.shields.io/badge/version-0.1.1-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

> Validate the types of the licenses of the dependencies of a project based on the json report from the package 'license-report'.

Using configuration parameters the license types of the dependencies are classified as 'notAllowed', 'forbidden' or 'unknown' (i.e. without license type).

## Install

```sh
npm install license-report-check
```

## Usage

'license-report-check' compares the license type of all dependencies against a list of allowed and a list of forbidden license types.

The result can be formatted using different formatters (the default format is 'json').

License types can also be several license types connected with 'OR' and surrounded by parenthesis. An example would be

```
(BSD-2-Clause OR MIT OR Apache-2.0)
```

The exit code of 'license-report-check' reflects the results:

- 0 = no error found
- 1 = error while evaluating the result
- 2 = found at least 1 not allowed license
- 4 = found at least 1 forbidden license
- 8 = found at least 1 license without a license type

The error codes can be combined (OR function) except for exitCode 1.

### Using piping

The output of license-report can be piped into license-report-check:

```sh
cd your/project/
npx license-report | npx license-report-check --allowed 'MIT'  --allowed 'Apache-2.0'
```

### Using a json file

Another option is using a json file with the results from license-report as source :

```sh
cd your/project/
npx license-report > licenses.json
npx license-report-check --source ./licenses.json --allowed 'MIT'  --allowed 'Apache-2.0'
```

## Cli parameters

### Pipe output of license-report:

To pipe the output of license-report to license-report-check, use the pipe symbol.

```
npx license-report --package=/path/to/package.json-to-analyze | npm license-report-check --allowed=MIT --allowed='Apache-2.0'
```

### Use file as input:

To inspect a license-report json file, use the 'source' option.

```
license-report-check --source=/path/to/license-report-result-file.json
```

### Check for allowed license types

If some license types are allowed, use the --allowed command line arguments. An example is:

```
license-report-check --allowed=MIT --allowed='Apache-2.0'
```

If packages with a license type that is not part of the 'allowed' list appear in the input list, these are reported via the 'notAllowed' field of the output.

If the configuration / command line contains no definition for allowed license types (the default), then all license types are allowed.

Packages without a license type or with an empty license type are reported as 'unknown'.

### Check for forbidden license types

If some license types are forbidden, use the --forbidden command line arguments. An example is:

```
license-report-check --forbidden=ISC --forbidden=BSD-3-Clause
```

If packages with a 'forbidden' license appear in the input list, these are reported via the 'forbidden' field of the output.

### Format the output as json

This is the default output format.

```
  license-report-check
```

or

```
  license-report-check --output=json
```

Example of generated output with cli options ` --allowed=MIT --output=json`:

```
{"notAllowed":[{"name":"eol","link":"git+https://github.com/ryanve/eol.git","remoteVersion":"0.10.0","installedVersion":"0.10.0","definedVersion":"^0.10.0","author":"Ryan Van Etten"},{"name":"semver","licenseType":"ISC","link":"git+https://github.com/npm/node-semver.git","remoteVersion":"7.6.3","installedVersion":"7.6.3","definedVersion":"^7.6.3","author":"GitHub Inc."},{"name":"commit-and-tag-version","licenseType":"ISC","link":"git+https://github.com/absolute-version/commit-and-tag-version.git","remoteVersion":"12.5.0","installedVersion":"12.5.0","definedVersion":"^12.5.0","author":"Ben Coe <ben@npmjs.com>"},{"name":"eslint-plugin-jsdoc","licenseType":"BSD-3-Clause","link":"git+https://github.com/gajus/eslint-plugin-jsdoc.git","remoteVersion":"50.6.0","installedVersion":"50.6.0","definedVersion":"^50.6.0","author":"Gajus Kuizinas gajus@gajus.com http://gajus.com"},{"name":"eslint-plugin-security","licenseType":"Apache-2.0","link":"git+https://github.com/eslint-community/eslint-plugin-security.git","remoteVersion":"3.0.1","installedVersion":"3.0.1","definedVersion":"^3.0.1","author":"Node Security Project"},{"name":"eslint-plugin-security-node","licenseType":"ISC","link":"git+https://github.com/gkouziik/eslint-plugin-security-node.git","remoteVersion":"1.1.4","installedVersion":"1.1.4","definedVersion":"^1.1.4","author":"gkouziik"}],"forbidden":[],"unknown":[{"name":"eol","link":"git+https://github.com/ryanve/eol.git","remoteVersion":"0.10.0","installedVersion":"0.10.0","definedVersion":"^0.10.0","author":"Ryan Van Etten"}]}
```

### Format the output as csv

```
  license-report-check --output=csv
```

Using the 'csv' output format, the resulting data can be modified with these parameters:

Add a header row to the csv output:

```
  license-report-check --csvHeaders
```

Change the delimiter used in the csv output (defaults to ','):

```
  license-report-check --delimiter="|"
```

Example of generated output with cli options ` --allowed=MIT --output=csv`:

```
eol,,not allowed
semver,ISC,not allowed
commit-and-tag-version,ISC,not allowed
eslint-plugin-jsdoc,BSD-3-Clause,not allowed
eslint-plugin-security,Apache-2.0,not allowed
eslint-plugin-security-node,ISC,not allowed
eol,,unknown
```

### Format the output as table

```
  license-report-check --output=table
```

Example of generated output with cli options ` --allowed=MIT --output=table`:

```
name                         licenseType   classification
---------------------------  ------------  --------------
eol                                        not allowed
semver                       ISC           not allowed
commit-and-tag-version       ISC           not allowed
eslint-plugin-jsdoc          BSD-3-Clause  not allowed
eslint-plugin-security       Apache-2.0    not allowed
eslint-plugin-security-node  ISC           not allowed
eol                                        unknown
```

### Use a custom (partial) config file

If multiple 'allowed' or 'forbidden' arguments are needed, the best way is to use a custom config file, that contains a 'allowed' and/or 'forbidden' array.

```
# example of config file with multiple arguments:
{
  "allowed": [
    "MIT",
    "Apache-2.0"
  ],
  "forbidden": [
    "BSD-3-Clause"
  ]
}
```

## Required input fields

The following fields must be part of the input data (generated with `license-report`):
| fieldname | data source |
|---|---|
| name | name of the package |
| licenseType | type of the license of the package (e.g. MIT) |

Additional fields can be used in the output from `license-report-check` using the `outputColumns` property of a (partial) config file (see section on Cli parameters).

## Notes on used dependencies

`eslint-plugin-security-node` is installed to be informed about updates, but disabled as it throws in 'util-stream.spec.js' line 101 with `TypeError: Cannot read properties of undefined (reading 'loc')`. An [issue #84](https://github.com/gkouziik/eslint-plugin-security-node/issues/84) was opened.

## Development

This repo uses standard-changelog to create the CHANGELOG. To ensure that the commit messages follow the standard-changelog rules, husky is used for git hooks.

To initialize the git hooks after checking out the repo, run `npx husky install`.

Allowed types for commit messages are:

- build
- ci
- docs
- feat
- fix
- perf
- refactor
- release
- revert
- style
- test

Allowed scopes are:

- app
- hacks
- tools
