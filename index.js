#!/usr/bin/env node

import { pipeline } from 'node:stream/promises';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/stream-array.js';
import config from './lib/config.js';
import { getFormatter } from './lib/formatter.js';
import { helpText } from './lib/util.js';
import {
  CheckLicenseTypeTransform,
  createJsonReadable,
  FormatterWritable,
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
      parser.asStream(),
      streamArray.asStream(),
      new CheckLicenseTypeTransform(config.allowed, config.forbidden),
      new FormatterWritable(outputFormatter, config),
    );
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
