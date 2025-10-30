// trusted-reports.js — sample verified hoax reports (Kominfo/Komdigi) for demo
(function(){
  const reports = [
    {
      id: 'kominfo-001',
      title: 'Hoax: Free phone giveaway by Government',
      date: '2025-03-12',
      source: 'Kominfo',
      status: 'HOAX',
      summary: 'Claim that the government distributes free phones via a viral post. Official check: false. Do not click links.',
      realityCheck: 'No such program exists. Government programs are announced through official channels only.',
      link: 'https://kominfo.go.id/check/001'
    },
    {
      id: 'komdigi-002',
      title: 'False: COVID-19 vaccine alters DNA',
      date: '2024-11-02',
      source: 'Komdigi',
      status: 'HOAX',
      summary: 'Misinformation that vaccines alter genetics debunked by health authorities.',
      realityCheck: 'mRNA vaccines do not enter the nucleus where DNA is stored. This is scientifically impossible.',
      link: 'https://komdigi.id/fact-check/002'
    },
    {
      id: 'fact-001',
      title: 'Fact: New Digital ID System Launch',
      date: '2025-02-15',
      source: 'Kominfo',
      status: 'FACT',
      summary: 'Indonesia launches new digital ID system for enhanced security.',
      realityCheck: 'Verified from official government announcement and implementation program.',
      link: 'https://kominfo.go.id/news/digital-id'
    },
    {
      id: 'kominfo-003',
      title: 'Fake: Bank transfer refund scam',
      date: '2025-01-08',
      source: 'Kominfo',
      status: 'HOAX',
      summary: 'Post claims banks will refund automatic transfers; this is a phishing attempt.',
      realityCheck: 'Banks never request personal information or transfers through WhatsApp or SMS.',
      link: 'https://kominfo.go.id/check/003'
    },
    {
      id: 'fact-002',
      title: 'Fact: Digital Literacy Program Success',
      date: '2025-03-01',
      source: 'Komdigi',
      status: 'FACT',
      summary: 'National digital literacy program reaches 10 million citizens.',
      realityCheck: 'Verified through official program statistics and independent assessment.',
      link: 'https://komdigi.id/news/literacy-milestone'
    },
    {
      id: 'hoax-004',
      title: 'Hoax: Viral Investment App Scam',
      date: '2025-03-20',
      source: 'Kominfo',
      status: 'HOAX',
      summary: 'Investment app claiming 100% returns in 1 week identified as scam.',
      realityCheck: 'App is not registered with OJK. High return promises are typical scam indicators.',
      link: 'https://kominfo.go.id/check/004'
    }
  ];

  function renderReports(){
    const container = document.getElementById('verifiedReports');
    if(!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Sort reports by date (newest first)
    const sortedReports = [...reports].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedReports.forEach(r => {
      const col = document.createElement('div');
      col.className = 'col-12 mb-3';
      col.innerHTML = `
        <div class="card h-100 ${r.status === 'FACT' ? 'border-success' : 'border-danger'}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">${r.title}</h5>
              <span class="badge ${r.status === 'FACT' ? 'bg-success' : 'bg-danger'}">${r.status}</span>
            </div>
            <h6 class="card-subtitle mb-2 text-muted">
              <small>
                ${r.source} — ${new Date(r.date).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </small>
            </h6>
            <p class="card-text">${r.summary}</p>
            <div class="alert ${r.status === 'FACT' ? 'alert-success' : 'alert-danger'} mb-3">
              <small>
                <strong>${r.status === 'FACT' ? '✓ Verification:' : '⚠️ Reality Check:'}</strong><br>
                ${r.realityCheck}
              </small>
            </div>
            <a href="${r.link}" target="_blank" class="btn btn-sm ${r.status === 'FACT' ? 'btn-outline-success' : 'btn-outline-danger'}">
              View Official Report
            </a>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  }

  document.addEventListener('DOMContentLoaded', renderReports);
})();
