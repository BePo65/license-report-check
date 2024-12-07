# license-report-check - an add-on to license-report tool

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

> Check the types of the licenses of the dependencies of a project based on the json report from the package 'license-report'.

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

## Cli parameter

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

## Show debug log

Use in linux shell

```sh
export DEBUG=license-report-check
```

or in windows command line

```sh
SET DEBUG=license-report-check
```

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
