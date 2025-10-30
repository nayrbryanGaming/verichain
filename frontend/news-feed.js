// news-feed.js - Latest news feed data and rendering
(function(){
  // Expanded news sample set (image, link, text) for demo and testing
  const newsItems = [
    { id: 'news-001', title: 'Government Launches Digital Economy Initiative', summary: 'New program aims to boost digital transformation across industries', source: 'Ministry of Communication', category: 'verified', date: '2025-10-30', status: 'VERIFIED', url: '#', type: 'link' },
    { id: 'news-002', title: 'Tech Investment in Education Sector Grows', summary: 'Major increase in EdTech funding reported across the region', source: 'Tech Industry News', category: 'trending', date: '2025-10-29', status: 'PENDING', url: '#', type: 'text' },
    { id: 'news-003', title: 'Cybersecurity Alert: New Phishing Campaign', summary: 'Officials warn of sophisticated email scam targeting businesses', source: 'Cyber Security Agency', category: 'verified', date: '2025-10-28', status: 'WARNING', url: '#', type: 'text' },
    { id: 'news-004', title: 'Digital Payment Usage Hits Record High', summary: 'Mobile payments see 200% growth in rural areas', source: 'Financial Times', category: 'trending', date: '2025-10-27', status: 'VERIFIED', url: '#', type: 'image', image: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=800&q=60' },
    { id: 'news-005', title: 'AI Development Guidelines Released', summary: 'New framework for responsible AI development announced', source: 'Tech Ministry', category: 'verified', date: '2025-10-26', status: 'VERIFIED', url: '#', type: 'link' },
    { id: 'news-006', title: 'Rumor: Free Data Voucher for Users', summary: 'Social media post claims telco giving free data; unclear source', source: 'Social Post', category: 'trending', date: '2025-10-25', status: 'PENDING', url: '#', type: 'text' },
    { id: 'news-007', title: 'Fact: Digital ID Pilot Completed', summary: 'Pilot completed successfully with privacy safeguards', source: 'Kominfo', category: 'verified', date: '2025-10-24', status: 'VERIFIED', url: '#', type: 'link' },
    { id: 'news-008', title: 'Scam Alert: Fake Investment App', summary: 'Users reported losing funds to a cloned app', source: 'Consumer Watch', category: 'trending', date: '2025-10-23', status: 'WARNING', url: '#', type: 'image', image: 'https://images.unsplash.com/photo-1581091870622-3e7e1b2f9d7d?w=800&q=60' },
    { id: 'news-009', title: 'Local Startup Raises Series A', summary: 'Startup announces funding to expand regional services', source: 'TechCrunch', category: 'trending', date: '2025-10-22', status: 'VERIFIED', url: '#', type: 'link' },
    { id: 'news-010', title: 'Misinformation: Miracle Cure Shared Widely', summary: 'Health officials debunk claims of miracle cure', source: 'Health Agency', category: 'verified', date: '2025-10-21', status: 'HOAX', url: '#', type: 'text' },
    // additional items for volume
    { id: 'news-011', title: 'Community Event: Digital Literacy Workshop', summary: 'Free workshops in several cities', source: 'Local NGO', category: 'trending', date: '2025-10-20', status: 'VERIFIED', url: '#', type: 'link' },
    { id: 'news-012', title: 'Rumor: Bank Holiday Next Week', summary: 'Unconfirmed claims of a sudden bank holiday', source: 'WhatsApp Forward', category: 'trending', date: '2025-10-19', status: 'PENDING', url: '#', type: 'text' },
    { id: 'news-013', title: 'Fact: New Cybersecurity Grants Available', summary: 'Government releases funds to support SMEs', source: 'Gov Portal', category: 'verified', date: '2025-10-18', status: 'VERIFIED', url: '#', type: 'link' },
    { id: 'news-014', title: 'Viral Image: Miscaptioned Photo', summary: 'Image being shared with misleading caption', source: 'Social Media', category: 'verified', date: '2025-10-17', status: 'HOAX', url: '#', type: 'image', image: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800&q=60' },
    { id: 'news-015', title: 'Research: AI in Healthcare', summary: 'New study shows promising results', source: 'Medical Journal', category: 'verified', date: '2025-10-16', status: 'VERIFIED', url: '#', type: 'link' },
    { id: 'news-016', title: 'Alert: Fake Job Offers Circulating', summary: 'Scam job postings asking for fees', source: 'Employment Agency', category: 'trending', date: '2025-10-15', status: 'WARNING', url: '#', type: 'text' },
    { id: 'news-017', title: 'Opinion: Tech Policy Debate', summary: 'Experts debate next steps for regulation', source: 'Opinion Column', category: 'trending', date: '2025-10-14', status: 'PENDING', url: '#', type: 'text' },
    { id: 'news-018', title: 'Local Business Adopts Digital Payments', summary: 'Case study of small business', source: 'Local News', category: 'verified', date: '2025-10-13', status: 'VERIFIED', url: '#', type: 'link' },
    { id: 'news-019', title: 'Fake Video Shares Misleading Claims', summary: 'Video edited to misrepresent facts', source: 'Social Platform', category: 'trending', date: '2025-10-12', status: 'HOAX', url: '#', type: 'image', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60' },
    { id: 'news-020', title: 'National Broadband Expansion Update', summary: 'Infrastructure upgrades announced', source: 'Ministry of Transport', category: 'verified', date: '2025-10-11', status: 'VERIFIED', url: '#', type: 'link' }
  ];

  function renderNewsFeed() {
    const container = document.getElementById('newsFeed');
    if (!container) return;

    container.innerHTML = '';
    
    newsItems.forEach(item => {
      const statusClass = {
        'VERIFIED': 'text-success',
        'PENDING': 'text-warning',
        'WARNING': 'text-danger'
      }[item.status] || 'text-muted';

      const element = document.createElement('div');
      element.className = 'list-group-item';

      // Build HTML with optional image and link
      let mediaHtml = '';
      if (item.type === 'image' && item.image) {
        mediaHtml = `<div class="me-3" style="flex:0 0 90px;">
          <img src="${item.image}" alt="thumb" style="width:90px;height:60px;object-fit:cover;border-radius:6px;" />
        </div>`;
      }

      element.innerHTML = `
        <div class="d-flex w-100 mb-1">
          ${mediaHtml}
          <div style="flex:1 1 auto; min-width:0;">
            <div class="d-flex w-100 justify-content-between">
              <h6 class="mb-1 text-truncate">${item.title}</h6>
              <small class="${statusClass}">
                <i class="bi bi-${item.status === 'VERIFIED' ? 'check-circle' : item.status === 'WARNING' ? 'exclamation-triangle' : item.status === 'HOAX' ? 'x-circle' : 'clock'}"></i>
                ${item.status}
              </small>
            </div>
            <p class="mb-1 small text-truncate">${item.summary}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted"><i class="bi bi-building"></i> ${item.source}</small>
              <div>
                <small class="text-muted me-2">${new Date(item.date).toLocaleDateString('id-ID')}</small>
                ${item.url ? `<a href="${item.url}" target="_blank" class="small">Open</a>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
      container.appendChild(element);
    });
  }

  // Filter news by category
  function filterNews(category) {
    const filtered = category === 'all' 
      ? newsItems 
      : newsItems.filter(item => item.category === category);
    
    const container = document.getElementById('newsFeed');
    container.innerHTML = '';
    filtered.forEach(item => renderNewsItem(item, container));
  }

  // Add click handlers for filter buttons
  document.addEventListener('DOMContentLoaded', () => {
    renderNewsFeed();

    const filterButtons = document.querySelectorAll('[data-category]');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        e.target.classList.add('active');
        // Filter news
        filterNews(e.target.dataset.category);
      });
    });
  });
})();