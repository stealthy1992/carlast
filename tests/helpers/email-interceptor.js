async function interceptEmailRoute(page, routePattern) {
  let captured = null;

  await page.route(routePattern, async (route) => {
    const request = route.request();
    const contentType = request.headers()['content-type'] || '';

    // ✅ Safe parsing — handles both JSON and multipart
    if (contentType.includes('application/json')) {
      captured = request.postDataJSON();
    } else {
      captured = parseMultipartFields(request.postData() || '');
    }

    // await route.fulfill({
    //   status: 200,
    //   contentType: 'application/json',
    //   body: JSON.stringify({ success: true }),
    // });
    await route.continue();
  });

  return () => captured;
}

function parseMultipartFields(rawBody) {
  const result = {};
  const lines = rawBody.split('\n').map(l => l.trim());

  for (let i = 0; i < lines.length; i++) {
    const nameMatch = lines[i].match(/Content-Disposition: form-data; name="([^"]+)"/);
    if (nameMatch) {
      const key = nameMatch[1];
      const value = lines[i + 2] || '';
      if (!value.startsWith('------')) {
        result[key] = value;
      }
    }
  }

  return result;
}

module.exports = { interceptEmailRoute };