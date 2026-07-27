## build
npm install --omit=dev

## deploy
No deployment step — Node.js application runs in place from source

## stop
pkill -TERM -f 'node .*index.js'

## start
node index.js

## health
GET /health
