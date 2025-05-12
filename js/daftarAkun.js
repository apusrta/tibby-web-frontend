document.getElementById('logoutButton').addEventListener('click', async function () {
  const confirmLogout = await showConfirm("Kembali ke halaman utama?");
  
  if (confirmLogout) {
    window.location.href = 'index.html';
  }
}); 

document.querySelector('.btn-primary').addEventListener('click', async function () {
  const nama = document.getElementById('namaLengkap').value.trim();
  const username = document.getElementById('username').value.trim();
  const gender = document.getElementById('gender').value;
  const tanggalLahir = document.getElementById('tanggalLahir').value;
  const password = document.getElementById('password').value;
  const usernameKelas = document.getElementById('usernameKelas').value.trim();
  const passwordKelas = document.getElementById('passwordKelas').value;

  if (!nama || !username || !gender || !tanggalLahir || !password || !usernameKelas || !passwordKelas) {
    showToast('Semua field harus diisi!');
    return; 
  }

  if (!isValidUsername(username)) {
    showToast('Username tidak valid. Gunakan 4–20 karakter: huruf, angka, titik, atau underscore.');
    return;
  }

  if (!isValidPassword(password)) {
    showToast('Password harus minimal 8 karakter dan mengandung huruf dan angka.');
    return;
  }

  if (!/^\d{6}$/.test(passwordKelas)) {
    showToast('Password kelas harus terdiri dari tepat 6 angka.');
    return;
  }

  try {
    const response = await fetch('https://tibby-web-backend.vercel.app/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nama,
        username,
        gender,
        tanggalLahir,
        password,
        usernameKelas,
        passwordKelas
      })
    });

    const result = await response.json();

    if (response.ok) {
      showToast('Akun berhasil dibuat! Silakan login.');
      setTimeout(() => {
        window.location.href = 'masukAkun.html';
      }, 2000);
    } else {
      showToast(result.message || 'Terjadi kesalahan saat mendaftar.');
    }
  } catch (error) {
    console.error('Error saat mengirim data:', error);
    showToast('Gagal menghubungi server. Pastikan server aktif.');
  }
});

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

function isValidUsername(username) {
  const validChars = /^[a-zA-Z0-9._]{4,20}$/;
  if (!validChars.test(username)) return false;
  if (/^[_\.]|[_\.]$/.test(username)) return false;
  if (/[\._]{2,}/.test(username)) return false;
  return true;
}

function isValidPassword(password) {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  return hasLetter && hasDigit;
}

function showInputWarning(inputId, warningId) {
  const input = document.getElementById(inputId);
  const warning = document.getElementById(warningId);

  input.addEventListener('input', () => {
    if (input.value.trim() !== '') {
      warning.style.display = 'block';
    } else {
      warning.style.display = 'none';
    }
  });

  input.addEventListener('blur', () => {
    warning.style.display = 'none';
  });
}

showInputWarning('password', 'warn-password');
showInputWarning('passwordKelas', 'warn-passwordKelas');
