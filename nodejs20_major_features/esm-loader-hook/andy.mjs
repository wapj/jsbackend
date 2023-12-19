// andy.mjs 
import { pathToFileURL } from 'url';
import { resolve as resolvePath } from 'path';

export async function resolve(specifier, context, defaultResolve) {
  const { parentURL = null } = context;
  // 'andy:andy' 프로토콜을 확인
  if (specifier.startsWith('andy:')) {
    // 실제 파일 경로로 변환
    const filePath = specifier.replace('andy:', '');
    const resolved = resolvePath(process.cwd(), `${filePath}.mjs`);
    return {
      url: pathToFileURL(resolved).href,
      shortCircuit: true
    };
  }
  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {  
  if (url.includes('andy')) {
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