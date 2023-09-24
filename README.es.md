This documentation is also available in english in [🇬🇧 🇺🇸 README.md](README.md) file.

# Elysia HMR HTML Plugin

Este plugin hace posible reflejar los cambios en un archivo html por medio de "Server Sent Events".

Puedes ver un ejemplo en el directorio [`example`](example) (se explica como ejecutarlo más abajo en este README).

## Requisitos

- Un navegador con soporte para Server Sent Events
- El paquete de [Elysia](https://elysiajs.com/) instalado
- Bun. No está probado con nodejs, pero para correrlo con node es posible necesites [algunos wrapers](https://github.com/jhmaster2000/node-bun), [Elysia/node](https://github.com/elysiajs/node-adapter) y necesites [HTMLRewriter](https://www.npmjs.com/package/html-rewriter-wasm)

## Instalación

```shell
bun add --exact @gtrabanco/elysia-hmr-html
```

## Uso

```ts
import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static'
import { hmr } from '../src';

const app = new Elysia()
  .use(hmr({
    prefixToWatch: 'example/public' // Directorio en el que quieres buscar los cambios, normalmente será el directorio desde el que sirvas contenido html/jsx que se sirva con una cabecera Content-Type con valor html
  }))
  .use(staticPlugin({
    assets: 'example/public', // El directorio en el que están los archivos html
    prefix: '',
  })).listen(process.env.PORT || 0, ({ hostname, port }) => { console.log(`Elysia server started http://${hostname}:${port}`) });
```

## Ejecutar el ejemplo incluido

```bash
git clone https://github.com/gtrabanco/elysia-hmr-html
cd elysia-hmr-html
bun install
PORT=3000 bun example
```

Después de ejecutar todo lo anterior accedemos con el navegador a la url **https://localhost:3000/index.html** y abrimos en el editor `${EDITOR} example/public/index.html`.

Haz algunos cambios y guardalos mientras mantienes el navegador a la vista y verás los cambios reflejados de forma casi instantanea. 😃

## Otros

Este plugin depende del paquete [`@gtrabanco/elysia-inject-html`](https://npmjs.com/package/@gtrabanco/elysia-inject-html).

This plugin listen in BroadcastChannel on client in the channel with configured `hmrEventName` value. If you send the pathname to the file in the same domain as value it will only refreash only that page but if you send `*` value, it will refresh all pages listen for that event (in the same domain).


## Mas información

- [Elysia](https://elysiajs.com/)
- [Soporte de los navegadores de Server Sent Events en CanIUse](https://caniuse.com/eventsource)
- [MDN Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
