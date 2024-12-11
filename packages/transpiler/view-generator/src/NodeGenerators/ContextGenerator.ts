import { types as t } from '@openInula/babel-api';
import { type ContextParticle } from '@openinula/reactivity-parser';
import { importMap } from '../HelperGenerators/BaseGenerator';
import { ViewContext, ViewGenerator } from '../index';

/**
 * contextGenerator
 * create comp node with props and children
 * @example
 *
 *  createContextNode(
 *    UserContext,
 *    node => {
 *      node.updateContext('name', () => 'John');
 *      node.updateContext('age', () => 20);
 *      node.updateContext('contact', () => ({phone: `1234567890+${count}`}), [count], 0b0001);
 *    },
 *  ).with(
 *    ${children}
 *  ),
 */
export const contextGenerator: ViewGenerator = {
  context: ({ contextName, props, children }: ContextParticle, ctx: ViewContext) => {
    let contextNode = t.callExpression(t.identifier(importMap.createContextNode), [t.identifier(contextName)]);

    if (Object.keys(props).length > 0) {
      const nodeId = t.identifier('node');
      const updateFunction = t.arrowFunctionExpression(
        [nodeId],
        t.blockStatement(
          Object.entries(props).map(([key, prop]) =>
            t.expressionStatement(
              t.callExpression(t.memberExpression(nodeId, t.identifier('updateContext')), [
                t.stringLiteral(key),
                prop.value,
                prop.dependenciesNode,
                t.numericLiteral(prop.depIdBitmap),
              ])
            )
          )
        )
      );

      contextNode.arguments.push(updateFunction);
    }
    if (children.length > 0) {
      contextNode = t.callExpression(
        t.memberExpression(contextNode, t.identifier('with')),
        children.map(child => ctx.next(child))
      );
    }

    return contextNode;
  },
};
