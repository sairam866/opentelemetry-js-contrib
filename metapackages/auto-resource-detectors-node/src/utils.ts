/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { diag } from '@opentelemetry/api';
import { Detector } from '@opentelemetry/resources';

import { gitHubDetector } from '@opentelemetry/resource-detector-github';

const ResourceDetectorMap = {
  '@opentelemetry/resource-detector-github': gitHubDetector,
};

// Config types inferred automatically from the first argument of the constructor
type ConfigArg<T> = T extends new (...args: infer U) => unknown ? U[0] : never;
export type  ResourceDetectorConfigMap = {
  [Name in keyof typeof ResourceDetectorMap]?: ConfigArg<
    typeof ResourceDetectorMap[Name]
  >;
};

export function getNodeAutoResourceDetectors(
  inputConfigs: ResourceDetectorConfigMap = {}
): Detector[] {
  for (const name of Object.keys(inputConfigs)) {
    if (!Object.prototype.hasOwnProperty.call(ResourceDetectorMap, name)) {
      diag.error(`Provided resource detector name "${name}" not found`);
      continue;
    }
  }

  const resourceDetectors: Detector[] = [];

  for (const name of Object.keys(ResourceDetectorMap) as Array<
    keyof typeof ResourceDetectorMap
  >) {
    const Instance = ResourceDetectorMap[name];
    // Defaults are defined by the resource detector itself
    const userConfig = inputConfigs[name] ?? {};

    if (userConfig.enabled === false) {
      diag.debug(`Disabling resource detector for ${name}`);
      continue;
    }

    try {
      diag.debug(`Loading resource detector for ${name}`);
      resourceDetectors.push(new Instance(userConfig));
    } catch (e) {
      diag.error(e);
    }
  }

  return resourceDetectors;
}
