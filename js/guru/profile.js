// --------------------------------------------
// Navigasi Sidebar Icon
// --------------------------------------------
const iconMinis = document.querySelectorAll('.iconMini');

iconMinis.forEach((iconDiv, index) => {
  const img = iconDiv.querySelector('img');

  switch (index) {
    case 0: 
      iconDiv.addEventListener('click', () => {
        window.location.href = "../guru/beranda.html";
      });
      break;
    case 1:
      iconDiv.addEventListener('click', () => {
        window.location.href = "../guru/peringkat.html";
      });
      break;
    case 2: 
      iconDiv.addEventListener('click', () => {
        window.location.href = "../guru/kelas.html";
      });
      break;
    case 3: 
      img.classList.add("active");
      break;
  }
});

// =============================================
// Fetch Data Profil Saat Load
// =============================================
const storedUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
const username = storedUser?.username;

fetch(`http://localhost:3000/api/users/guru?username=${username}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("namaGuru").textContent = data.nama;
    document.getElementById("genderGuru").textContent = data.gender;
    document.getElementById("tglLahirGuru").textContent = data.tanggalLahir?.split('T')[0] || "-";
    document.getElementById("namaAkunGuru").textContent = data.username || "-";         // Ganti usernameAkun -> username
    document.getElementById("namaKelasGuru").textContent = data.usernameKelas || "-";   // Sesuai model

    const fotoElem = document.getElementById("fotoProfil");
    if (fotoElem && data.foto) {
      fotoElem.src = `data:image/png;base64,${data.foto}`;
    } else {
      fotoElem.src = "../assets/user (3).png";
    }    
  })
  .catch(err => {
    console.error("Gagal mengambil data profil guru:", err);
  });

// =============================================
// Modal Konfirmasi Logout
// =============================================
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

document.getElementById("logoutBtn").addEventListener("click", async () => {
  const yakin = await showConfirm("Apakah kamu yakin ingin logout?");
  if (yakin) {
    window.location.href = "../index.html";
  }
});

// =============================================
// Modal Edit Profil
// =============================================
const editModal = document.getElementById("editModal");
const simpanBtn = document.getElementById("simpanEditBtn");
const batalBtn = document.getElementById("batalEditBtn");

document.getElementById("editProfileBtn").addEventListener("click", () => {
  fetch(`http://localhost:3000/api/users/guru?username=${username}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("editNama").value = data.nama || "";
      document.getElementById("editGender").value = data.gender || "";
      document.getElementById("editTanggal").value = data.tanggalLahir?.split('T')[0] || "";
      document.getElementById("editUsername").value = data.username || "";
      document.getElementById("editUsernameKelas").value = data.usernameKelas || "";
    });

  editModal.style.display = "flex";
});

batalBtn.addEventListener("click", () => {
  editModal.style.display = "none";
});

async function isUsernameAvailable(username, currentUserId) {
  const res = await fetch(`http://localhost:3000/api/users/check-username?username=${username}&excludeId=${currentUserId}`);
  const data = await res.json();
  return data.available;
}

simpanBtn.addEventListener("click", async () => {
  const nama = document.getElementById("editNama").value;
  const gender = document.getElementById("editGender").value;
  const tanggal = document.getElementById("editTanggal").value;
  const file = document.getElementById("editFoto").files[0];
  const usernameEdit = document.getElementById("editUsername").value;
  const usernameKelas = document.getElementById("editUsernameKelas").value;
  const storedUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
  const currentUserId = storedUser ? storedUser._id : null;

  if (!usernameEdit.trim()) {
    showToast("Username tidak boleh kosong!");
    return;
  }
  if (!usernameKelas.trim()) {
    showToast("Username kelas tidak boleh kosong!");
    return;
  }

  const currentUsername = storedUser ? storedUser.username : null;

  if (usernameEdit !== currentUsername) {
    if (!await isUsernameAvailable(usernameEdit, currentUserId)) {
      showToast("Username sudah digunakan! Coba yang lain.");
      return;
    }
  }

  if (file && file.size > 1024 * 1024) { // 1MB
    showToast("Ukuran foto terlalu besar!");
    return;
  }

  if (file) {
    const fotoBase64 = await readFileAsBase64(file);
    await updateProfil({ nama, gender, tanggalLahir: tanggal, foto: fotoBase64, username: usernameEdit, usernameKelas });
  } else {
    await updateProfil({ nama, gender, tanggalLahir: tanggal, username: usernameEdit, usernameKelas });
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
});

async function updateProfil({ nama, gender, tanggalLahir, foto = null, username, usernameKelas }) {
  try {
    console.log('Username untuk update:', storedUser.username);
    console.log('Payload yang dikirim:', { username, nama, gender, tanggalLahir, foto, usernameKelas });
    const res = await fetch(`http://localhost:3000/api/users/guru?username=${storedUser.username}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, nama, gender, tanggalLahir, foto, usernameKelas }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("DETAIL ERROR:", errorData);
      throw new Error("Gagal update profil");
    }

    const updatedData = await res.json();
    storedUser.username = updatedData.user.username;
    storedUser.usernameKelas = updatedData.user.usernameKelas;
    sessionStorage.setItem("loggedInUser", JSON.stringify(storedUser));

    showToast("Profil berhasil diperbarui!");
    editModal.style.display = "none";
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    console.error(err);
    showToast("Gagal memperbarui profil!");
  }
}

// =============================================
// Toast Notification
// =============================================
function showToast(message) {
  const container = document.getElementById('toast-container') || createToastContainer();

  const toast = document.createElement('div');
  toast.innerText = message;
  Object.assign(toast.style, {
    background: '#333',
    color: '#fff',
    padding: '15px 30px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    opacity: '0',
    transform: 'translateY(-20px)',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
    textAlign: 'center',
    maxWidth: '80vw',
    margin: 'auto'
  });

  container.innerHTML = '';
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 50);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  Object.assign(container.style, {
    position: 'fixed',
    top: '5%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '9999',
  });
  document.body.appendChild(container);
  return container;
}

document.getElementById("editFoto").addEventListener("change", function () {
  const file = this.files[0];
  const preview = document.getElementById("previewFoto");

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block"; 
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = "none"; 
    preview.src = "";
  }
});
