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
import { HttpInstrumentationConfig } from '@opentelemetry/instrumentation-http';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { getNodeAutoResourceDetectors } from '../src';

describe('utils', () => {
  describe('getNodeAutoResourceDetectors', () => {
    it('should include all installed resource detectors', () => {
      const resourceDetectors = getNodeAutoResourceDetectors();
      const installedResourceDetectors = Object.keys(
        require('../package.json').dependencies
      ).filter(depName => {
        return depName.startsWith('@opentelemetry/resource-detector-');
      });

      assert.deepStrictEqual(
        new Set(resourceDetectors.map(i => i.instrumentationName)),
        new Set(installedResourceDetectors)
      );
    });

    it('should use user config', () => {
      function applyCustomAttributesOnSpan() {}

      const instrumentations = getNodeAutoResourceDetectors({
        '@opentelemetry/instrumentation-http': {
          applyCustomAttributesOnSpan,
        },
      });
      const instrumentation = instrumentations.find(
        instr =>
          instr.instrumentationName === '@opentelemetry/instrumentation-http'
      ) as any;
      const configHttp = instrumentation._config as HttpInstrumentationConfig;

      assert.strictEqual(
        configHttp.applyCustomAttributesOnSpan,
        applyCustomAttributesOnSpan
      );
    });

    it('should not return disabled instrumentation', () => {
      const instrumentations = getNodeAutoResourceDetectors({
        '@opentelemetry/instrumentation-grpc': {
          enabled: false,
        },
      });
      const instrumentation = instrumentations.find(
        instr =>
          instr.instrumentationName === '@opentelemetry/instrumentation-grpc'
      );
      assert.strictEqual(instrumentation, undefined);
    });

    it('should show error for none existing instrumentation', () => {
      const spy = sinon.stub(diag, 'error');
      const name = '@opentelemetry/instrumentation-http2';
      const instrumentations = getNodeAutoInstrumentations({
        // @ts-expect-error verify that wrong name works
        [name]: {
          enabled: false,
        },
      });
      const instrumentation = instrumentations.find(
        instr => instr.instrumentationName === name
      );
      assert.strictEqual(instrumentation, undefined);

      assert.strictEqual(
        spy.args[0][0],
        `Provided instrumentation name "${name}" not found`
      );
    });
  });
});
