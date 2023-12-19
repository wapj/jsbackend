// andy.mjs 
export async function load(url, context, defaultLoad) {
  console.log('load >> ', url);
  if (url.startsWith('andy:')) {
    return {
      format: 'module',
      source: `
        // 사용자 정의 모듈 소스
        export function test() {
          console.log('Hello Node.JS! I am Andy');
        }
      `,
      shortCircuit: true
    };
  }
  return defaultLoad(url, context);
}