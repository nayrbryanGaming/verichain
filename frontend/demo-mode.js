// demo-mode.js — lightweight demo helper to create local verification entries without network
(function(){
  const demoBtn = document.getElementById('demoBtn');
  const verificationList = document.getElementById('verificationList');
  const statValues = document.querySelectorAll('.stat-value');
  const progressFill = document.querySelector('.progress-bar .fill');

  if (!demoBtn) return;

  let total = 0;
  const sources = new Set();

  function updateStats(){
    statValues[0].textContent = total;
    statValues[1].textContent = sources.size;
    const trust = Math.min(100, Math.floor((total*10)+(sources.size*5)));
    statValues[2].textContent = trust + '%';
  }

  function addDemoEntry(i){
    const card = document.createElement('div');
    card.className = 'timeline-item demo';
    const now = new Date();
    const hash = 'demohash'+(1000+i);
    const source = ['Trusted News','Community Post','Research Paper'][i%3];
    sources.add(source);
    card.innerHTML = `
      <div class="status-badge verified">Verified</div>
      <h4>demo_document_${i}.pdf</h4>
      <div class="record-details">
        <p><strong>Source:</strong> ${source}</p>
        <p><strong>Author:</strong> Demo Author</p>
        <p class="text-small">Hash: ${hash}</p>
        <p class="text-small">Verified on: ${now.toLocaleString()}</p>
      </div>
    `;
    verificationList.prepend(card);
    total++;
    updateStats();
  }

  demoBtn.addEventListener('click', async () => {
    // small animation
    progressFill.style.width = '20%';
    demoBtn.disabled = true;
    demoBtn.textContent = 'Preparing demo...';

    await new Promise(r => setTimeout(r, 400));
    progressFill.style.width = '60%';

    // create 3 demo entries
    for (let i=1;i<=3;i++){
      await new Promise(r => setTimeout(r, 300));
      addDemoEntry(i);
      progressFill.style.width = (60 + i*10) + '%';
    }

    progressFill.style.width = '100%';
    demoBtn.textContent = 'Demo Mode (ready)';
    setTimeout(()=>{
      progressFill.style.width = '0%';
      demoBtn.disabled = false;
      demoBtn.textContent = 'Demo Mode';
    }, 800);
  });
})();
