// profile.js — wallet/profile UI helper
(function(){
  const connectBtn = document.getElementById('connectWallet');
  const profileAddress = document.getElementById('profileAddress');
  const walletAddressSpan = document.getElementById('walletAddress');
  const copyBtn = document.getElementById('copyAddressBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const networkStatus = document.getElementById('networkStatus');
  const offlineToggle = document.getElementById('offlineToggle');
  const verifyBtn = document.getElementById('verifyBtn');

  // Utility
  function truncate(addr){
    if(!addr) return 'Not connected';
    return addr.substring(0,6) + '...' + addr.slice(-4);
  }

  function setAddress(addr){
    walletAddressSpan.textContent = addr ? truncate(addr) : 'No wallet connected';
    profileAddress.textContent = addr ? addr : 'Not connected';
    walletAddressSpan.dataset.full = addr || '';
    profileAddress.dataset.full = addr || '';
  }

  function setNetwork(chainId){
    if(!chainId){
      networkStatus.textContent = 'Network: unknown';
      return;
    }
    networkStatus.textContent = 'Network: ' + chainId;
  }

  async function connectWallet(){
    if(!window.ethereum){
      alert('No injected wallet detected. Use Demo Mode or install MetaMask.');
      return;
    }
    try{
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const addr = accounts[0];
      setAddress(addr);
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetwork(chainId);
    }catch(err){
      console.error('connect error', err);
    }
  }

  function disconnectWallet(){
    // Most injected wallets don't support programmatic disconnect; we clear UI only
    setAddress(null);
    setNetwork(null);
    // If the main app exposes a resetConnection helper, call it to clear provider/contract
    try{
      if(typeof window.resetConnection === 'function') window.resetConnection();
    }catch(e){ console.warn('resetConnection call failed', e); }
  }

  function copyAddress(){
    const full = profileAddress.dataset.full || walletAddressSpan.dataset.full;
    if(!full){
      navigator.clipboard.writeText('');
      return;
    }
    navigator.clipboard.writeText(full).then(()=>{
      copyBtn.textContent = 'Copied';
      setTimeout(()=> copyBtn.textContent = 'Copy',1200);
    }).catch(e=>console.error(e));
  }

  function setOfflineMode(on){
    if(verifyBtn) verifyBtn.disabled = on;
    // visually indicate
    if(on){
      networkStatus.textContent = (networkStatus.textContent||'Network: unknown') + ' (Offline)';
    } else {
      // strip " (Offline)"
      networkStatus.textContent = networkStatus.textContent.replace(' (Offline)','');
    }
  }

  // Auto bind
  if(connectBtn) connectBtn.addEventListener('click', connectWallet);
  if(copyBtn) copyBtn.addEventListener('click', copyAddress);
  if(disconnectBtn) disconnectBtn.addEventListener('click', disconnectWallet);
  if(offlineToggle) offlineToggle.addEventListener('change', e => setOfflineMode(e.target.checked));

  // If wallet already connected, show
  async function init(){
    if(window.ethereum){
      try{
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if(accounts && accounts.length) {
          setAddress(accounts[0]);
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setNetwork(chainId);
        }

        // Listen
        window.ethereum.on && window.ethereum.on('accountsChanged', (accounts)=>{
          if(accounts.length === 0) disconnectWallet(); else setAddress(accounts[0]);
        });
        window.ethereum.on && window.ethereum.on('chainChanged', (chainId)=>{
          setNetwork(chainId);
        });
      }catch(e){
        console.warn('profile init failed', e);
      }
    } else {
      // no provider — show demo placeholder
      setAddress(null);
      setNetwork(null);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
