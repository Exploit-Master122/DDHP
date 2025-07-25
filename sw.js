self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);
  const path = requestURL.pathname;

  if (path.startsWith('/proxy/')) {
    const encodedUrl = path.split('/proxy/')[1];
    let targetUrl;
    try {
      targetUrl = atob(encodedUrl);
    } catch (e) {
      return event.respondWith(new Response('Invalid URL encoding.', { status: 400 }));
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return event.respondWith(new Response('Only HTTP(S) URLs are supported.', { status: 400 }));
    }

    event.respondWith(
      fetch(targetUrl, {
        method: event.request.method,
        headers: event.request.headers,
        mode: 'cors',
        credentials: 'omit'
      }).then(response => {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        return new Response(response.body, {
          status: response.status,
          headers: newHeaders
        });
      }).catch(err => {
        return new Response(`Failed to fetch: ${err.message}`, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
    );
  }
});
