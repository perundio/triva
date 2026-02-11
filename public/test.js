(function () {
    "use strict";
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    var form = document.getElementById("testForm");
    var actionInput = document.getElementById("formActionUrl");

    function getActionUrl() {
        var v = (actionInput && actionInput.value || "").trim();
        if (!v) return "";
        if (/^https?:\/\//i.test(v)) return v;
        var base = window.location.origin;
        var segment = v.replace(/^\/v1\/?/, "").replace(/^\//, "");
        return base + "/v1/" + encodeURIComponent(segment);
    }

    function getMethod() {
        var r = form && form.querySelector("input[name=_method]:checked");
        return (r && r.value) || "POST";
    }

    function syncFormAction() {
        if (!form) return;
        var action = getActionUrl();
        form.action = action || window.location.href;
        form.method = getMethod();
    }

    if (actionInput) {
        actionInput.addEventListener("input", syncFormAction);
        actionInput.addEventListener("change", syncFormAction);
    }
    if (form) {
        form.querySelectorAll("input[name=_method]").forEach(function (radio) {
            radio.addEventListener("change", syncFormAction);
        });
    }
    syncFormAction();

    if (form) {
        form.addEventListener("submit", function (e) {
            if (!getActionUrl()) {
                e.preventDefault();
                alert("Enter a valid email (e.g. you@example.com) or Telegram chat ID (numeric).");
            }
        });
    }

    // Particles (simplified for test page)
    (function () {
        var canvas = document.getElementById("particle-canvas");
        if (!canvas) return;
        var ctx = canvas.getContext("2d");
        var width, height, particles = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        function createParticles() {
            var count = Math.min(Math.floor((width * height) / 26000), 80);
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
            var maxDist = 120;
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
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
        window.addEventListener("resize", function () { resize(); createParticles(); });
        resize();
        createParticles();
        draw();
    })();
})();
