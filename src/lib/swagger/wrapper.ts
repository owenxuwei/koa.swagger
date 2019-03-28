import * as IRouter from 'koa-router';
import * as Router from 'koa-router';
import * as R from 'ramda';
import * as is from 'is-type-of';
import validate from './validate';
import { swaggerHTML } from './swaggerHTML';
import { swaggerJSON } from './swaggerJSON';
import swaggerObject from './swaggerObject';
import {
  convertPath,
  getPath,
  loadSwaggerClasses,
  reservedMethodNames,
  allowedMethods
} from './utils';

export interface Context extends IRouter.IRouterContext {
  validatedQuery: any;
  validatedBody: any;
  validatedParams: any;
}

const validator = (parameters: any) => async (ctx: Context, next: () => Promise<any>) => {
  if (!parameters) {
    await next();
    return;
  }

  if (parameters.query) {
    ctx.validatedQuery = validate(ctx.request.query, parameters.query);
  }
  if (parameters.path) {
    ctx.validatedParams = validate(ctx.params, parameters.path);
  }
  if (parameters.body) {
    ctx.validatedBody = validate(ctx.request.body, parameters.body);
  }
  await next();
};

export interface SwaggerDisplayConfiguration {
  deepLinking?: boolean;
  displayOperationId?: boolean;
  defaultModelsExpandDepth?: number;
  defaultModelExpandDepth?: number;
  defaultModelRendering?: 'example' | 'model';
  displayRequestDuration?: boolean;
  docExpansion?: 'list' | 'full' | 'none';
  filter?: boolean | string;
  maxDisplayedTags?: number;
  showExtensions?: boolean;
  showCommonExtensions?: boolean;
}

export interface SwaggerConfiguration {
  display?: SwaggerDisplayConfiguration;
}

export interface SwaggerOptions {
  title?: string;
  description?: string;
  version?: string;
  swaggerJsonEndpoint?: string;
  swaggerHtmlEndpoint?: string;
  prefix?: string;
  swaggerOptions?: any;
  swaggerConfiguration?: SwaggerConfiguration;
  [name: string]: any;
}

const handleSwagger = (router: Router, options: SwaggerOptions) => {
  const {
    swaggerJsonEndpoint = '/swagger-json',
    swaggerHtmlEndpoint = '/swagger-html',
    prefix = '',
    swaggerConfiguration = {},
  } = options;

  // setup swagger router
  router.get(swaggerJsonEndpoint, async (ctx) => {
    ctx.body = swaggerJSON(options, swaggerObject.data);
  });
  router.get(swaggerHtmlEndpoint, async (ctx) => {
    ctx.body = swaggerHTML(getPath(prefix, swaggerJsonEndpoint), swaggerConfiguration);
  });
};

const handleMap = (router: Router, SwaggerClass: any, { doValidation = true }) => {
  if (!SwaggerClass) return;
  const classMiddlewares: any[] = SwaggerClass.middlewares || [];
  const classPrefix: string = SwaggerClass.prefix || '';

  const classParameters: any = SwaggerClass.parameters || {};
  const classParametersFilters: any[] = SwaggerClass.parameters
    ? SwaggerClass.parameters.filters
    : ['ALL'];
  classParameters.query = classParameters.query ? classParameters.query : {};

  const staticMethods = Object.getOwnPropertyNames(SwaggerClass)
    .filter(method => !reservedMethodNames.includes(method))
    .map(method => SwaggerClass[method]);

  const SwaggerClassPrototype = SwaggerClass.prototype;
  const methods = Object.getOwnPropertyNames(SwaggerClassPrototype)
      .filter(method => !reservedMethodNames.includes(method))
      .map(method => {
        const target = async function(ctx: Context) {
          const c = new SwaggerClass(ctx);
          await c[method](ctx);
        };

        Object.assign(target, SwaggerClassPrototype[method]);
        return target;
      });

  // map all methods
  [ ...staticMethods, ...methods ]
    // filter methods withour @request decorator
    .filter((item) => {
      const { path, method } = item as { path: string, method: string };
      if (!path && !method) {
        return false;
      }
      return true;
    })
    // add router
    .forEach((item) => {
      const { path, method } = item as { path: string, method: string };
      let { middlewares = [] } = item;
      const localParams = item.parameters || {};

      if (
        classParametersFilters.includes('ALL') ||
        classParametersFilters.map(i => i.toLowerCase()).includes(method)
      ) {
        const globalQuery = R.clone(classParameters.query);
        localParams.query = localParams.query ? localParams.query : {};
        // merge local query and class query
        // local query 的优先级更高
        localParams.query = Object.assign(globalQuery, localParams.query);
      }
      if (is.function(middlewares)) {
        middlewares = [middlewares];
      }
      if (!is.array(middlewares)) {
        throw new Error('middlewares params must be an array or function');
      }
      middlewares.forEach((item: Function) => {
        if (!is.function(item)) {
          throw new Error('item in middlewares must be a function');
        }
      });
      if (!allowedMethods.hasOwnProperty(method.toUpperCase())) {
        throw new Error(`illegal API: ${method} ${path} at [${item}]`);
      }

      const chain: [any] = [
        `${convertPath(`${classPrefix}${path}`)}`,
      ];
      if (doValidation) {
        chain.push(validator(localParams));
      }
      chain.push(...classMiddlewares);
      chain.push(...middlewares);
      chain.push(item);

      (router as any)[method](...chain);
    });
};

const handleMapDir = (router: SwaggerRouter, dir: string, options: MapOptions) => {
  loadSwaggerClasses(dir, options).forEach((c: any) => {
    router.map(c, options);
  });
};

export interface MapOptions {
  doValidation?: boolean;
  recursive?: boolean;
  [name: string]: any;
}
const wrapper = (router: SwaggerRouter) => {
  router.swagger = (options: SwaggerOptions = {}) => {
    handleSwagger(router, options);
  };
  router.map = (SwaggerClass: any, options: MapOptions = {}) => {
    handleMap(router, SwaggerClass, options);
  };

  router.mapDir = (dir: string, options: MapOptions = {}) => {
    handleMapDir(router, dir, options);
  };
};

class SwaggerRouter extends Router {
  swagger(options: SwaggerOptions = {}) {
    handleSwagger(this, options);
  }

  map(SwaggerClass: any, options: MapOptions) {
    handleMap(this, SwaggerClass, options);
  }

  mapDir(dir: string, options: MapOptions = {}) {
    handleMapDir(this, dir, options);
  }
}

export { wrapper, SwaggerRouter };
