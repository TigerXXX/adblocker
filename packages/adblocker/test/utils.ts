/*!
 * Copyright (c) 2017-2019 Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import * as fs from 'fs';
import * as path from 'path';

export function loadEasyListFilters(): string[] {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'data', 'easylist.json'), { encoding: 'utf-8' }),
  );
}

function readAsset(filepath: string) {
  return fs.readFileSync(path.resolve(__dirname, '../', filepath), 'utf-8');
}

export function loadAllLists() {
  return [
    'assets/easylist/easylist.txt',
    'assets/easylist/easylistgermany.txt',
    'assets/easylist/easyprivacy.txt',
    'assets/fanboy/annoyance.txt',
    'assets/fanboy/cookiemonster.txt',
    'assets/peter-lowe/serverlist.txt',
    'assets/ublock-origin/annoyances.txt',
    'assets/ublock-origin/badware.txt',
    'assets/ublock-origin/filters.txt',
    'assets/ublock-origin/privacy.txt',
    'assets/ublock-origin/resource-abuse.txt',
    'assets/ublock-origin/unbreak.txt',
  ]
    .map(readAsset)
    .join('\n');
}

export function loadResources() {
  return readAsset('assets/ublock-origin/resources.txt');
}

export function getNaughtyStrings(): string[] {
  return fs.readFileSync(path.resolve(__dirname, 'data', 'blns.txt'), 'utf-8').split('\n');
}

export function typedArrayDiff(arr1: Uint8Array, arr2: Uint8Array): string[] {
  const differences: string[] = [];
  if (arr1.byteLength !== arr2.byteLength) {
    differences.push(
      `Diff (length): ${JSON.stringify({
        arr1_length: arr1.byteLength,
        arr2_length: arr2.byteLength,
      })}`,
    );
    return differences;
  }

  for (let i = 0; i < arr1.byteLength; i += 1) {
    if (arr1[i] !== arr2[i]) {
      differences.push(
        `Diff (values): ${JSON.stringify({
          arr1: arr1[i],
          arr2: arr2[i],
          i,
        })}`,
      );
      break;
    }
  }

  return differences;
}

export function typedArrayEqual(arr1: Uint8Array, arr2: Uint8Array): boolean {
  return typedArrayDiff(arr1, arr2).length === 0;
}
