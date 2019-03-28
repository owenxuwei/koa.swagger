import * as Router from 'koa-router';
import { request, summary, prefix, query, path,responses, body, tags, swaggerClass, swaggerProperty, description } from '../lib/swagger';

@swaggerClass()
export class bookInfo {
  @swaggerProperty({ type: "string", required: true }) Name: string = "";
  @swaggerProperty({ type: "string", required: true }) Author: string = "";
//   @swaggerProperty({type:"object",properties:(subObject.prototype as any).swaggerDocument}) UserInfo:subObject;
};

const bookSchema = {
  name: { type: 'string', required: true },
  author: { type: 'string', required: true }
};

const tag = tags(['Book']);

import dbhelper from '../database/sqllite'

export default class BookController {
  @request('GET', '/book/list')
  @summary('查询列表')
  @tag
  @description('查询列表')
  @responses({
    200: {description: '列表结果'}
  })
  static async List(ctx: Router.IRouterContext) {
    const result = await dbhelper.query("select * from Book");
    console.log(result);
    ctx.body = result;
  }

  @request('POST', '/book/add')
  @summary('新增book')
  @tag
  @description('新增book')
  // @body(bookSchema)
  @body((bookInfo.prototype as any).swaggerDocument)
  @responses({
    200: { description: 'success' },
    500: { description: 'something wrong about server' }
  })
  static async Add(ctx: Router.IRouterContext) {
    const book = (ctx as any).validatedBody as bookInfo;
    console.log(book);
    const result = await dbhelper.execute("INSERT INTO Book(Name,Author) VALUES (?,?);", [book.Name, book.Author]);
    console.log(result);
    ctx.status = 200
  }

  @request('DELETE', '/book/delete')
  @summary('删除book')
  @tag
  @query({
    id: { type: 'number', required: true, default: 1, description: 'book id' },
  })
  @responses({
    200: { description: 'success' }
  })
  static async Delete(ctx: Router.IRouterContext) {
    const result = await dbhelper.execute("delete from Book where id=?", [ctx.query.id]);
    console.log(result);
    ctx.status = 200
  }
}