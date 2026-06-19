(function () {
  var video = document.getElementById("movie-player");
  var overlay = document.getElementById("play-overlay");
  var config = document.getElementById("play-config");
  var errorBox = document.getElementById("play-error");

  if (!video || !overlay || !config) {
    return;
  }

  var streamUrl = "";
  var attached = false;
  var hls = null;

  try {
    streamUrl = JSON.parse(config.textContent).stream || "";
  } catch (error) {
    streamUrl = "";
  }

  function showError() {
    if (errorBox) {
      errorBox.hidden = false;
    }
  }

  function attachStream() {
    if (attached || !streamUrl) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showError();
        }
      });
      attached = true;
      return;
    }

    video.src = streamUrl;
    attached = true;
  }

  function startPlayback() {
    attachStream();
    overlay.classList.add("is-hidden");
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", startPlayback);

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("error", showError);

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
