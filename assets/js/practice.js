// Simple Practice prototype: shows a question and grades answer
document.addEventListener('DOMContentLoaded', ()=>{
    const mount = document.getElementById('practice-mount');
    if(!mount) return;
    const q = { id: 'p1', stem: 'A block is thrown horizontally from a table. Which quantity is conserved?', choices:['Kinetic energy','Momentum','Angular momentum','Potential energy'], answer:1 };
    const card = document.createElement('div'); card.className='nli-block';
    card.innerHTML = `<p><strong>${q.stem}</strong></p>`;
    q.choices.forEach((c,i)=>{
        const btn = document.createElement('button'); btn.className='choice'; btn.textContent = c; btn.style.display='block'; btn.style.margin='6px 0';
        btn.addEventListener('click', ()=>{
            if(i===q.answer) { btn.style.background='rgba(34,197,94,0.08)'; alert('Correct!'); }
            else { btn.style.background='rgba(239,68,68,0.06)'; alert('Try again — think about isolated horizontal direction'); }
        });
        card.appendChild(btn);
    });
    mount.appendChild(card);
    // Upload problem form
    const upload = document.createElement('div'); upload.className='nli-block';
    upload.innerHTML = `
        <h4>Upload problem (image or text)</h4>
        <input type="file" id="problem-file" accept="image/*" />
        <textarea id="problem-text" rows="2" placeholder="Or paste problem text"></textarea>
        <button id="problem-submit" class="primary-btn">Submit to Solver</button>
        <div id="solver-result" style="margin-top:8px;"></div>
    `;
    mount.appendChild(upload);
    document.getElementById('problem-submit').addEventListener('click', async ()=>{
        const file = document.getElementById('problem-file').files[0];
        const text = document.getElementById('problem-text').value.trim();
        const resultEl = document.getElementById('solver-result'); resultEl.textContent='Processing...';
        if(file){
            const fr = new FileReader();
            fr.onload = async ()=>{
                const base64 = fr.result.split(',')[1];
                const resp = await fetch('/api/solver/solve',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({ image: base64 })});
                const j = await resp.json(); resultEl.textContent = j.solution || JSON.stringify(j);
            };
            fr.readAsDataURL(file);
            return;
        }
        if(text){
            const resp = await fetch('/api/solver/solve',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({ text })});
            const j = await resp.json(); resultEl.textContent = j.solution || JSON.stringify(j);
            // store attempt
            const attempts = JSON.parse(localStorage.getItem('practiceAttempts')||'{}');
            attempts[text||'image'] = (attempts[text||'image']||0)+1; localStorage.setItem('practiceAttempts', JSON.stringify(attempts));
        }
    });
});
