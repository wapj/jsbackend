import rightPad from 'https://esm.sh/right-pad@1.0.1'
import { test } from 'andy:andy'

console.log(rightPad('foo', 20, '.'))
test()

// node --loader=./andy.mjs --experimental-loader=./url-loader.mjs  main.js