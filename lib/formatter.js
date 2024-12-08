import Table from 'easy-table';

/**
 * Format result object as json string.
 * @param {object} resultObject - result object with classification of license types
 * @param {object} config - global configuration object
 * @returns {string} resultObject formatted as json string
 */
// eslint-disable-next-line no-unused-vars
const formatAsJsonString = (resultObject, config) => {
  return JSON.stringify(resultObject);
};

/**
 * Format result object as csv string.
 * The names of the properties are used as column headers (if config.csvHeaders is true).
 * @param {object} resultObject - result object with classification of license types
 * @param {object} config - global configuration object
 * @returns {string} resultObject formatted as csv string
 */
const formatAsCsv = (resultObject, config) => {
  // TODO should we validate the field names?
  const fields = config.outputColumns;
  const classifications = config.outputClassifications;
  const delimiter = config.delimiter;
  const escapeFields = config.escapeCsvFields;
  let csv = [];

  let data = _selectOutputFieldsAsArray(resultObject, fields, classifications);

  if (config.csvHeaders) {
    let headers = [];
    Object.keys(fields).forEach((key) => {
      headers.push(fields[key]);
    });

    csv.push(headers.join(delimiter));
  }

  for (const element of data) {
    const validatedFields = element.map((fieldValue) => {
      let validatedField = fieldValue;
      if (fieldValue.includes(delimiter)) {
        console.warn(
          `Warning: field contains delimiter; value: "${fieldValue}"`,
        );
        if (escapeFields) {
          validatedField = `"${fieldValue}"`;
        }
      }
      return validatedField;
    });

    csv.push(validatedFields.join(delimiter));
  }

  return csv.join('\n');
};

/**
 * Formats package information as table.
 * @param {object} resultObject - result object with classification of license types
 * @param {object} config - global configuration object
 * @returns {string} resultObject formatted as table string
 */
const formatAsTable = (resultObject, config) => {
  // TODO should we validate the field names?
  const fields = config.outputColumns;
  const classifications = config.outputClassifications;

  let rows = _selectOutputFieldsAsObjects(
    resultObject,
    fields,
    classifications,
  );

  var t = new Table();

  rows.forEach((product) => {
    Object.entries(fields).forEach((field) => {
      t.cell(field[1], product[field[0]]);
    });

    t.newRow();
  });

  return t.toString();
};

/**
 * Gets the formatter function for the style given.
 * Allowed styles: 'json', 'table', 'csc'.
 * Function signature: function(dataAsArray, config)
 * dataAsArray: array of objects with information about dependencies / devDependencies in package.json,
 * config: global configuration object
 * @param {string} style - output style to be generated
 * @returns {Function} function to format the data; signature: function(dataAsArray, config)
 */
export const getFormatter = (style) => {
  let formatter;
  switch (style) {
    case 'json':
      formatter = formatAsJsonString;
      break;
    case 'table':
      formatter = formatAsTable;
      break;
    case 'csv':
      formatter = formatAsCsv;
      break;
    default:
      throw new Error('invalid output format in config');
  }

  return formatter;
};

/**
 * Get the data to use in the csv output from an entry in the
 * license-report-check internal result.
 * @param {object} elements - one entry of the license-report output (i.e.'forbidden')
 * @param {object} outputColumns - outputColumns from the config
 * @param {string} classification - classification to use for all elements
 * @returns {string[]} array containing all data of 1 result type to export as a csv row
 */
const _selectOutputFieldsForElementAsArray = (
  elements,
  outputColumns,
  classification,
) => {
  const result = [];
  elements.forEach((element) => {
    const row = [];

    Object.keys(outputColumns).forEach((key) => {
      if (key !== 'classification') {
        row.push(element[key]);
      } else {
        row.push(classification);
      }
    });

    result.push(row);
  });

  return result;
};

/**
 * Get the data to use in the csv output for all entries in the
 * license-report-check internal result.
 * @param {object} resultObject - internal json result of license-report-check
 * @param {object} outputColumns - outputColumns from the config
 * @param {object} classifications - outputClassifications from the config
 * @returns {string[][]} array containing all data of all result types to export as csv rows
 */
const _selectOutputFieldsAsArray = (
  resultObject,
  outputColumns,
  classifications,
) => {
  let result = [];
  result = result.concat(
    _selectOutputFieldsForElementAsArray(
      resultObject.notAllowed,
      outputColumns,
      classifications.notAllowed,
    ),
  );
  result = result.concat(
    _selectOutputFieldsForElementAsArray(
      resultObject.forbidden,
      outputColumns,
      classifications.forbidden,
    ),
  );
  result = result.concat(
    _selectOutputFieldsForElementAsArray(
      resultObject.unknown,
      outputColumns,
      classifications.unknown,
    ),
  );
  return result;
};

/**
 * Get the data to use in the table output from 1 entry in the
 * license-report-check internal result.
 * @param {object} elements - one entry of the license-report output (i.e.'forbidden')
 * @param {object} outputColumns - outputColumns from the config
 * @param {string} classification - classification to use for all elements
 * @returns {object[]} array containing all data of 1 result type to export as a table
 */
const _selectOutputFieldsForElementAsObjects = (
  elements,
  outputColumns,
  classification,
) => {
  const result = [];
  const fields = Object.entries(outputColumns);

  elements.forEach((packageData) => {
    const row = {};

    fields.forEach((field) => {
      if (field[0] !== 'classification') {
        row[field[0]] = packageData[field[0]];
      } else {
        row[field[0]] = classification;
      }
    });

    result.push(row);
  });

  return result;
};

/**
 * Get the data to use in the table output for all entries in the
 * license-report-check internal result.
 * @param {object} resultObject - internal json result of license-report-check
 * @param {object} outputColumns - outputColumns from the config
 * @param {object} classifications - outputClassifications from the config
 * @returns {object[]} array containing all data of all result types to export as table rows
 */
const _selectOutputFieldsAsObjects = (
  resultObject,
  outputColumns,
  classifications,
) => {
  let result = [];
  result = result.concat(
    _selectOutputFieldsForElementAsObjects(
      resultObject.notAllowed,
      outputColumns,
      classifications.notAllowed,
    ),
  );
  result = result.concat(
    _selectOutputFieldsForElementAsObjects(
      resultObject.forbidden,
      outputColumns,
      classifications.forbidden,
    ),
  );
  result = result.concat(
    _selectOutputFieldsForElementAsObjects(
      resultObject.unknown,
      outputColumns,
      classifications.unknown,
    ),
  );
  return result;
};
