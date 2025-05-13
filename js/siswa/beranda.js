// --------------------------------------------
// Navigasi Sidebar Icon
// --------------------------------------------
document.getElementById('logoutButton').addEventListener('click', async function () {
  const confirmLogout = await showConfirm("Kembali ke halaman utama?");
  
  if (confirmLogout) {
    window.location.href = '../index.html';
  }
});


// --------------------------------------------
// MAIN SCRIPT
// --------------------------------------------

const tbodyPeringkat = document.getElementById('tbodyPeringkat');
const modalDetail = document.getElementById('modalDetail');
const listPelanggaran = document.getElementById('listPelanggaran');
const closeBtn = document.querySelector('.closeBtn');
const userRaw = sessionStorage.getItem('loggedInUser');
const token = sessionStorage.getItem('token');
const kelasAktif = sessionStorage.getItem('kelasAktif');

if (!userRaw || !token || !kelasAktif) {
  alert('Silakan login terlebih dahulu.');
  window.location.href = '../index.html';
}

async function loadPeringkat() {
  try {
    console.log("📦 Token dikirim:", token);
    const response = await fetch(`http://localhost:3000/api/siswa/kelas/${kelasAktif}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log("Mengambil peringkat untuk kelas:", kelasAktif);
    console.log("Status response:", response.status);

    if (!response.ok) throw new Error('Gagal mengambil data siswa');

    const siswaList = await response.json();
    console.log("Data siswa:", siswaList);

    const peringkat = siswaList.sort((a, b) => b.poin - a.poin);

    tbodyPeringkat.innerHTML = '';

    peringkat.forEach((siswa, index) => {
      const poin = siswa.poin || 0;

      let warna = '#454545';
      let weight = 'normal';

      if (poin >= 70) {
        warna = 'red';
        weight = 'bold';
      } else if (poin >= 40) {
        warna = 'orange';
        weight = 'bold';
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${siswa.foto || '../assets/user (3).png'}" alt="Foto" class="fotoSiswa"></td>
        <td class="nisn-cell">${siswa.nisn || '-'}</td>
        <td>${siswa.nama}</td>
        <td style="color: ${warna}; font-weight: ${weight}">${poin}</td>
        <td>
          <div class="actions">
            <div class="tooltip-wrapper">
              <button class="detailBtn" data-id="${siswa._id}">
                <img src="../assets/time-past (1).png" alt="Detail">
              </button>
              <span class="tooltip-text">Lihat Riwayat</span>
            </div>
          </div>
        </td>
      `;

      tbodyPeringkat.appendChild(row);
    });

    document.querySelectorAll('.detailBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idSiswa = e.currentTarget.getAttribute('data-id');
        lihatDetailSiswa(idSiswa);
      });
    });

  } catch (err) {
    console.error('Gagal load peringkat:', err);
  }
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

// Fungsi tampilkan detail siswa
async function lihatDetailSiswa(idSiswa) {
  try {
    const response = await fetch(`http://localhost:3000/api/siswa/detail/${idSiswa}`);
    const siswa = await response.json();
    console.log(siswa.riwayatPelanggaran);

    listPelanggaran.innerHTML = '';

    if (siswa.riwayatPelanggaran && siswa.riwayatPelanggaran.length > 0) {
      siswa.riwayatPelanggaran.forEach((pelanggaran, index) => {
        const div = document.createElement('div');
        div.classList.add('pelanggaran-item');
        const tanggal = new Date(pelanggaran.tanggal).toLocaleDateString('id-ID');

        div.innerHTML = `
          <span>${pelanggaran.nama} (+${pelanggaran.poin} poin) - <small>${tanggal}</small></span>
        `;
        listPelanggaran.appendChild(div);
      });
    } else {
      listPelanggaran.innerHTML = '<p class="tdk-ada-riwayat">Tidak ada riwayat pelanggaran.</p>';
    }
    modalDetail.style.display = 'block';
  } catch (err) {
    console.error('Gagal ambil detail siswa:', err);
  }
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

// Close modal
closeBtn.onclick = () => {
  modalDetail.style.display = 'none';
  location.reload();
};

loadPeringkat();

async function ambilNamaKelas() {
  try {
    const token = sessionStorage.getItem('token');

    const response = await fetch('http://localhost:3000/api/kelas/nama', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Gagal mengambil data kelas');
    }

    const data = await response.json();
    document.getElementById('namaKelas').textContent = data.namaKelas || "Kelas Tidak Diketahui";

  } catch (error) {
    console.error('❌ Gagal mengambil nama kelas:', error);
    document.getElementById('namaKelas').textContent = "Error";
  }
}

ambilNamaKelas();
