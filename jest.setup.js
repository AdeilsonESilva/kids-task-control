import '@testing-library/jest-dom';
import { fetch, Request, Response as CrossFetchResponse, Headers } from 'cross-fetch';

global.fetch = fetch;
global.Request = Request;
global.Headers = Headers;

// Next.js's NextResponse.json seems to incorrectly call a static Response.json in some versions/setups.
// The standard Response object does not have a static .json() method.
// We provide a shim for it here if it doesn't exist.
// @ts-ignore
if (typeof CrossFetchResponse.json === 'undefined') {
  // @ts-ignore
  CrossFetchResponse.json = (data, init) => {
    const body = JSON.stringify(data);
    const headers = new Headers(init?.headers);
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }
    return new CrossFetchResponse(body, { ...init, headers });
  };
}

global.Response = CrossFetchResponse;
