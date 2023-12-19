import { register } from "node:module"; 
import { pathToFileURL } from "node:url"; 

register("./andy.mjs", pathToFileURL("./")); 
register("./url-loader.mjs", pathToFileURL("./"));