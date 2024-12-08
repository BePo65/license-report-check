import fs from 'node:fs';
import path from 'node:path';
import { stdin } from 'node:process';
import { Transform, Writable } from 'node:stream';

/**
 * Create a readable stream for the file path given or use stdin.
 * @param {string} filePath - full path to the license-report generated json file
 * @returns {object} readable stream for license-report json result
 */
export const createJsonReadable = (filePath) => {
  let jsonStream;

  if (!filePath) {
    jsonStream = stdin;
  } else {
    const sourcePath = path.resolve(filePath);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file ${sourcePath} does not exist`);
    }

    jsonStream = fs.createReadStream(sourcePath);
  }

  return jsonStream;
};

/**
 * Convert incoming lines to an array of objects containing information
 * about the selected main process and all of its child processes.
 * Incoming chunks are expected to be lines of strings.
 * Outgoing chunks are also lines of strings.
 * Each chunk must be a single line of data.
 * Properties of the options object:
 * @param {number|string} pid - pid of the root process to inspect; defaults to
 *                              the root process of the os
 * @param {number} maxIterations - maximum number of levels inspected; defaults
 *                                 to 10
 * Structure of the resulting array:
 * @param {string} PPID - process id of the parent process
 * @param {string} PID - process id of the process
 * @param {string} COMMAND - name of the process
 * @param {string} STAT - status of the process
 */
export class CheckLicenseTypeTransform extends Transform {
  /**
   * Create a transform stream to check the license type of a package using a
   * list of allowed and forbidden license types.
   * @param {string[]} allowed - list of allowed licenses.
   * @param {string[]} forbidden - list of forbidden licenses.
   */
  constructor(allowed, forbidden) {
    super({ objectMode: true });

    this.allowed = Array.isArray(allowed) ? allowed : [allowed];
    this.forbidden = Array.isArray(forbidden) ? forbidden : [forbidden];
    this.result = { notAllowed: [], forbidden: [], unknown: [] };
  }

  /**
   * Check the license type of the object from the input stream and update the fields of the
   * internal property 'result' accordingly.
   * @param {object} chunk -    The object to be checked.
   * @param {string} encoding - If the chunk is a string, then this is the encoding type.
   *                            If chunk is a buffer, then this is the special value 'buffer';
   *                            ignore it in that case.
   * @param {Function} callback - A callback function (optionally with an error argument and data)
   *                              to be called after the supplied chunk has been processed.
   */
  _transform(chunk, encoding, callback) {
    const currentPackage = chunk.value;
    let licenseType = currentPackage.licenseType?.trim() ?? '';
    let licenseTypes = [];

    // a licenseType with spaces is a 'license expression' (types combined)
    if (licenseType.includes(' ')) {
      if (this._isKnownLicenseExpression(licenseType)) {
        licenseTypes = licenseType
          .split(/(?:^\(|\)$|\sOR\s)/)
          .filter((word) => word.length > 0);
      } else {
        this.result.unknown.push(currentPackage);
        callback();
        return;
      }
    } else if (licenseType.length > 0) {
      licenseTypes = [licenseType];
    }

    // at least 1 of the license types must be in the list of allowed types
    // for a package to be allowed
    if (
      this.allowed.length > 0 &&
      !this._arrayIncludesAny(this.allowed, licenseTypes)
    ) {
      this.result.notAllowed.push(currentPackage);
    }

    // all license types must be forbidden for a package to be forbidden
    if (
      this.forbidden.length > 0 &&
      this._arrayIncludesAll(this.forbidden, licenseTypes)
    ) {
      this.result.forbidden.push(currentPackage);
    }

    if (licenseTypes.length === 0) {
      this.result.unknown.push(currentPackage);
    }

    callback();
  }

  /**
   * Emit the generated result object to the output stream.
   * @param {Function} callback - A callback function (optionally with an error
   *                   argument and data) to be called when remaining data has
   *                   been flushed.
   */
  _flush(callback) {
    callback(null, this.result);
  }

  /**
   * Is the given licenseType a known expression?
   * Known expressions are ORed license types surrounded by
   * parenthesis (e.g. '(BSD-2-Clause OR MIT OR Apache-2.0)').
   * @param {string} licenseType - license type of the package
   * @returns {boolean} true = license type can be evaluated
   */
  _isKnownLicenseExpression(licenseType) {
    // eslint-disable-next-line security/detect-unsafe-regex
    const regex = /^\(\S+(\sOR\s\S+){1,6}\)$/;
    return regex.test(licenseType);
  }

  /**
   * Does allowedValues contain at least 1 element of valuesToValidate?
   * @param {string[]} allowedValues - list of values that may contain valuesToValidate
   * @param {string[]} valuesToValidate - values that are tested
   * @returns {boolean} true = at least 1 value of valuesToValidate is part of allowedValues
   */
  _arrayIncludesAny(allowedValues, valuesToValidate) {
    return valuesToValidate.some((inspectedValue) =>
      allowedValues.includes(inspectedValue),
    );
  }

  /**
   * Does allowedValues contain all element of valuesToValidate?
   * @param {string[]} allowedValues - list of values that must contain valuesToValidate
   * @param {string[]} valuesToValidate - values that are tested
   * @returns {boolean} true = all values of valuesToValidate are part of allowedValues
   */
  _arrayIncludesAll(allowedValues, valuesToValidate) {
    return valuesToValidate.every((inspectedValue) =>
      allowedValues.includes(inspectedValue),
    );
  }
}

/**
 * Format the classified licenses according to given output format in
 * global configuration.
 */
export class FormatterWritable extends Writable {
  /**
   * Create a writable stream using the given formatter.
   * @param {Function} formatter - function to convert the result object to a string
   * @param {object} config - global configuration object
   */
  constructor(formatter, config) {
    super({ objectMode: true });
    this.formatter = formatter;
    this.config = config;
  }

  /**
   * Convert the chunk to a string using the current formatter.
   * @param {object} chunk - result object to be converted
   * @param {string} encoding - If the chunk is a string, then this is the encoding type.
   *                            If chunk is a buffer, then this is the special value 'buffer';
   *                            ignore it in that case.
   * @param {Function} callback - A callback function (optionally with an error argument and data)
   *                              to be called after the supplied chunk has been processed.
   */
  _write(chunk, encoding, callback) {
    // eslint-disable-next-line security-node/detect-crlf
    console.log(this.formatter(chunk, this.config));
    callback();
  }
}

export default {
  createJsonReadable,
  CheckLicenseTypeTransform,
  FormatterWritable,
};
