/* jshint ignore: start */
self.addEventListener("message", async event => {

	const { url, origUrl } = event.data;
	const response = await fetch(url);
	const blob = await response.blob();

	self.postMessage({
		url: url,
		origUrl: origUrl,
		blob: blob
	});
});
