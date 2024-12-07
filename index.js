#!/usr/bin/env node

import { pipeline } from 'node:stream/promises';
import parser from 'stream-json';
import StreamArray from 'stream-json/streamers/StreamArray.js';

import config from './lib/config.js';
import {
  CheckLicenseTypeTransform,
  createFormatterWritable,
  createJsonReadable,
} from './lib/util-stream.js';
import { helpText } from './lib/util.js';

(async () => {
  if (config.help) {
    console.log(helpText); // eslint-disable-line security-node/detect-crlf
    return;
  }

  try {
    await pipeline(
      createJsonReadable(config.source),
      parser(),
      StreamArray.streamArray(),
      new CheckLicenseTypeTransform(config.allowed, config.forbidden),
      createFormatterWritable,
      // TODO results in list of objects with index(0..n-1) and value=license-report_json_licenseType
    );
  } catch (e) {
    console.error(e.message);
    process.exit(1); // eslint-disable-line n/no-process-exit
  }
})();
