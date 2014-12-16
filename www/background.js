chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html', {
        bounds: {
            width: 400,
            height: 680,
            top: 0,
            left: 0
        }
    });
});
