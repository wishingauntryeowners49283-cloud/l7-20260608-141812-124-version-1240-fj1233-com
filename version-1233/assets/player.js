(function () {
    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        const existing = document.querySelector('script[data-hls-loader]');

        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    window.initializePlayer = function (sourceUrl) {
        const video = document.querySelector('[data-player-video]');
        const overlay = document.querySelector('[data-player-overlay]');
        let prepared = false;
        let preparing = false;
        let callbacks = [];

        if (!video || !sourceUrl) {
            return;
        }

        function complete() {
            prepared = true;
            preparing = false;
            callbacks.splice(0).forEach(function (callback) {
                callback();
            });
        }

        function prepare(callback) {
            if (prepared) {
                callback();
                return;
            }

            callbacks.push(callback);

            if (preparing) {
                return;
            }

            preparing = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                complete();
                return;
            }

            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(sourceUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, complete);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            hls.destroy();
                            video.src = sourceUrl;
                            complete();
                        }
                    });
                } else {
                    video.src = sourceUrl;
                    complete();
                }
            });
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function start(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            hideOverlay();
            prepare(function () {
                const promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', hideOverlay);
        prepare(function () {});
    };
})();
