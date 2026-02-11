const HASHES = [
  'ea1b9d779a37fa378d87c40dd6a56fcd491a7c9bef3a1f6e40228031bf00ac68',
  'b736100361ded8976e400f768df86e0b8a384ddaed59f07da9b4dbe9f56fa91b',
];
const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 Minutes

function protect() {
  const authOk = sessionStorage.getItem('auth_ok') === 'yes';
  const loginTime = sessionStorage.getItem('auth_time');
  const now = Date.now();

  if (authOk && loginTime && now - loginTime > TIMEOUT_DURATION) {
    sessionStorage.clear();
    location.reload();
    return;
  }

  if (authOk) return;

  window.stop();
  document.documentElement.innerHTML = '';

  const style = document.createElement('style');
  style.innerHTML = `
        body { margin: 0; padding: 0; background: #f0f2f5; font-family: 'Poppins', system-ui, -apple-system, sans-serif; }
        .wrapper { height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
        .card { 
            background: white; padding: 40px 30px; border-radius: 24px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.08); text-align: center; 
            width: 100%; max-width: 360px; transition: all 0.3s ease;
        }
        .icon-circle {
            width: 60px; height: 60px; background: #e0f7fa; color: #17a2b8; 
            border-radius: 50%; display: flex; align-items: center; 
            justify-content: center; margin: 0 auto 20px; font-size: 24px;
        }
        h3 { margin: 0 0 10px; color: #1a1a1a; font-weight: 600; font-size: 22px; }
        p { color: #666; font-size: 14px; margin-bottom: 25px; line-height: 1.5; }
        input { 
            width: 100%; padding: 14px; margin-bottom: 15px; border: 2px solid #eee; 
            border-radius: 12px; box-sizing: border-box; font-size: 16px; 
            outline: none; transition: border-color 0.2s;
        }
        input:focus { border-color: #17a2b8; }
        button { 
            width: 100%; padding: 14px; background: #17a2b8; color: white; 
            border: none; border-radius: 12px; cursor: pointer; 
            font-size: 16px; font-weight: 600; transition: transform 0.2s, background 0.2s;
        }
        button:active { transform: scale(0.98); background: #138496; }
        #err { color: #e63946; font-size: 13px; margin-top: 12px; min-height: 18px; }
    `;
  document.head.appendChild(style);

  const ui = document.createElement('div');
  ui.className = 'wrapper';
  ui.innerHTML = `
        <div class="card">
            <div class="icon-circle">🔒</div>
            <h3>Protected Access</h3>
            <p>Please enter your password to access this page.</p>
            <input type="password" id="pw" placeholder="Enter Password" autofocus>
            <button id="btn">Verify Identity</button>
            <p id="err"></p>
        </div>
    `;
  document.documentElement.appendChild(ui);

  const btn = ui.querySelector('#btn');
  const input = ui.querySelector('#pw');

  const verify = async () => {
    const val = input.value;
    if (!val) return;

    btn.innerText = 'Checking...';
    let hashHex = '';

    try {
      if (window.crypto && window.crypto.subtle) {
        const data = new TextEncoder().encode(val);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        hashHex = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      } else {
        // Fallback: This is tricky with multiple hashes.
        // If you are on GitHub Pages, you won't need this fallback.
        // But for local testing, it will try to hash the plain text 'password'
        hashHex = val;
      }

      // UPDATED LINE: Checks the array
      if (HASHES.includes(hashHex)) {
        sessionStorage.setItem('auth_ok', 'yes');
        sessionStorage.setItem('auth_time', Date.now());
        location.reload();
      } else {
        btn.innerText = 'Verify Identity';
        document.getElementById('err').innerText =
          'Incorrect password. Try again.';
        input.value = '';
        input.focus();
      }
    } catch (e) {
      document.getElementById('err').innerText =
        'System error. Please use HTTPS.';
    }
  };

  btn.onclick = verify;
  input.onkeypress = (e) => {
    if (e.key === 'Enter') verify();
  };
}
