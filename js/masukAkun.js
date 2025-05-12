document.getElementById('logoutButton').addEventListener('click', async function () {
  const confirmLogout = await showConfirm("Kembali ke halaman utama?");
  
  if (confirmLogout) {
    window.location.href = 'index.html';
  }
});

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim(); 
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showToast('Semua field harus diisi!');
    return;
  }

  try {
    const response = await fetch('http://tibby-web-backend.vercel.app/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }) 
    });

    const result = await response.json();

    if (response.ok) {
      sessionStorage.setItem('loggedInUser', JSON.stringify(result.user));
      sessionStorage.setItem('token', result.token);
      sessionStorage.setItem('userId', result.user.id);
      sessionStorage.setItem('kelasAktif', result.user.usernameKelas); 
      showToast('Login berhasil! Redirecting...');
      setTimeout(() => {
        window.location.href = 'guru/beranda.html';
      }, 2000);
    } else {
      showToast(result.message || 'Username atau password salah!');
    }
  } catch (error) {
    console.error('Error saat mengirim data:', error);
    showToast('Gagal menghubungi server. Pastikan server aktif.');
  }
});

function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const msg = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');

    msg.innerText = message;
    modal.style.display = 'flex';

    yesBtn.onclick = () => {
      modal.style.display = 'none';
      resolve(true);
    };

    noBtn.onclick = () => {
      modal.style.display = 'none';
      resolve(false);
    };
  });
}

function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmMessage').innerText = message;
    modal.style.display = 'flex';

    document.getElementById('confirmYes').onclick = () => {
      modal.style.display = 'none';
      resolve(true);
    };
    document.getElementById('confirmNo').onclick = () => {
      modal.style.display = 'none';
      resolve(false);
    };
  });
}


function showToast(message) {
  const container = document.getElementById('toast-container');
  
  container.innerHTML = '';

  const toast = document.createElement('div');
  
  toast.innerText = message;
  toast.style.background = '#454545';
  toast.style.color = '#fff';
  toast.style.padding = '15px 30px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  toast.style.transform = 'translateY(-20px)';
  toast.style.textAlign = 'center';
  toast.style.maxWidth = '80vw';

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 100);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      container.removeChild(toast);
    }, 500);
  }, 3000);
}

function togglePassword(inputId, iconWrapper) {
  const input = document.getElementById(inputId);
  const img = iconWrapper.querySelector('img');

  if (input.type === 'password') {
    input.type = 'text';
    img.src = 'assets/eye (1).png'; 
  } else {
    input.type = 'password';
    img.src = 'assets/hidden.png'; 
  }
}
