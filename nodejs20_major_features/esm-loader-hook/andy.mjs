export async function resolve(specifier, context, defaultResolve) {

  // 여기에서 사용자 정의 해석 로직을 구현
  if (specifier.endsWith('.andy')) {
    return {
      url: `andy:${specifier}`,
      shortCircuit: true
    };
  }

  return defaultResolve(specifier, context);
}

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

  // 기본 로드 로직에 위임
  return defaultLoad(url, context);
}