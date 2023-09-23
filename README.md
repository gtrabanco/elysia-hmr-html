# Elysia HMR HTML Plugin

This plugin adds fast-refreash using Server Sent Events to your html files.

You can view a example in [`example`](example) directory.

## Installation

```shell
bun add --exact @gtrabanco/elysia-hmr-html
```

## Usage

```ts
import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static'
import { hmr } from '../src';

const app = new Elysia()
  .use(hmr({
    prefixToWatch: 'example/public' // Local path to watch for changes
  }))
  .use(staticPlugin({
    assets: 'example/public',
    prefix: '',
  })).listen(process.env.PORT || 0, ({ hostname, port }) => { console.log(`Elysia server started http://${hostname}:${port}`) });
```

## Run the included example

```bash
git clone https://github.com/gtrabanco/elysia-hmr-html
cd elysia-hmr-html
bun install
PORT=3000 bun example
```

After that open https://localhost:3000/index.html in your browser and open `${EDITOR} example/public/index.html`

Change something and save, you will see the changes in the browser :)

## Other

This plugin requires on `@gtrabanco/elysia-inject-html` package.

This plugin listen in BroadcastChannel on client in the channel with configured `hmrEventName` value. If you send the pathname to the file in the same domain as value it will only refreash only that page but if you send `*` value, it will refresh all pages listen for that event (in the same domain).


## More information

- [MDN Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
