document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('concept-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const angleInput = document.getElementById('concept-angle');
    const velocityInput = document.getElementById('concept-velocity');
    const angleValueEl = document.getElementById('concept-angle-value');
    const velocityValueEl = document.getElementById('concept-velocity-value');
    const rangeEl = document.getElementById('concept-range');
    const heightEl = document.getElementById('concept-height');
    const timeEl = document.getElementById('concept-time');
    const launchBtn = document.querySelector('.concept-launch');
    const gravityChips = document.querySelectorAll('.gravity-chip');

    let g = 9.8;
    let animId = null;
    let lastTrajectory = null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const aspect = 420 / 640;

    const resizeCanvasBackingStore = () => {
        const displayWidth = canvas.clientWidth || 640;
        const displayHeight = displayWidth * aspect;
        canvas.width = Math.round(displayWidth * dpr);
        canvas.height = Math.round(displayHeight * dpr);
        canvas.style.height = `${displayHeight}px`;
    };

    const computePhysics = () => {
        const angleDeg = parseFloat(angleInput.value);
        const v = parseFloat(velocityInput.value);
        const theta = (angleDeg * Math.PI) / 180;
        const range = (v * v * Math.sin(2 * theta)) / g;
        const maxHeight = (v * v * Math.sin(theta) * Math.sin(theta)) / (2 * g);
        const timeOfFlight = (2 * v * Math.sin(theta)) / g;
        return { angleDeg, v, theta, range, maxHeight, timeOfFlight };
    };

    const updateReadouts = ({ range, maxHeight, timeOfFlight }) => {
        rangeEl.textContent = `${range.toFixed(1)} m`;
        heightEl.textContent = `${maxHeight.toFixed(1)} m`;
        timeEl.textContent = `${timeOfFlight.toFixed(2)} s`;
    };

    const trajectoryPoint = (t, v, theta) => {
        const x = v * Math.cos(theta) * t;
        const y = v * Math.sin(theta) * t - 0.5 * g * t * t;
        return { x, y: Math.max(y, 0) };
    };

    const draw = (physics, progress) => {
        const w = canvas.clientWidth || 640;
        const h = w * aspect;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const padding = 36;
        const groundY = h - padding;
        const scaleX = (w - padding * 2) / Math.max(physics.range, 1);
        const scaleY = (groundY - padding) / Math.max(physics.maxHeight, 1);
        const scale = Math.min(scaleX, scaleY);

        ctx.strokeStyle = 'rgba(148,163,184,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, groundY);
        ctx.lineTo(w - padding, groundY);
        ctx.stroke();

        if (lastTrajectory) {
            ctx.beginPath();
            lastTrajectory.forEach((pt, i) => {
                const px = padding + pt.x * scale;
                const py = groundY - pt.y * scale;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            });
            ctx.strokeStyle = 'rgba(148,163,184,0.35)';
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        const steps = 60;
        const points = [];
        for (let i = 0; i <= steps; i += 1) {
            const t = (physics.timeOfFlight * i) / steps;
            points.push(trajectoryPoint(t, physics.v, physics.theta));
        }

        ctx.beginPath();
        points.forEach((pt, i) => {
            const px = padding + pt.x * scale;
            const py = groundY - pt.y * scale;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        const gradient = ctx.createLinearGradient(padding, 0, w - padding, 0);
        gradient.addColorStop(0, '#4F46E5');
        gradient.addColorStop(1, '#06B6D4');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        const ballT = progress === null ? 0 : physics.timeOfFlight * progress;
        const ballPoint = trajectoryPoint(ballT, physics.v, physics.theta);
        const bx = padding + ballPoint.x * scale;
        const by = groundY - ballPoint.y * scale;
        ctx.beginPath();
        ctx.arc(bx, by, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#06B6D4';
        ctx.shadowColor = '#06B6D4';
        ctx.shadowBlur = progress === null ? 0 : 16;
        ctx.fill();
        ctx.shadowBlur = 0;

        return points;
    };

    const refreshPreview = () => {
        const physics = computePhysics();
        updateReadouts(physics);
        draw(physics, null);
    };

    const launch = () => {
        if (animId) cancelAnimationFrame(animId);
        const physics = computePhysics();
        updateReadouts(physics);
        const duration = 1400;
        const start = performance.now();

        const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / duration);
            const points = draw(physics, progress);
            if (progress < 1) {
                animId = requestAnimationFrame(step);
            } else {
                lastTrajectory = points;
                animId = null;
            }
        };
        animId = requestAnimationFrame(step);
    };

    angleInput.addEventListener('input', () => {
        angleValueEl.textContent = `${angleInput.value}°`;
        if (!animId) refreshPreview();
    });

    velocityInput.addEventListener('input', () => {
        velocityValueEl.textContent = `${velocityInput.value} m/s`;
        if (!animId) refreshPreview();
    });

    gravityChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            gravityChips.forEach((c) => c.classList.remove('active'));
            chip.classList.add('active');
            g = parseFloat(chip.dataset.g);
            lastTrajectory = null;
            if (!animId) refreshPreview();
        });
    });

    if (launchBtn) launchBtn.addEventListener('click', launch);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resizeCanvasBackingStore();
            if (!animId) refreshPreview();
        }, 120);
    });

    resizeCanvasBackingStore();
    refreshPreview();
});
