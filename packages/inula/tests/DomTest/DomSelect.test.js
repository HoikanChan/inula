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

import * as Inula from '../../src/index';

describe('Dom Select', () => {
  it('设置value', () => {
    const selectNode = (
      <select value="Vue">
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    const realNode = Inula.render(selectNode, container);
    expect(realNode.value).toBe('Vue');
    expect(realNode.options[1].selected).toBe(true);
    realNode.value = 'React';
    // 改变value会影响select的状态
    Inula.render(selectNode, container);
    expect(realNode.options[0].selected).toBe(true);
    expect(realNode.value).toBe('React');
  });

  it('设置value为对象', () => {
    let selectValue = {
      toString: () => {
        return 'Vue';
      },
    };
    const selectNode = (
      <select value={selectValue}>
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    const realNode = Inula.render(selectNode, container);
    expect(realNode.value).toBe('Vue');
    expect(realNode.options[1].selected).toBe(true);
    selectValue = {
      toString: () => {
        return 'React';
      },
    };
    const newSelectNode = (
      <select value={selectValue}>
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    // 改变value会影响select的状态
    Inula.render(newSelectNode, container);
    expect(realNode.options[0].selected).toBe(true);
    expect(realNode.value).toBe('React');
  });

  it('受控select转为不受控会保存原来select', () => {
    const selectNode = (
      <select value="Vue">
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    const realNode = Inula.render(selectNode, container);
    expect(realNode.value).toBe('Vue');
    expect(realNode.options[1].selected).toBe(true);
    const newSelectNode = (
      <select>
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    Inula.render(newSelectNode, container);
    // selected不变
    expect(realNode.options[0].selected).toBe(false);
    expect(realNode.options[1].selected).toBe(true);
    expect(realNode.value).toBe('Vue');
  });

  it('设置defaultValue', () => {
    let defaultVal = 'Vue';
    const selectNode = (
      <select defaultValue={defaultVal}>
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    let realNode = Inula.render(selectNode, container);
    expect(realNode.value).toBe('Vue');
    expect(realNode.options[1].selected).toBe(true);

    defaultVal = 'React';
    // 改变defaultValue没有影响
    realNode = Inula.render(selectNode, container);
    expect(realNode.value).toBe('Vue');
    expect(realNode.options[0].selected).toBe(false);
    expect(realNode.options[1].selected).toBe(true);
  });

  it('设置defaultValue后,select不受控', () => {
    const selectNode = (
      <select defaultValue={'Vue'}>
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    let realNode = Inula.render(selectNode, container);
    expect(realNode.value).toBe('Vue');
    expect(realNode.options[1].selected).toBe(true);

    // 先修改
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(realNode, 'React');
    // 再触发事件
    container.querySelector('select').dispatchEvent(
      new Event('change', {
        bubbles: true,
        cancelable: true,
      })
    );
    // 鼠标改变受控select生效,select不受控
    Inula.render(selectNode, container);
    // 'React'项没被选中
    expect(realNode.options[0].selected).toBe(true);
    expect(realNode.options[1].selected).toBe(false);
    expect(realNode.value).toBe('React');
  });

  xit('设置multiple(一)', () => {
    jest.spyOn(console, 'error').mockImplementation();
    const selectNode = (
      <select multiple="multiple" defaultValue={'Vue'}>
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    expect(() => Inula.render(selectNode, container)).toThrowError('newValues.forEach is not a function');
  });

  it('设置multiple(二)', () => {
    let selectNode = (
      <select id="se" multiple="multiple" defaultValue={['Vue', 'Angular']}>
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    expect(() => Inula.render(selectNode, container)).not.toThrow();
    expect(document.getElementById('se').options[0].selected).toBe(false);
    expect(document.getElementById('se').options[1].selected).toBe(true);
    expect(document.getElementById('se').options[2].selected).toBe(true);

    // 改变defaultValue没有影响
    selectNode = (
      <select id="se" multiple="multiple" defaultValue={['React']}>
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    Inula.render(selectNode, container);
    expect(document.getElementById('se').options[0].selected).toBe(false);
    expect(document.getElementById('se').options[1].selected).toBe(true);
    expect(document.getElementById('se').options[2].selected).toBe(true);
  });

  it('设置multiple(三)', () => {
    let selectNode = (
      <select id="se" multiple="multiple" value={['Vue', 'Angular']}>
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    expect(() => Inula.render(selectNode, container)).not.toThrow();
    expect(document.getElementById('se').options[0].selected).toBe(false);
    expect(document.getElementById('se').options[1].selected).toBe(true);
    expect(document.getElementById('se').options[2].selected).toBe(true);

    // 改变value有影响
    selectNode = (
      <select id="se" multiple="multiple" value={['React']}>
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    Inula.render(selectNode, container);
    expect(document.getElementById('se').options[0].selected).toBe(true);
    expect(document.getElementById('se').options[1].selected).toBe(false);
    expect(document.getElementById('se').options[2].selected).toBe(false);
  });

  it('defaultValue设置multiple与非multiple切换(一)', () => {
    let selectNode = (
      <select id="se" multiple="multiple" defaultValue={['Vue', 'Angular']}>
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    Inula.render(selectNode, container);
    expect(document.getElementById('se').options[0].selected).toBe(false);
    expect(document.getElementById('se').options[1].selected).toBe(true);
    expect(document.getElementById('se').options[2].selected).toBe(true);

    // 改变value有影响
    selectNode = (
      <select id="se" defaultValue="React">
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    Inula.render(selectNode, container);
    expect(document.getElementById('se').options[0].selected).toBe(true);
    expect(document.getElementById('se').options[1].selected).toBe(false);
    expect(document.getElementById('se').options[2].selected).toBe(false);
  });

  it('defaultValue设置multiple与非multiple切换(二)', () => {
    let selectNode = (
      <select id="se" defaultValue="React">
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    Inula.render(selectNode, container);
    expect(document.getElementById('se').options[0].selected).toBe(true);
    expect(document.getElementById('se').options[1].selected).toBe(false);
    expect(document.getElementById('se').options[2].selected).toBe(false);

    // 改变value有影响
    selectNode = (
      <select id="se" multiple="multiple" defaultValue={['Vue', 'Angular']}>
        <option value="React">React.js</option>
        <option value="Vue">Vue.js</option>
        <option value="Angular">Angular.js</option>
      </select>
    );
    Inula.render(selectNode, container);
    expect(document.getElementById('se').options[0].selected).toBe(false);
    expect(document.getElementById('se').options[1].selected).toBe(true);
    expect(document.getElementById('se').options[2].selected).toBe(true);
  });

  it('未指定value或者defaultValue时，默认选择第一个可选的', () => {
    const selectNode = (
      <select id="se">
        <option disabled={true} value="React">
          React.js
        </option>
        <option value="Vue">Vue.js</option>
        <option disabled={true} value="Angular">
          Angular.js
        </option>
      </select>
    );
    const realNode = Inula.render(selectNode, container);
    expect(realNode.options[0].selected).toBe(false);
    expect(realNode.options[1].selected).toBe(true);
    expect(realNode.options[2].selected).toBe(false);
  });

  it('删除添加option', () => {
    const selectNode = (
      <select multiple={true} defaultValue={['Vue']}>
        <option key="React" value="React">
          React.js
        </option>
        <option key="Vue" value="Vue">
          Vue.js
        </option>
        <option key="Angular" value="Angular">
          Angular.js
        </option>
      </select>
    );
    const realNode = Inula.render(selectNode, container);
    expect(realNode.options[0].selected).toBe(false);
    expect(realNode.options[1].selected).toBe(true);
    expect(realNode.options[2].selected).toBe(false);

    const newNode = (
      <select multiple={true} defaultValue={['Vue']}>
        <option key="React" value="React">
          React.js
        </option>
        <option key="Angular" value="Angular">
          Angular.js
        </option>
      </select>
    );
    Inula.render(newNode, container);
    expect(realNode.options[0].selected).toBe(false);
    expect(realNode.options[1].selected).toBe(false);

    const newSelectNode = (
      <select multiple={true} defaultValue={['Vue']}>
        <option key="React" value="React">
          React.js
        </option>
        <option key="Vue" value="Vue">
          Vue.js
        </option>
        <option key="Angular" value="Angular">
          Angular.js
        </option>
      </select>
    );
    // 重新添加不会影响
    Inula.render(newSelectNode, container);
    expect(realNode.options[0].selected).toBe(false);
    expect(realNode.options[1].selected).toBe(false);
    expect(realNode.options[2].selected).toBe(false);
  });

  it('清空Select中的Option', () => {
    function genData() {
      const data = [];
      for (let i = 0; i < 13; i++) {
        data.push({ title: `data${i}`, value: i });
      }
      return data;
    }
    const Option = ({ item }) => {
      return (
        <option title={item.title} value={item.value}>
          {item.value}
        </option>
      );
    };

    let clear;
    const TestDemo = () => {
      const [data, setData] = Inula.useState(() => genData());
      clear = setData;

      return (
        <>
          <select id="select1" multiple>
            {data.map(item => (
              <option title={item.title} value={item.value}>
                {item.value}
              </option>
            ))}
          </select>
          <select id="select2" multiple>
            {data.map(item => (
              <Option item={item} />
            ))}
          </select>
          <select id="select3" multiple>
            {data.map(item => (
              <optgroup label={item.title} />
            ))}
          </select>
        </>
      );
    };

    Inula.act(() => Inula.render(<TestDemo />, document.body));
    expect(document.getElementById('select1').children.length).toBe(13);
    expect(document.getElementById('select2').children.length).toBe(13);
    expect(document.getElementById('select3').children.length).toBe(13);
    // 清空option
    Inula.act(() => clear([]));

    expect(document.getElementById('select1').children.length).toBe(0);
    expect(document.getElementById('select2').children.length).toBe(0);
    expect(document.getElementById('select3').children.length).toBe(0);
  });
});
