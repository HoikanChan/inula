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

import type { NodePath } from '@babel/core';
import { AnalyzeContext, DependencyMap } from '../types';
import { types as t } from '@openinula/babel-api';
import { reactivityFuncNames } from '../../const';
import { PrevMap } from '@openinula/reactivity-parser';

/**
 * @brief Get all valid dependencies of a babel path
 * @param propertyKey
 * @param path
 * @param ctx
 * @returns
 */
export function getDependenciesFromNode(
  propertyKey: string,
  path: NodePath<t.Expression | t.ClassDeclaration>,
  { current }: AnalyzeContext
) {
  // ---- Deps: console.log(count)
  const deps = new Set<string>();
  // ---- Assign deps: count = 1 or count++
  const assignDeps = new Set<string>();
  const depNodes: Record<string, t.Expression[]> = {};

  const visitor = (innerPath: NodePath<t.Identifier>) => {
    const propertyKey = innerPath.node.name;
    if (isAssignmentExpressionLeft(innerPath) || isAssignmentFunction(innerPath)) {
      assignDeps.add(propertyKey);
    } else if (current.availableVariables.includes(propertyKey)) {
      deps.add(propertyKey);
      findDependency(current.dependencyMap, propertyKey)?.forEach(deps.add.bind(deps));
      if (!depNodes[propertyKey]) depNodes[propertyKey] = [];
      depNodes[propertyKey].push(t.cloneNode(innerPath.node));
    }
  };
  if (path.isIdentifier()) {
    visitor(path);
  }
  path.traverse({
    Identifier: visitor,
  });

  // ---- Eliminate deps that are assigned in the same method
  //      e.g. { console.log(count); count = 1 }
  //      this will cause infinite loop
  //      so we eliminate "count" from deps
  assignDeps.forEach(dep => {
    deps.delete(dep);
  });

  const depArr = [...deps];
  if (deps.size > 0) {
    current.dependencyMap[propertyKey] = depArr;
  }

  return depArr;
}

/**
 * @brief Check if it's the left side of an assignment expression, e.g. count = 1
 * @param innerPath
 * @returns assignment expression
 */
function isAssignmentExpressionLeft(innerPath: NodePath): NodePath | null {
  let parentPath = innerPath.parentPath;
  while (parentPath && !parentPath.isStatement()) {
    if (parentPath.isAssignmentExpression()) {
      if (parentPath.node.left === innerPath.node) return parentPath;
      const leftPath = parentPath.get('left') as NodePath;
      if (innerPath.isDescendant(leftPath)) return parentPath;
    } else if (parentPath.isUpdateExpression()) {
      return parentPath;
    }
    parentPath = parentPath.parentPath;
  }

  return null;
}

/**
 * @brief Check if it's a reactivity function, e.g. arr.push
 * @param innerPath
 * @returns
 */
function isAssignmentFunction(innerPath: NodePath): boolean {
  let parentPath = innerPath.parentPath;

  while (parentPath && parentPath.isMemberExpression()) {
    parentPath = parentPath.parentPath;
  }
  if (!parentPath) return false;
  return (
    parentPath.isCallExpression() &&
    parentPath.get('callee').isIdentifier() &&
    reactivityFuncNames.includes((parentPath.get('callee').node as t.Identifier).name)
  );
}

function findDependency(dependencyMap: DependencyMap, propertyKey: string) {
  let currentMap: DependencyMap | undefined = dependencyMap;
  do {
    if (currentMap[propertyKey] !== undefined) {
      return currentMap[propertyKey];
    }
    // trace back to the previous map
    currentMap = currentMap[PrevMap];
  } while (currentMap);
  return null;
}
