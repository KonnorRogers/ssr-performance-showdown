#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import {render} from '@lit-labs/ssr';
import {RenderResultReadable} from '@lit-labs/ssr/lib/render-result-readable.js';
import {html} from 'lit';

import { layout } from './client/index.js'
// import { collectResultSync } from '@lit-labs/ssr/lib/render-result.js';

export async function main () {
  const server = Fastify()

  server.get('/', (req, reply) => {
    const wrapperWidth = 960
    const wrapperHeight = 720
    const cellSize = 10
    const centerX = wrapperWidth / 2
    const centerY = wrapperHeight / 2

    let idCounter = 0
    let angle = 0
    let radius = 0

    const tiles = []
    const step = cellSize

    let x
    let y
    while (radius < Math.min(wrapperWidth, wrapperHeight) / 2) {
      x = centerX + Math.cos(angle) * radius
      y = centerY + Math.sin(angle) * radius

      if (x >= 0 && x <= wrapperWidth - cellSize && y >= 0 && y <= wrapperHeight - cellSize) {
        tiles.push({ x, y, id: idCounter++ })
      }

      angle += 0.2
      radius += step * 0.015
    }

    reply.type('text/html')

    return reply.send(
      new RenderResultReadable(
        // collectResultSync(
        render(
          layout(html)(html`<div id="wrapper">
          ${tiles.map((tile) => (
            html`<div
              class="tile"
              data-key="${tile.id}"
              style="left: ${tile.x}px; top: ${tile.y}px"></div>`
          ))}
      </div>`)
        )
      )
    )
  })

  return server
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await main()
  await server.listen({ port: 3000 })
}
