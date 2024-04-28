/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { describe, expect, it } from 'vitest';
import { genCode, mockAnalyze } from '../mock';
import { variablesAnalyze } from '../../src/analyzer/variablesAnalyze';
import { propsAnalyze } from '../../src/analyzer/propsAnalyze';
import { ComponentNode, ReactiveVariable } from '../../src/analyzer/types';

const analyze = (code: string) => mockAnalyze(code, [propsAnalyze, variablesAnalyze]);

describe('analyze properties', () => {
  it('should work', () => {
    const root = analyze(`
      Component(() => {
        let foo = 1;
        let bar = 1;
      })
    `);
    expect(root.variables.length).toBe(2);
  });

  describe('state dependency', () => {
    it('should analyze dependency from state', () => {
      const root = analyze(`
        Component(() => {
          let foo = 1;
          let bar = foo;
        })
      `);
      expect(root.variables.length).toBe(2);
      const fooVar = root.variables[0] as ReactiveVariable;
      expect(fooVar.isComputed).toBe(false);
      expect(genCode(fooVar.value)).toBe('1');

      const barVar = root.variables[1] as ReactiveVariable;
      expect(barVar.isComputed).toBe(true);
      expect(genCode(barVar.value)).toBe('foo');
      expect(root.dependencyMap).toEqual({ bar: ['foo'], foo: null });
    });

    it('should analyze dependency from state in different shape', () => {
      const root = analyze(`
        Component(() => {
          let foo = 1;
          let a = 1;
          let b = 0;
          let bar = { foo: foo ? a : b };
        })
      `);
      expect(root.variables.length).toBe(4);

      const barVar = root.variables[3] as ReactiveVariable;
      expect(barVar.isComputed).toBe(true);
      expect(genCode(barVar.value)).toMatchInlineSnapshot(`
        "{
          foo: foo ? a : b
        }"
      `);
      expect(root.dependencyMap).toEqual({ bar: ['foo', 'a', 'b'], foo: null, a: null, b: null });
    });

    it('should analyze dependency from props', () => {
      const root = analyze(`
        Component(({ foo }) => {
          let bar = foo;
        })
      `);
      expect(root.variables.length).toBe(1);

      const barVar = root.variables[0] as ReactiveVariable;
      expect(barVar.isComputed).toBe(true);
      expect(root.dependencyMap).toEqual({ bar: ['foo'] });
    });

    it('should analyze dependency from nested props', () => {
      const root = analyze(`
        Component(({ foo: foo1, name: [first, last] }) => {
          let bar = [foo1, first, last];
        })
      `);
      expect(root.variables.length).toBe(1);
      const barVar = root.variables[0] as ReactiveVariable;
      expect(barVar.isComputed).toBe(true);
      expect(root.dependencyMap).toEqual({ bar: ['foo1', 'first', 'last'] });
    });

    it('should not collect invalid dependency', () => {
      const root = analyze(`
        const cond = true
        Component(() => {
          let bar = cond ? count : window.innerWidth;
        })
      `);
      expect(root.variables.length).toBe(1);
      const barVar = root.variables[0] as ReactiveVariable;
      expect(barVar.isComputed).toBe(false);
      expect(root.dependencyMap).toEqual({ bar: null });
    });
  });

  describe('subComponent', () => {
    it('should analyze dependency from subComponent', () => {
      const root = analyze(`
        Component(() => {
          let foo = 1;
          const Sub = Component(() => {
            let bar = foo;
          });
        })
      `);
      expect(root.variables.length).toBe(2);
      expect(root.dependencyMap).toEqual({ foo: null });
      expect((root.variables[1].value as ComponentNode).dependencyMap).toMatchInlineSnapshot(`
        {
          "bar": [
            "foo",
          ],
          Symbol(prevMap): {
            "foo": null,
          },
        }
      `);
    });

    it('should analyze dependency in parent', () => {
      const root = analyze(`
        Component(({lastName}) => {
          let parentFirstName = 'sheldon';
          const parentName = parentFirstName + lastName;
          const Son = Component(() => {
            let middleName = parentName
            const name = 'shelly'+ middleName + lastName;
            const GrandSon = Component(() => {
              let grandSonName = 'bar' + lastName;
            });
          });
        })
      `);
      const sonNode = root.variables[2].value as ComponentNode;
      expect(sonNode.dependencyMap).toMatchInlineSnapshot(`
        {
          "middleName": [
            "parentName",
            "parentFirstName",
            "lastName",
          ],
          "name": [
            "middleName",
            "parentName",
            "parentFirstName",
            "lastName",
          ],
          Symbol(prevMap): {
            "parentFirstName": null,
            "parentName": [
              "parentFirstName",
              "lastName",
            ],
          },
        }
      `);
      const grandSonNode = sonNode.variables[2].value as ComponentNode;
      expect(grandSonNode.dependencyMap).toMatchInlineSnapshot(`
        {
          "grandSonName": [
            "lastName",
          ],
          Symbol(prevMap): {
            "middleName": [
              "parentName",
              "parentFirstName",
              "lastName",
            ],
            "name": [
              "middleName",
              "parentName",
              "parentFirstName",
              "lastName",
            ],
            Symbol(prevMap): {
              "parentFirstName": null,
              "parentName": [
                "parentFirstName",
                "lastName",
              ],
            },
          },
        }
      `);
    });
    // SubscriptionTree
    // const SubscriptionTree = {
    //   lastName: ['parentName','son:middleName','son:name','son,grandSon:grandSonName'],
    //
    // }
  });

  it('should collect method', () => {
    const root = analyze(`
      Component(() => {
        let foo = 1;
        const onClick = () => {};
        const onHover = function() {
          onClick(foo)
        };
        function onInput() {}
      })
    `);
    expect(root.variables.map(p => p.name)).toEqual(['foo', 'onClick', 'onHover', 'onInput']);
    expect(root.variables[1].type).toBe('method');
    expect(root.variables[2].type).toBe('method');
    expect(root.dependencyMap).toMatchInlineSnapshot(`
      {
        "foo": null,
      }
    `);
  });
});
