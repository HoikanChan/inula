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

const body: Record<string, any> = {
  doubleapos: { match: "''", value: () => "'" },
  quoted: {
    lineBreaks: true,
    match: /'[{}#](?:[^]*?[^'])?'(?!')/u,
    value: src => src.slice(1, -1).replace(/''/g, "'"),
  },
  argument: {
    lineBreaks: true,
    match: /\{\s*[^\p{Pat_Syn}\p{Pat_WS}]+\s*/u,
    push: 'arg',
    value: src => src.substring(1).trim(),
  },
  octothorpe: '#',
  end: { match: '}', pop: 1 },
  content: { lineBreaks: true, match: /[^][^{}#']*/u },
};

const arg: Record<string, any> = {
  select: {
    lineBreaks: true,
    match: /,\s*(?:plural|select|selectordinal)\s*,\s*/u,
    next: 'select',
    value: src => src.split(',')[1].trim(),
  },
  'func-args': {
    lineBreaks: true,
    match: /,\s*[^\p{Pat_Syn}\p{Pat_WS}]+\s*,/u,
    next: 'body',
    value: src => src.split(',')[1].trim(),
  },
  'func-simple': {
    lineBreaks: true,
    match: /,\s*[^\p{Pat_Syn}\p{Pat_WS}]+\s*/u,
    value: src => src.substring(1).trim(),
  },
  end: { match: '}', pop: 1 },
};

const select: Record<string, any> = {
  offset: {
    lineBreaks: true,
    match: /\s*offset\s*:\s*\d+\s*/u,
    value: src => src.split(':')[1].trim(),
  },
  case: {
    lineBreaks: true,
    match: /\s*(?:=\d+|[^\p{Pat_Syn}\p{Pat_WS}]+)\s*\{/u,
    push: 'body',
    value: src => src.substring(0, src.indexOf('{')).trim(),
  },
  end: { match: /\s*\}/u, pop: 1 },
};

export const mappingRule: Record<string, any> = {
  body,
  arg,
  select,
};
