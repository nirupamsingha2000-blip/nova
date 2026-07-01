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
});
