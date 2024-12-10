#!/usr/bin/env node

import { pipeline } from 'node:stream/promises';
import parser from 'stream-json';
import StreamArray from 'stream-json/streamers/StreamArray.js';

import config from './lib/config.js';
import { getFormatter } from './lib/formatter.js';
import { helpText } from './lib/util.js';
import {
  CheckLicenseTypeTransform,
  FormatterWritable,
  createJsonReadable,
} from './lib/util-stream.js';

(async () => {
  if (config.help) {
    console.log(helpText);
    return;
  }

  const outputFormatter = getFormatter(config.output);

  try {
    await pipeline(
      createJsonReadable(config.source),
      parser(),
      StreamArray.streamArray(),
      new CheckLicenseTypeTransform(config.allowed, config.forbidden),
      new FormatterWritable(outputFormatter, config),
    );
  } catch (e) {
    console.error(e.message);
    process.exit(1); // eslint-disable-line n/no-process-exit
  }
})();
