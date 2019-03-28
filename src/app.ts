import * as Koa from 'koa';
import * as cors from 'koa-cors';
import * as bodyParser from 'koa-bodyparser';
import * as serve from 'koa-static';
import * as Router from 'koa-router';
const app = new Koa();
app.use(cors()).use(serve(__dirname+'/static')).use(bodyParser());
// app.use(ctx => {
//   ctx.body = 'Hello world';
// });

//router

// import bookrouter from './router/book';
// app.use(bookrouter.routes())

import { SwaggerRouter } from './lib/swagger'
import BookController from './Controller/BookController';
const swaggerrouter = new SwaggerRouter() // extends from koa-router
// swagger docs avaliable at http://localhost:3001/api/swagger-html
swaggerrouter.swagger({
    title: 'Example Server',
    description: 'API DOC',
    version: '1.0.0',
  
    // [optional] default is root path.
    // if you are using koa-swagger-decorator within nested router, using this param to let swagger know your current router point
    prefix: '/api',
  
    // [optional] default is /swagger-html
    swaggerHtmlEndpoint: '/swagger-html',
  
    // [optional] default is /swagger-json
    swaggerJsonEndpoint: '/swagger-json',
  
    // [optional] additional options for building swagger doc
    // eg. add api_key as shown below
    swaggerOptions: {
      securityDefinitions: {
        api_key: {
          type: 'apiKey',
          in: 'header',
          name: 'api_key',
        },
      },
    },
    // [optional] additional configuration for config how to show swagger view
    swaggerConfiguration: {
      display: {
        defaultModelsExpandDepth: 4, // The default expansion depth for models (set to -1 completely hide the models).
        defaultModelExpandDepth: 3, // The default expansion depth for the model on the model-example section.
        docExpansion: 'list', // Controls the default expansion setting for the operations and tags. 
        defaultModelRendering: 'model' // Controls how the model is shown when the API is first rendered. 
      }
    }
  })

// // mapDir will scan the input dir, and automatically call router.map to all Router Class
// swaggerrouter.mapDir(__dirname+'/Controller', {
//   // default: true. To recursively scan the dir to make router. If false, will not scan subroutes dir
//   // recursive: true,
//   // default: true, if true, you can call ctx.validatedBody[Query|Params] to get validated data.
//   // doValidation: true,
// });

// map all static methods at Test class for router
swaggerrouter.map(BookController,{default:true,recursive:true,doValidation:true});

const router = new Router();
router.use('/api', swaggerrouter.routes());

// swaggerrouter.mapDir('./Controller')

app.use(router.routes());
app.use(router.allowedMethods());

export default app;