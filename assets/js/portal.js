document.addEventListener('DOMContentLoaded', () => {
    const portalLoginForm = document.querySelector('.portal-login-form');
    const progressChart = document.querySelector('#progressChart');
    const teacherLoginForm = document.querySelector('.teacher-login-form');
    const teacherActions = document.querySelectorAll('.teacher-action');
    const attendanceButtons = document.querySelectorAll('.attendance-row button');

    const drawProgressChart = () => {
        if (!progressChart) return;
        const ctx = progressChart.getContext('2d');
        const width = progressChart.width;
        const height = progressChart.height;
        const scores = [62, 68, 74, 79, 84, 86, 91];
        const padding = 34;

        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';

        for (let i = 0; i < 4; i += 1) {
            const y = padding + ((height - padding * 2) / 3) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        const points = scores.map((score, index) => {
            const x = padding + ((width - padding * 2) / (scores.length - 1)) * index;
            const y = height - padding - ((score - 50) / 50) * (height - padding * 2);
            return { x, y };
        });

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#4F46E5');
        gradient.addColorStop(1, '#06B6D4');

        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#06B6D4';
            ctx.shadowColor = '#06B6D4';
            ctx.shadowBlur = 14;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    };

    if (portalLoginForm) {
        portalLoginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            drawProgressChart();
        });
    }

    window.addEventListener('resize', drawProgressChart);
    drawProgressChart();

    if (teacherLoginForm) {
        teacherLoginForm.addEventListener('submit', (event) => {
            event.preventDefault();
        });
    }

    attendanceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const row = button.closest('.attendance-row');
            if (!row) return;
            row.querySelectorAll('button').forEach(item => item.classList.remove('active', 'present'));
            button.classList.add('active');
        });
    });

    teacherActions.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.teacher-tool-card');
            const status = card ? card.querySelector('.teacher-status') : null;
            button.textContent = 'Saved';
            setTimeout(() => {
                button.textContent = button.dataset.originalText || 'Done';
            }, 1200);
            if (status) {
                status.textContent = 'Announcement sent to the selected batch.';
            }
        });
        button.dataset.originalText = button.textContent;
    });
});
