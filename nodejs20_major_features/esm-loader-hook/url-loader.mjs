// url-loader.mjs
export async function load(url, context, nextLoad) {
  if (url.startsWith("https://")) {
    const response = await fetch(url, { redirect: "follow" });
    const source = await response.text();

    return {source, format: "module", shortCircuit: true}
  } else {
    return await nextLoad(url, context)
  }
}
