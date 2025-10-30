// admin.js — lightweight admin dashboard for demo
(function(){
  const connectBtn = document.getElementById('connectWalletAdmin');
  const adminAddress = document.getElementById('adminAddress');
  const adminAlert = document.getElementById('adminAlert');
  const reportsTableBody = document.querySelector('#reportsTable tbody');
  const statTotal = document.getElementById('statTotal');
  const statSources = document.getElementById('statSources');
  const statTrust = document.getElementById('statTrust');

  let wallet = null;

  async function connect() {
    if(window.ethereum){
      try{
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        wallet = accounts[0];
        adminAddress.textContent = wallet;
        adminAlert.classList.add('d-none');
        loadData();
      }catch(e){
        console.error(e);
      }
    } else {
      alert('No injected wallet found. For demo, connect any wallet or use Demo Mode from main app.');
    }
  }

  connectBtn.addEventListener('click', connect);

  // Load news and reports (from trusted-reports.js and news-feed.js) if available
  function loadData(){
    // Collect reports from DOM (rendered by trusted-reports.js)
    const reportsContainer = document.getElementById('verifiedReports');
    const rows = [];
    if(reportsContainer){
      const cards = reportsContainer.querySelectorAll('.card');
      cards.forEach(c=>{
        const title = c.querySelector('.card-title') ? c.querySelector('.card-title').textContent.trim() : '';
        const badge = c.querySelector('.badge') ? c.querySelector('.badge').textContent.trim() : '';
        const subtitle = c.querySelector('.card-subtitle') ? c.querySelector('.card-subtitle').textContent.trim() : '';
        const link = c.querySelector('a') ? c.querySelector('a').href : '';
        rows.push({ title, status: badge, subtitle, link });
      });
    }

    renderTable(rows);
    updateStats(rows.length, rows.length>0?rows.length:0, '0%');
    renderChart(rows.length);
  }

  function renderTable(rows){
    reportsTableBody.innerHTML = '';
    rows.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td style="max-width:220px">${r.title}</td><td>${r.subtitle.split('—')[0]||''}</td><td>${r.subtitle.split('—')[1]||''}</td><td>${r.status||'N/A'}</td><td><button class="btn btn-sm btn-success btn-accept">Mark Fact</button> <button class="btn btn-sm btn-danger btn-reject">Mark Hoax</button></td>`;
      reportsTableBody.appendChild(tr);
    });

    // Attach event listeners
    reportsTableBody.querySelectorAll('.btn-accept').forEach(b=> b.addEventListener('click', (e)=>{
      const row = e.target.closest('tr');
      row.cells[3].textContent = 'FACT';
    }));
    reportsTableBody.querySelectorAll('.btn-reject').forEach(b=> b.addEventListener('click', (e)=>{
      const row = e.target.closest('tr');
      row.cells[3].textContent = 'HOAX';
    }));
  }

  function updateStats(total, sources, trust){
    statTotal.textContent = total;
    statSources.textContent = sources;
    statTrust.textContent = trust;
  }

  function renderChart(total){
    const ctx = document.getElementById('chartVerifications');
    if(!ctx) return;
    const labels = Array.from({length:7}).map((_,i)=>`-${6-i}d`);
    const data = { labels, datasets: [{ label: 'Verifications', data: Array.from({length:7}).map(()=>Math.floor(Math.random()*5)), backgroundColor: 'rgba(61,211,255,0.12)', borderColor: 'rgba(61,211,255,0.6)', tension:0.4 }] };
    new Chart(ctx, { type: 'line', data, options: { responsive:true, maintainAspectRatio:false } });
  }

  // Refresh button
  const refreshBtn = document.getElementById('refreshData');
  refreshBtn && refreshBtn.addEventListener('click', ()=> loadData());

  // Auto-load if wallet already connected
  document.addEventListener('DOMContentLoaded', ()=>{
    if(window.ethereum){
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts=>{
        if(accounts && accounts.length){
          wallet = accounts[0];
          adminAddress.textContent = wallet;
          adminAlert.classList.add('d-none');
          loadData();
        } else {
          adminAlert.classList.remove('d-none');
        }
      }).catch(()=> adminAlert.classList.remove('d-none'));
    } else {
      adminAlert.classList.remove('d-none');
    }
  });

})();
