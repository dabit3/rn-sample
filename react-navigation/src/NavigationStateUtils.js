/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
'use strict';

const invariant = require('fbjs/lib/invariant');

import type {
  NavigationState,
  NavigationParentState,
} from 'NavigationTypeDefinition';

function getParent(state: NavigationState): ?NavigationParentState {
  if (
    (state instanceof Object) &&
    (state.routes instanceof Array) &&
    (state.routes[0] !== undefined) &&
    (typeof state.index === 'number') &&
    (state.routes[state.index] !== undefined)
  ) {
    return state;
  }
  return null;
}

function get(state: NavigationState, key: string): ?NavigationState {
  const parentState = getParent(state);
  if (!parentState) {
    return null;
  }
  const childState = parentState.routes.find(child => child.key === key);
  return childState || null;
}

function indexOf(state: NavigationState, key: string): ?number {
  const parentState = getParent(state);
  if (!parentState) {
    return null;
  }
  const index = parentState.routes.map(child => child.key).indexOf(key);
  if (index === -1) {
    return null;
  }
  return index;
}

function push(state: NavigationParentState, newChildState: NavigationState): NavigationParentState {
  var lastChildren: Array<NavigationState> = state.routes;
  return {
    ...state,
    routes: [
      ...lastChildren,
      newChildState,
    ],
    index: lastChildren.length,
  };
}

function pop(state: NavigationParentState): NavigationParentState {
  if (!state) {
    return state;
  }
  const lastChildren = state.routes;
  if (lastChildren.length <= 1) {
    return state;
  }
  return {
    ...state,
    routes: lastChildren.slice(0, lastChildren.length - 1),
    index: lastChildren.length - 2,
  };
}

function reset(state: NavigationState, nextChildren: ?Array<NavigationState>, nextIndex: ?number): NavigationState {
  const parentState = getParent(state);
  if (!parentState) {
    return state;
  }
  const routes = nextChildren || parentState.routes;
  const index = nextIndex == null ? parentState.index : nextIndex;
  if (routes === parentState.routes && index === parentState.index) {
    return state;
  }
  return {
    ...parentState,
    routes,
    index,
  };
}

function set(state: ?NavigationState, key: string, nextChildren: Array<NavigationState>, nextIndex: number): NavigationState {
  if (!state) {
    return {
      routes: nextChildren,
      index: nextIndex,
      key,
    };
  }
  const parentState = getParent(state);
  if (!parentState) {
    return {
      routes: nextChildren,
      index: nextIndex,
      key,
    };
  }
  if (nextChildren === parentState.routes && nextIndex === parentState.index && key === parentState.key) {
    return parentState;
  }
  return {
    ...parentState,
    routes: nextChildren,
    index: nextIndex,
    key,
  };
}

function jumpToIndex(state: NavigationState, index: number): NavigationState {
  const parentState = getParent(state);
  if (parentState && parentState.index === index) {
    return parentState;
  }
  return {
    ...parentState,
    index,
  };
}

function jumpTo(state: NavigationState, key: string): NavigationState {
  const parentState = getParent(state);
  if (!parentState) {
    return state;
  }
  const index = parentState.routes.indexOf(parentState.routes.find(child => child.key === key));
  invariant(
    index !== -1,
    'Cannot find child with matching key in this NavigationState'
  );
  return {
    ...parentState,
    index,
  };
}

function replaceAt(state: NavigationState, key: string, newState: NavigationState): NavigationState {
  const parentState = getParent(state);
  if (!parentState) {
    return state;
  }
  const routes = [...parentState.routes];
  const index = parentState.routes.indexOf(parentState.routes.find(child => child.key === key));
  invariant(
    index !== -1,
    'Cannot find child with matching key in this NavigationState'
  );
  routes[index] = newState;
  return {
    ...parentState,
    routes,
  };
}

function replaceAtIndex(state: NavigationState, index: number, newState: NavigationState): NavigationState {
  const parentState = getParent(state);
  if (!parentState) {
    return state;
  }
  const routes = [...parentState.routes];
  routes[index] = newState;
  return {
    ...parentState,
    routes,
  };
}

const NavigationStateUtils = {
  getParent,
  get: get,
  indexOf,
  push,
  pop,
  reset,
  set: set,
  jumpToIndex,
  jumpTo,
  replaceAt,
  replaceAtIndex,
};

module.exports = NavigationStateUtils;
