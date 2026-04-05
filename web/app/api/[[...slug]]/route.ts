import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * BFF (Backend for Frontend) Edge Proxy - V2 (Smart Internal Redirect)
 * 核心逻辑：拦截后端的路径重定向并在内部完成跳转，彻底解决 Next.js 与 FastAPI 之间的斜杠冲突导致的死循环。
 */
async function proxyHandler(req: NextRequest) {
  const url = new URL(req.url);
  
  const searchParams = new URLSearchParams(url.search);
  searchParams.delete('slug'); 
  const queryString = searchParams.toString();
  
  const path = url.pathname.replace(/^\/api/, '');
  const backendBaseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  let targetUrl = `${backendBaseUrl}${path}${queryString ? `?${queryString}` : ''}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');

  try {
    // 第一次尝试请求
    let response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
      // @ts-ignore
      duplex: 'half',
      redirect: 'manual', // 我们手动接管重定向
    });

    // 如果后端因为斜杠问题要求重定向 (301, 307, 308)
    if ([301, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (location && (location.includes(backendBaseUrl) || location.startsWith('/'))) {
        const nextTarget = location.startsWith('/') ? `${backendBaseUrl}${location}` : location;
        
        console.log(`[BFF Proxy] Internal Redirect Followed: ${targetUrl} -> ${nextTarget}`);
        
        // 内部二次请求，这样浏览器感应不到重定向，也就不会触发 Next.js 的斜杠纠正
        response = await fetch(nextTarget, {
          method: req.method,
          headers: headers,
          body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
          // @ts-ignore
          duplex: 'half',
        });
      }
    }

    // 此时的 response 已经是最终结果，或者是无法内部处理的响应
    const resHeaders = new Headers(response.headers);
    
    // 安全起见，如果还有 Location 头（可能是业务逻辑跳转），依然进行改写
    const finalLocation = resHeaders.get('location');
    if (finalLocation && finalLocation.includes(backendBaseUrl)) {
      const newLocation = finalLocation.replace(backendBaseUrl, `${url.protocol}//${url.host}/api`);
      resHeaders.set('location', newLocation);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (error: any) {
    console.error(`[BFF Proxy ERROR]:`, error);
    return NextResponse.json(
      { detail: 'BFF Proxy Error: Could not connect to backend.' },
      { status: 502 }
    );
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;
export const HEAD = proxyHandler;
export const OPTIONS = proxyHandler;
