// NOVA Mentor (mocked Explain prototype)
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('nli-open-btn');
    const panel = document.getElementById('nli-panel');
    const closeBtn = document.getElementById('nli-close');
    const styles = Array.from(document.querySelectorAll('.nli-style'));
    const form = document.getElementById('nli-form');
    const output = document.getElementById('nli-output');
    const sampleBtn = document.getElementById('nli-sample');

    const callExplainAPI = async ({topic, level, style}) => {
        const start = performance.now();
        try {
            const resp = await fetch('/api/nli/explain', {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ topic, level, style })
            });
            const duration = Math.round(performance.now() - start);
            if (!resp.ok) throw new Error('API error');
            const data = await resp.json();
            data._timing = { ms: duration };
            return data;
        } catch (err) {
            console.warn('Backend call failed, falling back to local mock', err);
            const mock = await mockExplain({ topic, level, style });
            mock._timing = { ms: Math.round(performance.now() - start) };
            return mock;
        }
    };

    const mockExplain = async ({topic, level, style}) => {
        await new Promise(r=>setTimeout(r, 540));
        return {
            topic,
            level,
            style,
            definition: `${topic}: A concise definition tailored for ${level}.`,
            analogy: `Imagine ${topic} like a flowing river... (analogy adapted to ${level})`,
            simulation: { type:'link', url:'#', hint:'Interactive simulation (drag charges to see forces)' },
            commonMistakes: ['Mixing vector directions', 'Forgetting sign conventions'],
            memoryTrick: 'Use the phrase "See Force Vectors"',
            pyq: { question: `A simple PYQ about ${topic}`, solution: 'Short worked solution.' },
            miniQuiz: [
                {id:1, stem:`Basic question on ${topic}`, choices:['A','B','C','D'], answer:1, rationale:'Because...'},
                {id:2, stem:`Apply concept of ${topic}`, choices:['1','2','3','4'], answer:0, rationale:'Check sign.'}
            ],
            recommendation: 'Next: Related Topic — try Projectile Motion (15-30 mins)'
        };
    };

    const renderExplain = (data) => {
        output.innerHTML = '';
        // show meta (timing / tokens)
        const meta = document.createElement('div'); meta.className = 'nli-meta';
        const time = data._timing?.ms ? `${data._timing.ms} ms` : '';
        const tokens = data._usage ? `tokens: ${data._usage.total_tokens || '-'} ` : '';
        meta.textContent = `Processed — ${time} ${tokens}`.trim();
        output.appendChild(meta);
        const def = document.createElement('div'); def.className='nli-block'; def.innerHTML = `<h3>Definition</h3><p>${data.definition}</p>`;
        const ana = document.createElement('div'); ana.className='nli-block'; ana.innerHTML = `<h3>Analogy</h3><p>${data.analogy}</p>`;
        const sim = document.createElement('div'); sim.className='nli-block'; sim.innerHTML = `<h3>Simulation</h3><p><a href="${data.simulation.url}">${data.simulation.hint}</a></p>`;
        const cm = document.createElement('div'); cm.className='nli-block'; cm.innerHTML = `<h3>Common mistakes</h3><p>${data.commonMistakes.join('; ')}</p>`;
        const mem = document.createElement('div'); mem.className='nli-block'; mem.innerHTML = `<h3>Memory trick</h3><p>${data.memoryTrick}</p>`;
        const pyq = document.createElement('div'); pyq.className='nli-block'; pyq.innerHTML = `<h3>PYQ</h3><p>${data.pyq.question}</p><details><summary>Solution</summary><p>${data.pyq.solution}</p></details>`;
        const quiz = document.createElement('div'); quiz.className='nli-block'; quiz.innerHTML = '<h3>Mini-quiz</h3>';
        const quizList = document.createElement('div'); quizList.className='nli-quiz';
        data.miniQuiz.forEach(q=>{
            const qEl = document.createElement('div'); qEl.className='choice'; qEl.tabIndex=0; qEl.textContent = q.stem + ' — ' + q.choices.join(' / ');
            qEl.addEventListener('click', ()=>{
                // simple grading demo: mark first as correct
                qEl.classList.add(q.answer===0? 'correct':'wrong');
            });
            quizList.appendChild(qEl);
        });
        quiz.appendChild(quizList);
        const rec = document.createElement('div'); rec.className='nli-block'; rec.innerHTML = `<h3>Recommendation</h3><p>${data.recommendation}</p>`;

        output.appendChild(def); output.appendChild(ana); output.appendChild(sim); output.appendChild(cm); output.appendChild(mem); output.appendChild(pyq); output.appendChild(quiz); output.appendChild(rec);

        // If server returned raw content (model failed), show toggle to view raw
        if (data._raw) {
            const rawBlock = document.createElement('details');
            rawBlock.className = 'nli-block';
            rawBlock.innerHTML = `<summary>Raw model output</summary><pre style="white-space:pre-wrap;">${escapeHtml(data._raw)}</pre>`;
            output.appendChild(rawBlock);
        }
    };

    function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    openBtn.addEventListener('click', () => {
        panel.classList.add('open'); panel.setAttribute('aria-hidden','false');
    });
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('open'); panel.setAttribute('aria-hidden','true');
    });

    styles.forEach(s=>s.addEventListener('click', (e)=>{ styles.forEach(x=>x.classList.remove('active')); e.currentTarget.classList.add('active'); }));

    form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const topic = document.getElementById('nli-query').value.trim() || 'Topic';
        const level = document.getElementById('nli-level').value;
        const styleEl = document.querySelector('.nli-style.active');
        const style = styleEl ? styleEl.dataset.style : 'Conceptual';
        output.innerHTML = '<div class="nli-block">Thinking... NOVA Mentor is preparing a personalized explanation.</div>';
        const res = await callExplainAPI({topic, level, style});
        renderExplain(res);
    });

    sampleBtn.addEventListener('click', async ()=>{
        document.getElementById('nli-query').value = 'Electric Field';
        form.dispatchEvent(new Event('submit'));
    });
});
