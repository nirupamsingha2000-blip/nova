// Simple Visualize prototype: interactive projectile simulation
document.addEventListener('DOMContentLoaded', ()=>{
    const mount = document.getElementById('visualize-root');
    if(!mount) return;
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(720, window.innerWidth-40);
    canvas.height = 300;
    mount.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let speed = 60; let angle = 45; let g = 9.8; let launched=false; let t0=0;
    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        // ground
        ctx.fillStyle='#061224'; ctx.fillRect(0,canvas.height-20,canvas.width,20);
        // draw trajectory if launched
        if(launched){
            const t = (performance.now()-t0)/1000;
            const rad = angle*Math.PI/180;
            const vx = speed*Math.cos(rad); const vy = speed*Math.sin(rad);
            const x = vx * t; const y = vy*t - 0.5*g*t*t;
            const cx = 20 + x * 4; const cy = canvas.height-20 - y*4;
            ctx.beginPath(); ctx.fillStyle='#ffd54d'; ctx.arc(cx,cy,8,0,Math.PI*2); ctx.fill();
            if(cy>canvas.height-30) launched=false;
        }
        requestAnimationFrame(draw);
    }
    draw();

    // Controls
    const controls = document.createElement('div'); controls.className='visualize-controls';
    controls.innerHTML = `
        <label>Speed: <input type="range" id="viz-speed" min="10" max="120" value="60"></label>
        <label>Angle: <input type="range" id="viz-angle" min="10" max="80" value="45"></label>
        <button id="viz-launch">Launch</button>
    `;
    mount.appendChild(controls);
    document.getElementById('viz-speed').addEventListener('input', (e)=> speed = +e.target.value);
    document.getElementById('viz-angle').addEventListener('input', (e)=> angle = +e.target.value);
    document.getElementById('viz-launch').addEventListener('click', ()=>{ launched=true; t0=performance.now(); });
});
