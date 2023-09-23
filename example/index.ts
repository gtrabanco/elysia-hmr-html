import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static'
import { hmr } from '../src';
import { join } from 'node:path';

const app = new Elysia()
  .use(hmr({
    prefixToWatch: join(import.meta.dir, 'public'),
  }))
  .use(staticPlugin({
    assets: join(import.meta.dir, 'public'),
    prefix: '',
  })).listen(process.env.PORT || 0, ({ hostname, port }) => { console.log(`Elysia server started http://${hostname}:${port}`) });