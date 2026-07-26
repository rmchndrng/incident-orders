## build
npm install

## deploy
In-place install of Node.js dependencies; no separate deployment step needed for this interpreted stack (inferred — low confidence: no original Dockerfile or deployment config found)

## stop
pkill -TERM -f 'node.*index.js'

## start
node index.js

## health
n/a — not a long-running listener
