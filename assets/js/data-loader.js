// Load demo data and populate page elements
(async function(){
    try{
        const resp = await fetch('assets/data/demo.json');
        if(!resp.ok) return;
        const data = await resp.json();
        // Hero
        const heroTag = document.querySelector('.hero-tag');
        if(heroTag && data.hero?.tag) heroTag.textContent = data.hero.tag;
        const heroH1 = document.querySelector('.hero-content h1');
        if(heroH1 && data.hero?.title) heroH1.innerText = data.hero.title;
        const heroP = document.querySelector('.hero-content p');
        if(heroP && data.hero?.subtitle) heroP.textContent = data.hero.subtitle;
        const primaryBtn = document.querySelector('.hero-buttons .btn-primary');
        if(primaryBtn && data.hero?.ctaPrimary) primaryBtn.textContent = data.hero.ctaPrimary;
        const secondaryBtn = document.querySelector('.hero-buttons .btn-secondary');
        if(secondaryBtn && data.hero?.ctaSecondary) secondaryBtn.textContent = data.hero.ctaSecondary;

        // NLI sample label
        const sampleBtn = document.getElementById('nli-sample');
        if (sampleBtn && Array.isArray(data.nliSamples) && data.nliSamples.length) {
            sampleBtn.textContent = `Try sample: ${data.nliSamples[0]}`;
            sampleBtn.dataset.example = data.nliSamples[0];
        }

        // Basic stats (if present)
        const statsRoot = document.querySelector('.results-stats');
        if(statsRoot && Array.isArray(data.stats)){
            statsRoot.innerHTML = '';
            data.stats.forEach(s=>{
                const el = document.createElement('div'); el.className='stat-card';
                el.innerHTML = `<div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div>`;
                statsRoot.appendChild(el);
            });
        }

    }catch(e){ console.warn('Failed loading demo data', e); }
})();
