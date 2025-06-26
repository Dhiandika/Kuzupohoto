const toggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");
    if (toggle && navMenu) {
      toggle.addEventListener("click", () => {
        navMenu.classList.toggle("show");
        toggle.setAttribute("aria-expanded", navMenu.classList.contains("show"));
      });
    }
    const video = document.getElementById("video");
    const startBtn = document.getElementById("start");
    const finishBtn = document.getElementById("finish");
    const resetBtn = document.getElementById("reset");
    const countdownEl = document.getElementById("countdown");
    const previewCanvas = document.getElementById("previewCanvas");
    const ctx = previewCanvas.getContext("2d");
    const previewAreaLive = document.getElementById("previewAreaLive");
    const flashEffect = document.getElementById("flashEffect");
    const delaySelect = document.getElementById("delaySelect");

    let photos = [null, null, null];
    let delayTime = 3000;
    let videoSiap = false;

    delaySelect.addEventListener("change", (e) => {
      delayTime = parseInt(e.target.value);
    });

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((error) => {
        alert("Tidak dapat mengakses webcam.");
      });

    video.addEventListener("loadedmetadata", () => {
      videoSiap = true;
      console.log("Video siap digunakan.");
    });

    const showCountdown = async (ms) => {
      const seconds = ms / 1000;
      for (let i = seconds; i > 0; i--) {
        countdownEl.textContent = i;
        await new Promise((res) => setTimeout(res, 1000));
      }
      countdownEl.textContent = "📸";

      flashEffect.style.opacity = 1;
      await new Promise((res) => setTimeout(res, 100));
      flashEffect.style.opacity = 0;

      await new Promise((res) => setTimeout(res, 500));
      countdownEl.textContent = "";
    };

    async function ambilFotoKe(i) {
      if (!videoSiap || video.videoWidth === 0 || video.videoHeight === 0) {
        alert("Video belum siap. Coba lagi sebentar.");
        return;
      }

      await showCountdown(delayTime);

      const targetWidth = 1280;
      const targetHeight = 853;
      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = targetWidth / targetHeight;

      let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight;

      if (videoRatio > targetRatio) {
        sHeight = video.videoHeight;
        sWidth = sHeight * targetRatio;
        sx = (video.videoWidth - sWidth) / 2;
      } else {
        sWidth = video.videoWidth;
        sHeight = sWidth / targetRatio;
        sy = (video.videoHeight - sHeight) / 2;
      }

      previewCanvas.width = targetWidth;
      previewCanvas.height = targetHeight;

      ctx.save();
      ctx.translate(targetWidth, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      ctx.restore();

      const dataURL = previewCanvas.toDataURL("image/jpeg");
      photos[i] = dataURL;

      tampilkanFoto(i);
      cekSelesai();
    }

    function tampilkanFoto(i) {
      let container = document.getElementById(`foto-${i}`);
      if (!container) {
        container = document.createElement("div");
        container.className = "preview-item";
        container.id = `foto-${i}`;
        previewAreaLive.appendChild(container);
      }

      container.innerHTML = `
        <img src="${photos[i]}" class="preview-live-img" onclick="ulangFoto(${i})" title="Klik untuk ulang foto" width="240" height="160" />
      `;
    }

    function cekSelesai() {
      finishBtn.disabled = !photos.every(p => p !== null);
      resetBtn.style.display = 'inline-block';
    }

    window.ulangFoto = function (index) {
      ambilFotoKe(index);
    }

    startBtn.addEventListener("click", async () => {
      if (!videoSiap) {
        alert("Tunggu sampai kamera siap.");
        return;
      }

      startBtn.style.display = "none";
      finishBtn.disabled = false;
      photos = [null, null, null];
      previewAreaLive.innerHTML = "";

      for (let i = 0; i < 3; i++) {
        await ambilFotoKe(i);
      }
    });

    finishBtn.addEventListener("click", () => {
      localStorage.setItem("photos", JSON.stringify(photos));
      window.location.href = "preview.html";
    });

    resetBtn.addEventListener("click", () => {
      photos = [null, null, null];
      previewAreaLive.innerHTML = "";
      resetBtn.style.display = 'none';
      startBtn.style.display = 'inline-block';
    });