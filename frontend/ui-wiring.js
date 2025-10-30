// ui-wiring.js - lightweight wiring for quick actions and showing reports in result panel
(function(){
  function safe(id){ return document.getElementById(id); }

  function showVerificationResult({title, status, source, date, summary, realityCheck, link}){
    const area = safe('verificationStatusArea');
    const orig = safe('originalSource');
    const reality = safe('realityCheck');
    const refs = safe('references');
    const time = safe('verificationTime');

    if(!area || !orig) return;

    area.style.display = 'block';
    area.className = 'verification-status alert ' + (status === 'FACT' || status === 'VERIFIED' ? 'alert-success' : 'alert-danger');
    area.innerHTML = `<strong>${status}</strong> — ${title}`;

    orig.innerHTML = `<div><strong>${source}</strong> — <small class="text-muted">${date}</small></div><div class="mt-1 small">${summary}</div>`;
    reality.innerHTML = realityCheck || '';
    refs.innerHTML = link ? `<a href="${link}" target="_blank">View official report</a>` : '';
    time.textContent = new Date().toLocaleString();

    // Scroll into view on small screens
    area.scrollIntoView({behavior: 'smooth', block: 'center'});
  }

  function cardToReport(card){
    try{
      const title = card.querySelector('.card-title').textContent.trim();
      const badge = card.querySelector('.badge');
      const status = badge ? badge.textContent.trim() : 'UNKNOWN';
      const sub = card.querySelector('.card-subtitle') ? card.querySelector('.card-subtitle').textContent.trim() : '';
      const sourceMatch = sub.match(/^\s*(.*?)\s*—\s*(.*)$/s);
      let source = sub, date = '';
      if(sourceMatch){ source = sourceMatch[1].trim(); date = sourceMatch[2].trim(); }
      const summary = card.querySelector('.card-text') ? card.querySelector('.card-text').textContent.trim() : '';
      const reality = card.querySelector('.alert') ? card.querySelector('.alert').textContent.trim() : '';
      const link = card.querySelector('a') ? card.querySelector('a').href : '';
      return {title, status, source, date, summary, realityCheck: reality, link};
    }catch(e){ return null; }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    // Quick action: file -> open file dialog
    const quickFile = safe('quickVerifyFile');
    const fileInput = safe('fileInput');
    if(quickFile && fileInput){ quickFile.addEventListener('click', ()=> fileInput.click()); }

    // Quick demo hook
    const quickDemo = safe('quickDemo');
    if(quickDemo){ quickDemo.addEventListener('click', ()=>{ const d = safe('demoBtn'); d && d.click(); }); }

    // Quick Verify Text / URL - perform a simple local search against rendered verified reports
    const quickVerifyText = safe('quickVerifyText');
    const quickVerifyUrl = safe('quickVerifyUrl');
    const rumorInput = safe('rumorInput');
    const urlInput = safe('urlInput');

    function normalizeText(s){
      return (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ').trim();
    }

    // Exact-match search: only return report when normalized text exactly equals title or summary
    function searchReports(q){
      if(!q) return null;
      const container = document.getElementById('verifiedReports');
      if(!container) return null;
      const cards = container.querySelectorAll('.card');
      const nq = normalizeText(q);
      for(const c of cards){
        const title = c.querySelector('.card-title') ? normalizeText(c.querySelector('.card-title').textContent) : '';
        const summary = c.querySelector('.card-text') ? normalizeText(c.querySelector('.card-text').textContent) : '';
        if(nq && (nq === title || nq === summary)) return cardToReport(c);
      }
      return null;
    }

    if(quickVerifyText && rumorInput){
      quickVerifyText.addEventListener('click', ()=>{
        const q = rumorInput.value.trim();
        if(!q){ rumorInput.focus(); return; }
        const r = searchReports(q);
        if(r) showVerificationResult(Object.assign(r,{status:'FACT'}));
        else {
          showVerificationResult({title: q, status: 'FALSE', source: 'Local DB', date: '-', summary: 'No exact match found in fact database.', realityCheck: 'This claim does not match any verified report.', link: ''});
        }
      });

      // Real-time (debounced) verification as user types
      let textTimer = null;
      rumorInput.addEventListener('input', ()=>{
        clearTimeout(textTimer);
        textTimer = setTimeout(()=>{
          const q = rumorInput.value.trim();
          if(!q) return;
          const r = searchReports(q);
          if(r) showVerificationResult(Object.assign(r,{status:'FACT'}));
          else showVerificationResult({title: q, status: 'FALSE', source: 'Local DB', date: '-', summary: 'No exact match found in fact database.', realityCheck: 'This claim does not match any verified report.', link: ''});
        }, 300);
      });
    }

    if(quickVerifyUrl && urlInput){
      quickVerifyUrl.addEventListener('click', ()=>{
        const q = urlInput.value.trim();
        if(!q){ urlInput.focus(); return; }
        const r = searchReports(q);
        if(r) showVerificationResult(Object.assign(r,{status:'FACT'}));
        else showVerificationResult({title: q, status: 'FALSE', source: 'Local DB', date: '-', summary: 'No exact match found for this URL in fact DB.', realityCheck: 'This link does not match any verified report.', link: q});
      });

      // Real-time verification for URL field
      let urlTimer = null;
      urlInput.addEventListener('input', ()=>{
        clearTimeout(urlTimer);
        urlTimer = setTimeout(()=>{
          const q = urlInput.value.trim();
          if(!q) return;
          const r = searchReports(q);
          if(r) showVerificationResult(Object.assign(r,{status:'FACT'}));
          else showVerificationResult({title: q, status: 'FALSE', source: 'Local DB', date: '-', summary: 'No exact match found for this URL in fact DB.', realityCheck: 'This link does not match any verified report.', link: q});
        }, 300);
      });
    }

    // DB search buttons - search reports and if multiple matches show a simple list in the result
    const quickDbBtn = safe('quickDbBtn');
    const quickDbSearch = safe('quickDbSearch');
    const dbSearchBtn = safe('dbSearchBtn');
    const dbSearchInput = safe('dbSearchInput');

    function doDbSearch(q){
      const container = document.getElementById('verifiedReports');
      if(!container) return null;
      const cards = container.querySelectorAll('.card');
      const matches = [];
      const tq = q.toLowerCase();
      cards.forEach(c=>{
        const text = c.textContent.toLowerCase();
        if(text.includes(tq)) matches.push(cardToReport(c));
      });
      return matches;
    }

    if(quickDbBtn && quickDbSearch){
      quickDbBtn.addEventListener('click', ()=>{
        const q = quickDbSearch.value.trim();
        if(!q) { quickDbSearch.focus(); return; }
        const m = doDbSearch(q);
        if(m && m.length){
          // show top match
          showVerificationResult(m[0]);
        } else {
          showVerificationResult({title: q, status: 'UNKNOWN', source: 'Local DB', date: '-', summary: 'No matches found.', realityCheck: 'Try broader keywords.', link: ''});
        }
      });
    }

    if(dbSearchBtn && dbSearchInput){
      dbSearchBtn.addEventListener('click', ()=>{
        const q = dbSearchInput.value.trim();
        if(!q) { dbSearchInput.focus(); return; }
        const m = doDbSearch(q);
        if(m && m.length) showVerificationResult(m[0]); else showVerificationResult({title: q, status: 'UNKNOWN', source: 'Local DB', date: '-', summary: 'No matches found.', realityCheck: 'Try different keywords.', link: ''});
      });
    }

    // Also wire the primary Verify buttons (non-quick) to use the same exact-match logic
    const verifyTextBtn = safe('verifyTextBtn');
    const verifyUrlBtn = safe('verifyUrlBtn');
    if(verifyTextBtn && rumorInput){
      verifyTextBtn.addEventListener('click', ()=>{
        const q = rumorInput.value.trim();
        if(!q) { rumorInput.focus(); return; }
        const r = searchReports(q);
        if(r) showVerificationResult(Object.assign(r,{status:'FACT'}));
        else showVerificationResult({title: q, status: 'FALSE', source: 'Local DB', date: '-', summary: 'No exact match found in fact database.', realityCheck: 'This claim does not match any verified report.', link: ''});
      });
    }
    if(verifyUrlBtn && urlInput){
      verifyUrlBtn.addEventListener('click', ()=>{
        const q = urlInput.value.trim();
        if(!q) { urlInput.focus(); return; }
        const r = searchReports(q);
        if(r) showVerificationResult(Object.assign(r,{status:'FACT'}));
        else showVerificationResult({title: q, status: 'FALSE', source: 'Local DB', date: '-', summary: 'No exact match found for this URL in fact DB.', realityCheck: 'This link does not match any verified report.', link: q});
      });
    }

    // Clicking on verified report cards should fill the result pane
    const reportsContainer = document.getElementById('verifiedReports');
    if(reportsContainer){
      // use event delegation
      reportsContainer.addEventListener('click', (e)=>{
        let node = e.target;
        // climb to .card if clicked inside
        while(node && node !== reportsContainer){
          if(node.classList && node.classList.contains('card')){
            const r = cardToReport(node);
            if(r) showVerificationResult(r);
            break;
          }
          node = node.parentNode;
        }
      });
    }

  });
})();
