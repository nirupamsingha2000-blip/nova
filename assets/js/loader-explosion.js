// Simple particle explosion for loader: lightweight canvas
(function(){
    function createExplosion(canvas){
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w = canvas.width = canvas.clientWidth * devicePixelRatio;
        let h = canvas.height = canvas.clientHeight * devicePixelRatio;
        ctx.scale(devicePixelRatio, devicePixelRatio);

        const particles = [];
        const cx = canvas.clientWidth/2;
        const cy = canvas.clientHeight/2;

        const colors = ['#06B6D4','#4F46E5','#60A5FA','#A78BFA','#C084FC'];

        for(let i=0;i<120;i++){
            const angle = Math.random()*Math.PI*2;
            const speed = 2 + Math.random()*6;
            particles.push({
                x:cx, y:cy,
                vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
                life: 40 + Math.random()*30,
                r: 2 + Math.random()*3,
                col: colors[Math.floor(Math.random()*colors.length)]
            });
        }

        let t=0;
        function frame(){
            t++;
            ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);
            particles.forEach(p=>{
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.06; // gravity
                p.life -= 1;
                const alpha = Math.max(0, p.life/80);
                ctx.fillStyle = p.col;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            // stop when all dead
            if (particles.every(p=>p.life<=0)) return;
            requestAnimationFrame(frame);
        }

        frame();
    }

    // expose factory
    window.createLoaderExplosion = function(canvas){
        try{ createExplosion(canvas); } catch(e){ console.error(e); }
    };
})();
