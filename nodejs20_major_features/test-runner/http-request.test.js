import { describe, test, mock } from 'node:test'
import assert from 'node:assert'
import HttpRequest from './http-request.js';

describe('http-request test', () => {
    const obj = new HttpRequest();
    // mock을 사용하여 get 메서드의 결괏값을 임의로 설정
    mock.method(obj, 'get', async () => {
        return await {
            text: () => 'Hello World'
        }
    });
    
    test('get test', async () => {
        const response = await obj.get('http://www.naver.com')
        const text = await response.text()
        assert.equal(text, 'Hello World')
    })

    test('get fail test', async () => {
        const response = await obj.get('http://www.google.com')
        const text = await response.text()
        assert.notEqual(text, 'Hello World!!')
    })
});