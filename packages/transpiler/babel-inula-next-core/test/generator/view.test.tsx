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
import { transform } from './mock';
describe('view generation', () => {
  it('should generation single html', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let text = 'hello world';
        console.log(text);
        return <div>{text}</div>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        let self;
        let text = 'hello world';
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            console.log(text);
            let $node0, $node1;
            $node0 = $$createElement("div");
            $node1 = $$createNode(3 /*Exp*/, () => text, [text]);
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 1) {
                $node1 && $$updateNode($node1, () => text, [text]);
              }
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });

  it('should generate html properties and update', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let text = 'hello world';
        let color = 'red';


        return <div className={text} id={text} style={{color}}>{text}</div>
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        let self;
        let text = 'hello world';
        let color = 'red';
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("div");
            $$setHTMLProp($node0, "className", () => text, [text]);
            $$setHTMLProp($node0, "id", () => text, [text]);
            $$setStyle($node0, {
              color
            });
            $node1 = $$createNode(3 /*Exp*/, () => text, [text]);
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 1) {
                $node0 && $$setHTMLProp($node0, "className", () => text, [text]);
                $node0 && $$setHTMLProp($node0, "id", () => text, [text]);
                $node1 && $$updateNode($node1, () => text, [text]);
              }
              if ($changed & 2) {
                $node0 && $$setStyle($node0, {
                  color
                });
              }
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });

  it('should generate multiple html', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let text = 'hello world';
        return (
          <div>
            <div>{text}</div>
            <div>{text}</div>
          </div>
        )
      })
    `);

    expect(code).toMatchInlineSnapshot(`
      "const _$t = (() => {
        let $node0, $node1, $node2;
        $node0 = $$createElement("div");
        $node1 = $$createElement("div");
        $$appendNode($node0, $node1);
        $node2 = $$createElement("div");
        $$appendNode($node0, $node2);
        return $node0;
      })();
      function Comp() {
        let self;
        let text = 'hello world';
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1, $node2, $node3, $node4;
            $node0 = _$t.cloneNode(true);
            $node1 = $node0.firstChild;
            $node2 = $node1.nextSibling;
            $node3 = $$createNode(3 /*Exp*/, () => text, [text]);
            $$insertNode($node1, $node3, 0);
            $node4 = $$createNode(3 /*Exp*/, () => text, [text]);
            $$insertNode($node2, $node4, 0);
            return [[$node0], $changed => {
              if ($changed & 1) {
                $node3 && $$updateNode($node3, () => text, [text]);
                $node4 && $$updateNode($node4, () => text, [text]);
              }
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });

  it('should support fragment', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let text = 'hello world';
        return (
          <>
            <div>{text}</div>
            <div>{text}</div>
          </>
        )
      })
    `);
    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        let self;
        let text = 'hello world';
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1, $node2, $node3;
            $node0 = $$createElement("div");
            $node1 = $$createNode(3 /*Exp*/, () => text, [text]);
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            $node2 = $$createElement("div");
            $node3 = $$createNode(3 /*Exp*/, () => text, [text]);
            $$insertNode($node2, $node3, 0);
            $node2._$nodes = [$node3];
            return [[$node0, $node2], $changed => {
              if ($changed & 1) {
                $node1 && $$updateNode($node1, () => text, [text]);
                $node3 && $$updateNode($node3, () => text, [text]);
              }
              return [$node0, $node2];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
  it('should generate conditional html', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let text = 'hello world';
        let show = true;
        return (
          <div>
            <if cond={show}>
              <div>{text}</div>
            </if>
            <else>
            <h1>else</h1>
            </else>
          </div>
        );
      });
    `);

    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        let self;
        let text = 'hello world';
        let show = true;
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("div");
            $node1 = $$createNode(2 /*Cond*/, 2, $thisCond => {
              if (show) {
                if ($thisCond.cond === 0) {
                  $thisCond.didntChange = true;
                  return [];
                }
                $thisCond.cond = 0;
                let $node0, $node1;
                $thisCond.updateFunc = $changed => {
                  if ($changed & 1) {
                    $node1 && $$updateNode($node1, () => text, [text]);
                  }
                };
                $node0 = $$createElement("div");
                $node1 = $$createNode(3 /*Exp*/, () => text, [text]);
                $$insertNode($node0, $node1, 0);
                $node0._$nodes = [$node1];
                return $thisCond.cond === 0 ? [$node0] : $$updateNode($thisCond);
              } else {
                if ($thisCond.cond === 1) {
                  $thisCond.didntChange = true;
                  return [];
                }
                $thisCond.cond = 1;
                let $node0;
                $thisCond.updateFunc = $changed => {};
                $node0 = $$createElement("h1");
                $node0.textContent = "else";
                return $thisCond.cond === 1 ? [$node0] : $$updateNode($thisCond);
              }
            });
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 2) {
                $node1 && $$updateNode($node1);
              }
              $node1 && $$updateChildren($node1, $changed);
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });

  it('should generate loop html', () => {
    const code = transform(/*js*/ `
      const Comp = Component(() => {
        let list = ['hello', 'world'];
        return (
          <div>
            <for each={list}>
              {(item, index) => <div key={index}>{item}</div>})}
            </for>
          </div>
        );
      });
    `);
    expect(code).toMatchInlineSnapshot(`
      "function Comp() {
        let self;
        let list = ['hello', 'world'];
        self = $$createComponent({
          updateState: changed => {},
          getUpdateViews: () => {
            let $node0, $node1;
            $node0 = $$createElement("div");
            $node1 = $$createNode(1 /*For*/, list, 1, list.map(item => index), (item, index, $updateArr) => {
              let $node0, $node1;
              $updateArr[index] = ($changed, $item) => {
                item = $item;
                if ($changed & 1) {
                  $node1 && $$updateNode($node1, () => item, [item]);
                }
              };
              $node0 = $$createElement("div");
              $node0.setAttribute("key", index);
              $node1 = $$createNode(3 /*Exp*/, () => item, [item]);
              $$insertNode($node0, $node1, 0);
              $node0._$nodes = [$node1];
              return [$node0];
            });
            $$insertNode($node0, $node1, 0);
            $node0._$nodes = [$node1];
            return [[$node0], $changed => {
              if ($changed & 1) {
                $node1 && $$updateNode($node1, list, list.map(item => index));
              }
              $node1 && $$updateChildren($node1, $changed);
              return [$node0];
            }];
          }
        });
        return $$initCompNode(self);
      }"
    `);
  });
});
