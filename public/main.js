(function () {
    "use strict";

    // --- Year in footer ---
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- Smooth scroll for header nav ---
    document.querySelectorAll(".header-link[data-scroll]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var id = this.getAttribute("data-scroll");
            var el = id ? document.getElementById(id) : null;
            if (el) el.scrollIntoView({ behavior: "smooth" });
        });
    });

    // --- Particles (requestAnimationFrame, single loop) ---
    (function () {
        var canvas = document.getElementById("particle-canvas");
        if (!canvas) return;
        var ctx = canvas.getContext("2d");
        var width, height, particles = [], mouse = null;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        function createParticles() {
            var count = Math.min(Math.floor((width * height) / 26000), 120);
            particles = [];
            for (var i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: 1 + Math.random() * 1.2
                });
            }
        }
        function draw() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "rgba(15,23,42,0.9)";
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "rgba(0,243,255,0.7)";
            var maxDist = 120, mouseInfluence = 120;
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
                if (mouse) {
                    var dx = p.x - mouse.x, dy = p.y - mouse.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouseInfluence) {
                        var force = (mouseInfluence - dist) / mouseInfluence;
                        p.vx += (dx / dist) * force * 0.02;
                        p.vy += (dy / dist) * force * 0.02;
                    }
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = "rgba(0,243,255,0.25)";
            ctx.lineWidth = 0.6;
            for (i = 0; i < particles.length; i++) {
                for (var j = i + 1; j < particles.length; j++) {
                    var p1 = particles[i], p2 = particles[j];
                    var dx = p1.x - p2.x, dy = p1.y - p2.y;
                    var d = Math.sqrt(dx * dx + dy * dy);
                    if (d < maxDist) {
                        ctx.strokeStyle = "rgba(0,243,255," + (1 - d / maxDist) * 0.35 + ")";
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(draw);
        }
        window.addEventListener("resize", function () {
            resize();
            createParticles();
        });
        window.addEventListener("mousemove", function (e) {
            mouse = { x: e.clientX, y: e.clientY };
        });
        window.addEventListener("mouseleave", function () {
            mouse = null;
        });
        resize();
        createParticles();
        draw();
    })();

    // --- Hero typing ---
    (function () {
        var el = document.getElementById("hero-typed");
        if (!el) return;
        var lines = [
            "make link you@example.com",
            "attach --form https://your-form.com",
        ];
        var lineIndex = 0, charIndex = 0, deleting = false;
        function tick() {
            var current = lines[lineIndex];
            if (!deleting) {
                charIndex++;
                if (charIndex >= current.length) setTimeout(function () { deleting = true; }, 900);
            } else {
                charIndex--;
                if (charIndex <= 0) {
                    deleting = false;
                    lineIndex = (lineIndex + 1) % lines.length;
                }
            }
            el.textContent = current.slice(0, charIndex);
            setTimeout(tick, deleting ? 40 : 70);
        }
        tick();
    })();

    // --- Link generator + Telegram hint ---
    (function () {
        var slugInput = document.getElementById("slug-input");
        var consoleEl = document.getElementById("action-console");
        var telegramHint = document.getElementById("telegramHint");
        var telegramBotLinkEl = document.getElementById("telegramBotLink");
        if (!slugInput || !consoleEl) return;

        var telegramBotUrl = "";
        var telegramBotUsername = "";
        var originPrefix = document.getElementById("action-origin-prefix");
        if (originPrefix) originPrefix.textContent = window.location.origin + "/v1/";

        fetch("/v1/api/config")
            .then(function (r) { return r.json(); })
            .then(function (data) {
                telegramBotUrl = data.telegramBotUrl || "";
                telegramBotUsername = data.telegramBotUsername || "";
                updateTelegramBotLink();
            })
            .catch(function () { updateTelegramBotLink(); });

        function updateTelegramBotLink() {
            if (!telegramBotLinkEl) return;
            var display = telegramBotUsername ? "@" + telegramBotUsername.replace(/^@/, "") : "@Bot";
            if (telegramBotUrl) {
                telegramBotLinkEl.innerHTML = "";
                var a = document.createElement("a");
                a.href = telegramBotUrl;
                a.target = "_blank";
                a.rel = "noopener";
                a.className = "accent-text";
                a.textContent = display;
                telegramBotLinkEl.appendChild(a);
            } else {
                telegramBotLinkEl.textContent = display;
            }
        }

        function clearConsole() {
            consoleEl.innerHTML = "";
        }
        function appendLine(text, options) {
            options = options || {};
            var line = document.createElement("div");
            line.className = "action-console-line";
            var prefix = document.createElement("span");
            prefix.className = "action-console-prefix";
            prefix.textContent = ">";
            var body = document.createElement("span");
            if (options.type === "success") body.className = "action-console-success";
            else if (options.type === "error") body.className = "action-console-error";
            else if (options.type === "muted") body.className = "action-console-muted";
            body.textContent = text;
            line.appendChild(prefix);
            line.appendChild(body);
            consoleEl.appendChild(line);
        }
        function appendLinkLine(url) {
            var line = document.createElement("div");
            line.className = "action-console-line";
            var prefix = document.createElement("span");
            prefix.className = "action-console-prefix";
            prefix.textContent = ">";
            var link = document.createElement("span");
            link.className = "action-console-link";
            link.textContent = url;
            link.addEventListener("click", function () {
                window.open(url, "_blank", "noopener");
            });
            line.appendChild(prefix);
            line.appendChild(link);
            consoleEl.appendChild(line);
            var copyBtn = document.createElement("button");
            copyBtn.type = "button";
            copyBtn.className = "action-console-copy";
            copyBtn.innerHTML = "<span>[COPY]</span>";
            copyBtn.addEventListener("click", function () {
                navigator.clipboard.writeText(url).then(
                    function () {
                        copyBtn.innerHTML = "<span>Copied</span>";
                        setTimeout(function () { copyBtn.innerHTML = "<span>[COPY]</span>"; }, 1200);
                    },
                    function () {
                        copyBtn.innerHTML = "<span>Copy failed</span>";
                        setTimeout(function () { copyBtn.innerHTML = "<span>[COPY]</span>"; }, 1200);
                    }
                );
            });
            consoleEl.appendChild(copyBtn);
        }
        function updateConsole(slug) {
            clearConsole();
            if (!slug) {
                appendLine("Enter email or Telegram chat ID to get your link.", { type: "muted" });
                if (telegramHint) telegramHint.classList.remove("visible");
                return;
            }
            var cleanSlug = slug.trim().replace(/\s+/g, "-");
            var base = window.location.origin;
            var url = base + "/v1/" + (cleanSlug || slug);
            appendLine("Your secure endpoint is ready:", { type: "success" });
            appendLinkLine(url);
            appendLine("Copy the link and use it as your form webhook.", { type: "muted" });
            if (telegramHint) {
                var slugTrim = slug.trim();
                var showHint = slugTrim.indexOf("@") === 0 || (/^\d{1,32}$/.test(slugTrim) && parseInt(slugTrim, 10) > 0);
                if (showHint) {
                    telegramHint.classList.add("visible");
                    updateTelegramBotLink();
                } else {
                    telegramHint.classList.remove("visible");
                }
            }
        }
        updateConsole("");
        slugInput.addEventListener("input", function () {
            updateConsole(this.value);
        });
    })();

})();
