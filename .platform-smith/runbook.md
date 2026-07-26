## build
no build step — sources run directly

## deploy
Interpreted Node.js service — no compilation or artifact deployment. The service runs directly from source files in /workspace. Changes take effect immediately on restart.

## stop
pkill -TERM -f 'node .*index.js'

## start
node index.js

## health
GET /health
