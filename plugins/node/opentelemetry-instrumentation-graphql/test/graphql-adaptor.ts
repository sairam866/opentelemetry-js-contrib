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
import type {
  GraphQLFieldResolver,
  GraphQLSchema,
  GraphQLTypeResolver,
  Source,
} from 'graphql';
import { graphql as origGraphql, version } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';

const variantGraphql = origGraphql as Function;

interface GraphQLArgs {
  schema: GraphQLSchema;
  source: string | Source;
  rootValue?: unknown;
  contextValue?: unknown;
  variableValues?: Maybe<{
    readonly [variable: string]: unknown;
  }>;
  operationName?: Maybe<string>;
  fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>;
  typeResolver?: Maybe<GraphQLTypeResolver<any, any>>;
}

export const graphql = (args: GraphQLArgs) =>
  !version || version.startsWith('14.') || version.startsWith('15.')
    ? variantGraphql(
        args.schema,
        args.source,
        args.rootValue,
        args.contextValue,
        args.variableValues,
        args.operationName,
        args.fieldResolver,
        args.typeResolver
      )
    : variantGraphql(args);
