export const helpText = `Check the types of the licenses of the dependencies of a project based on the json report from the package 'license-report'.

Usage: license-report-check [options]

Options:
  --source=</path/to/license-report.json>  Check the licenses for the dependencies listed in this file
                                           generated by license-report.

  --allowed=<allowed-license-type>         Name of an allowed license type (e.g. MIT).
                                           Without this option, all licenses are allowed.

  --forbidden=<forbidden-license-type>     Name of a forbidden license type (e.g. 'Apache 2.0').
                                           Without this option, no licenses are forbidden.

Packages without a license type or with an empty license type are reported as 'unknown'.
  `;

export default {
  helpText,
};