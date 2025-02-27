/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import chalk from 'chalk';
import yargsParser from 'yargs-parser';
import Hub from '../core/Hub.js';
import initializeEnv from '../utils/initializeEnv.js';
import { Logger, LogLevel } from '../utils/logger.js';

export default async function run() {
  const args: yargsParser.Arguments = yargsParser(process.argv.slice(2));
  const alias: Record<string, string> = {
    h: 'help',
    v: 'version',
    g: 'generate',
  };
  let command: string | number | undefined = args._[0];

  if (!command) {
    if (args['v'] || args['version']) {
      command = 'v';
    }
    if (args['h'] || args['help']) {
      command = 'h';
    }
  }

  const aliasCommand: string | undefined = alias[command];

  if (aliasCommand) {
    command = aliasCommand;
  }

  initializeEnv();

  if (command === 'version' || command === 'help') {
    process.env.INNER_COMMAND = 'true';
  }

  switch (command) {
    case 'build':
      process.env.NODE_ENV = 'production';
      break;
    case 'dev':
      process.env.NODE_ENV = 'development';
      break;
    default:
      process.env.NODE_ENV = 'development';
      break;
  }

  let enableDebug = false;

  if (process.env.DEBUG === 'true') {
    enableDebug = true;
  }

  const logger: Logger = new Logger(enableDebug ? LogLevel.DEBUG : LogLevel.INFO);

  try {
    new Hub({
      logger: logger,
    }).run({
      command,
      args,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(chalk.red(err.message));
      if (err.stack) {
        logger.error(err.stack);
      }
      process.exit(1);
    }
  }
}
