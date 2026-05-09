async function interceptEmailRoute(page, routePattern) {
  let captured = null;

  await page.route(routePattern, async (route) => {
    const body = route.request().postDataJSON();
    captured = body;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  return () => captured;
}

module.exports = { interceptEmailRoute };