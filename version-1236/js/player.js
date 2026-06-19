(function () {
    window.initMoviePlayer = function (stream, videoId, buttonId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var attached = false;
        var hlsInstance = null;

        if (!video) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 40,
                    backBufferLength: 30
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = stream;
        }

        function hideButton() {
            if (button) {
                button.classList.add('is-hidden');
            }
        }

        function start() {
            attach();
            hideButton();
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        attach();

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', hideButton);
        video.addEventListener('ended', function () {
            if (button) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
}());
