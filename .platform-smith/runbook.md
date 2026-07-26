## build
no build step — sources run directly

## deploy
Node.js interpreted runtime — sources execute in place from /workspace

## stop
pkill -TERM -f 'node .*index.js'

## start
node index.js

## health
GET /health
