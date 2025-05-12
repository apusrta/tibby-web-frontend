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
      img.classList.add("active");
      break;
    case 3:
      iconDiv.addEventListener('click', () => {
        window.location.href = "../guru/profile.html";
      }); 
      break;
  }
});


// ====== KELAS.JS ======

const tambahSiswaBtn = document.getElementById('tambahSiswa');
const tbody = document.getElementById('tbody');
const judulKelas = document.getElementById('judulKelas');
const modal = document.getElementById('modalPoin');
const daftarPelanggaran = document.getElementById('daftarPelanggaran');
const formLainnya = document.getElementById('formLainnya');
const inputLainnya = document.getElementById('inputLainnya');
const inputPoinLainnya = document.getElementById('inputPoinLainnya');
const konfirmasiLainnya = document.getElementById('konfirmasiLainnya');
const tutupModal = document.getElementById('tutupModal');
const token = sessionStorage.getItem('token');

let jumlahSiswa = 0;
const maksimalSiswa = 40;
let siswaAktif = null;

const pelanggaran = [
  { nama: 'Terlambat masuk sekolah', poin: 10 },
  { nama: 'Tidak memakai seragam lengkap', poin: 5 },
  { nama: 'Rambut tidak rapi', poin: 5 },
  { nama: 'Bertengkar dengan teman', poin: 20 },
  { nama: 'Membuang sampah sembarangan', poin: 10 },
  { nama: 'Perundungan', poin: 40 },
  { nama: 'Merokok di lingkungan sekolah', poin: 50 },
  { nama: 'Meninggalkan kelas tanpa izin', poin: 15 },
  { nama: 'Vandalisme', poin: 25 },
  { nama: 'Bolos', poin: 30 },
  { nama: 'Lainnya...', poin: 'custom' }
];

// ================== Fungsi ====================

async function tambahSiswa() {
  if (jumlahSiswa >= maksimalSiswa) return alert('Maksimal 40 siswa');
  const token = sessionStorage.getItem('token');
  const userId = sessionStorage.getItem('userId');
  const kelasAktif = sessionStorage.getItem('kelasAktif'); 
  console.log('Token:', token);
  console.log('User ID:', userId);
  console.log('Kelas Aktif:', kelasAktif); 

  if (!token || !kelasAktif) {
    alert('Token atau Kelas tidak ditemukan! Silakan login kembali.');
    return;
  }

  try {
    const response = await fetch('http://tibby-web-backend.vercel.app/api/siswa', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nama: '-',  
        foto: '', 
        kelas: kelasAktif, 
        userId: userId
      })
    }); 

    let dataSiswa = [];

    const siswaBaru = await response.json();
    dataSiswa.push(siswaBaru); 
    const nomorUrut = tbody.querySelectorAll('tr').length + 1;
 
    const row = document.createElement('tr');
    row.dataset.id = siswaBaru._id;
    row.innerHTML = `
      <td>${nomorUrut}</td>
      <td>
        <div class="tooltip-wrapper" style="position: relative; display: inline-block;">
          <img src="${siswaBaru.foto || '../assets/user (3).png'}" alt="Foto" class="fotoSiswa">
          <span class="tooltip-text">Klik untuk mengubah foto profil siswa.</span>
        </div>
      </td>
      <td class="nisn-cell">${siswaBaru.nisn || '-'}</td>
      <td class="nama-cell">${siswaBaru.nama}</td>
      <td>
        <div class="actions">
          <div class="tooltip-wrapper">
            <button class="tambahPoinBtn">+</button>
            <span class="tooltip-text">Tambah poin</span>
          </div> 
          <div class="tooltip-wrapper">
            <button class="contactUserBtn">
              <img src="../assets/edit.png" alt="Contact">
            </button>
            <span class="tooltip-text">Kontak siswa</span>
          </div>
          <div class="tooltip-wrapper">
            <button class="deleteUserBtn">
              <img src="../assets/trash.png" alt="Hapus">
            </button>
            <span class="tooltip-text">Hapus siswa</span>
          </div>
        </div>
      </td>
    `;

    tbody.appendChild(row);

    row.querySelector('.deleteUserBtn').addEventListener('click', async () => {
      const konfirmasi = await showConfirm('Yakin ingin menghapus siswa ini?');
      if (!konfirmasi) return;
    
      try {
        await fetch(`http://tibby-web-backend.vercel.app/api/siswa/${siswaBaru._id}`, { method: 'DELETE' });
        showToast('Siswa berhasil dihapus');
        row.remove(); 
        updateNomorUrut(); 
      } catch (err) {
        console.error('Gagal menghapus siswa:', err);
        showToast('Gagal menghapus siswa!');
      }
    });
    
    function updateNomorUrut() {
      const rows = tbody.querySelectorAll('tr');
      rows.forEach((row, index) => {
        row.children[0].textContent = index + 1;
      });
      jumlahSiswa = rows.length;
    }
    showToast('Jumlah siswa bertambah 1');

  } catch (err) {
    console.error('Gagal tambah siswa:', err);
    showToast('Gagal menambah siswa!');
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

function tampilkanModal(btn) {
  siswaAktif = btn.closest('tr');

  formLainnya.style.display = 'none';
  modal.classList.remove('hidden');
}


function tutupModalPoin() {
  modal.classList.add('hidden');
  formLainnya.style.display = 'none';
  inputLainnya.value = '';
  inputPoinLainnya.value = '';
  siswaAktif = null;
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
    if (toast.parentNode === container) {
      container.removeChild(toast);
    }
  }, 500);
  }, 3000);
}


async function tambahPoinKeSiswa(namaPelanggaran, poin) {
  const id = siswaAktif.dataset.id;
  const nama = siswaAktif.children[3].innerText;
  const tanggal = new Date().toISOString(); 

  try {
    await fetch(`http://tibby-web-backend.vercel.app/api/siswa/${id}/poin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        poin: poin,
        alasan: namaPelanggaran,
        tanggal: tanggal 
      })
    });

    showToast(`Poin untuk "${nama}" bertambah +${poin} karena ${namaPelanggaran}`);
    tutupModalPoin();
  } catch (err) {
    console.error('Gagal update poin:', err);
    showToast('Gagal update poin!');
  }
}



function tampilkanFormLainnya() {
  formLainnya.style.display = 'block';      
  daftarPelanggaran.style.display = 'none';  
}


function konfirmasiPelanggaranLainnya() {
  const nama = inputLainnya.value.trim();
  const poin = parseInt(inputPoinLainnya.value);

  if (nama && !isNaN(poin)) {
    tambahPoinKeSiswa(nama, poin);
    formLainnya.style.display = 'none';
    daftarPelanggaran.style.display = 'block';
    inputLainnya.value = '';
    inputPoinLainnya.value = '';
    
    location.reload(); 
  } else {
    alert('Isi nama pelanggaran dan poin dengan benar!');
  }
}



function setupEventDelegation() {
  tbody.addEventListener('click', async (e) => {
    const target = e.target;

    if (target.classList.contains('tambahPoinBtn')) {
      tampilkanModal(target);
    }

    if (target.classList.contains('fotoSiswa')) {
      const inputFile = document.createElement('input');
      inputFile.type = 'file';
      inputFile.accept = 'image/*';

      inputFile.onchange = () => {
        const file = inputFile.files[0];
        const reader = new FileReader();

        reader.onload = async () => {
          const base64 = reader.result;
          target.src = base64;

          const siswaRow = target.closest('tr');
          const siswaId = siswaRow.dataset.id;

          try {
            await fetch(`tibby-web-backend.vercel.app/api/siswa/${siswaId}/foto`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ foto: base64 })
            });
            console.log('Foto berhasil disimpan ke database');
          } catch (err) {
            console.error('Gagal simpan foto:', err);
          }
        };

        if (file) reader.readAsDataURL(file);
      };

      inputFile.click();
    }
  });
}

function isiDaftarPelanggaran() {
  pelanggaran.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.nama;
    li.onclick = () => {
      if (item.poin === 'custom') {
        tampilkanFormLainnya();
      } else {
        tambahPoinKeSiswa(item.nama, item.poin);
      }
    };
    daftarPelanggaran.appendChild(li);
  });
}

let namaKelasLama = '';

fetch('http://tibby-web-backend.vercel.app/api/kelas/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    if (data && data.nama) {
      judulKelas.innerText = data.nama;
      namaKelasLama = data.nama;
    } else {
      judulKelas.innerText = 'Nama Kelas';
    }
  })
  .catch(err => console.error('Gagal ambil nama kelas:', err));

judulKelas.addEventListener('blur', () => {
  const namaBaru = judulKelas.innerText.trim();
  console.log('Nama baru:', namaBaru);
  console.log('Nama lama:', namaKelasLama);

  if (namaBaru && namaBaru !== namaKelasLama) {
    fetch(`http://tibby-web-backend.vercel.app/api/kelas`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nama: namaBaru })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.nama) {
        judulKelas.innerText = data.nama;
        namaKelasLama = data.nama;
        console.log('Nama kelas berhasil diperbarui:', data.nama);
      } else {
        alert('Gagal memperbarui nama kelas.');
      }
    })
    .catch(err => console.error('Gagal memperbarui nama kelas:', err));
  } else {
    alert('Nama kelas tidak boleh kosong atau tidak ada perubahan.');
  }
});


// ================== Event Listener ====================

tambahSiswaBtn.addEventListener('click', tambahSiswa);
konfirmasiLainnya.addEventListener('click', konfirmasiPelanggaranLainnya);
tutupModal.addEventListener('click', tutupModalPoin);
judulKelas.addEventListener('click', () => judulKelas.contentEditable = true);

// ================== Inisialisasi ====================
setupEventDelegation();
isiDaftarPelanggaran();

async function ambilDataSiswa() {
  try {
    const kelasAktif = sessionStorage.getItem('kelasAktif');
    if (!kelasAktif) {
      alert('Kelas tidak ditemukan! Silakan login kembali.');
      return;
    }
    const token = sessionStorage.getItem('token');
    const response = await fetch(`http://tibby-web-backend.vercel.app/api/siswa/kelas/${kelasAktif}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response bukan JSON. Mungkin endpoint salah?');
    }

    const siswaList = await response.json();
    dataSiswa = siswaList;
    tbody.innerHTML = '';
    jumlahSiswa = siswaList.length;

    siswaList.forEach((siswa, index) => {
      const row = document.createElement('tr');
      row.dataset.id = siswa._id;

      row.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <div class="tooltip-wrapper" style="position: relative; display: inline-block;">
          <img src="${siswa.foto || '../assets/user (3).png'}" alt="Foto" class="fotoSiswa">
          <span class="tooltip-text">Klik untuk mengubah foto profil siswa.</span>
        </div>
      </td>
      <td class="nisn-cell">${siswa.nisn || '-'}</td>
      <td class="nama-cell">${siswa.nama}</td>
      <td>
        <div class="actions">
          <div class="tooltip-wrapper">
            <button class="tambahPoinBtn">+</button>
            <span class="tooltip-text">Tambah poin</span>
          </div>
          <div class="tooltip-wrapper">
            <button class="contactUserBtn">
              <img src="../assets/edit.png" alt="Contact">
            </button>
            <span class="tooltip-text">Data siswa</span>
          </div>
          <div class="tooltip-wrapper">
            <button class="deleteUserBtn">
              <img src="../assets/trash.png" alt="Hapus">
            </button>
            <span class="tooltip-text">Hapus siswa</span>
          </div>
        </div>
      </td>
    `;
    

    row.querySelector('.deleteUserBtn').addEventListener('click', async () => {
      const konfirmasi = await showConfirm('Yakin ingin menghapus siswa ini?');
      if (!konfirmasi) return;
    
      try {
        await fetch(`http://tibby-web-backend.vercel.app/api/siswa/${siswa._id}`, { method: 'DELETE' });
    
        showToast('Siswa berhasil dihapus');
        row.remove(); 
        jumlahSiswa--;
      } catch (err) {
        console.error('Gagal menghapus siswa:', err);
        showToast('Gagal menghapus siswa!');
      }
    });
    

      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Gagal ambil data:', err);
  }
}

ambilDataSiswa();


//search 
const inputCari = document.getElementById('inputCari');

inputCari.addEventListener('keyup', function () {
  const keyword = this.value.toLowerCase();

  const hasilFilter = dataSiswa.filter(siswa =>
    siswa.nama.toLowerCase().includes(keyword) ||
    (siswa.nisn && siswa.nisn.toLowerCase().includes(keyword))
  );

  tampilkanSiswa(hasilFilter);
});

// Fungsi buat nampilin siswa ke tabel
function tampilkanSiswa(daftar) {
  tbody.innerHTML = '';
  daftar.forEach((siswa, index) => {
    const row = document.createElement('tr');
    row.dataset.id = siswa._id;

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <div class="tooltip-wrapper" style="position: relative; display: inline-block;">
          <img src="${siswa.foto || '../assets/user (3).png'}" alt="Foto" class="fotoSiswa">

          <span class="tooltip-text">Klik untuk mengubah foto profil siswa.</span>
        </div>
      </td>

      <td class="nisn-cell">${siswa.nisn || '-'}</td>
      <td class="nama-cell">${siswa.nama}</td>
      <td>
        <div class="actions">
          <div class="tooltip-wrapper">
            <button class="tambahPoinBtn">+</button>
            <span class="tooltip-text">Tambah poin</span>
          </div>
          <div class="tooltip-wrapper">
            <button class="contactUserBtn">
              <img src="../assets/edit.png" alt="Contact">
            </button>
            <span class="tooltip-text">Kontak siswa</span>
          </div>
          <div class="tooltip-wrapper">
            <button class="deleteUserBtn">
              <img src="../assets/trash.png" alt="Hapus">
            </button>
            <span class="tooltip-text">Hapus siswa</span>
          </div>
        </div>
      </td>
    `;

    row.querySelector('.deleteUserBtn').addEventListener('click', async () => {
      const konfirmasi = await showConfirm('Yakin ingin menghapus siswa ini?');
      if (!konfirmasi) return;
    
      try {
        await fetch(`http://tibby-web-backend.vercel.app/api/siswa/${siswa._id}`, { method: 'DELETE' });
        location.reload(); 
      } catch (err) {
        console.error('Gagal menghapus siswa:', err);
        showToast('Gagal menghapus siswa!');
      }
    });    

    tbody.appendChild(row);
  });
}

// Modal Element
const contactModal = document.getElementById('kontakSiswaModal');
const contactForm = document.getElementById('formKontakSiswa');
const closeModalBtn = document.querySelector('.kontak-siswa-modal-close');
let currentSiswaId = null;

tbody.addEventListener('click', function(event) {
  if (event.target.closest('.contactUserBtn')) {
    const row = event.target.closest('tr');
    const id = row.dataset.id;
    const siswa = dataSiswa.find(s => s._id === id);
    if (siswa) {
      currentSiswaId = id;

      contactForm.elements['namaSiswa'].value = siswa.nama || '';
      contactForm.elements['nisnSiswa'].value = siswa.nisn || '';
      contactForm.elements['telpSiswa'].value = siswa.noTelp || '';
      contactForm.elements['emailSiswa'].value = siswa.email || '';
      contactForm.elements['alamatSiswa'].value = siswa.alamat || '';

      contactForm.elements['namaAyah'].value = siswa.namaAyah || '';
      contactForm.elements['telpAyah'].value = siswa.telpAyah || '';
      contactForm.elements['emailAyah'].value = siswa.emailAyah || '';

      contactForm.elements['namaIbu'].value = siswa.namaIbu || '';
      contactForm.elements['telpIbu'].value = siswa.telpIbu || '';
      contactForm.elements['emailIbu'].value = siswa.emailIbu || '';

      contactForm.elements['namaWali'].value = siswa.namaWali || '';
      contactForm.elements['telpWali'].value = siswa.telpWali || '';
      contactForm.elements['emailWali'].value = siswa.emailWali || '';

      contactModal.style.display = 'block';
    }
  }
});

closeModalBtn.addEventListener('click', function() {
  contactModal.style.display = 'none';
});

window.addEventListener('click', function(event) {
  if (event.target === contactModal) {
    contactModal.style.display = 'none';
  }
});

contactForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const updatedData = {
    nama: contactForm.elements['namaSiswa'].value,
    nisn: contactForm.elements['nisnSiswa'].value,
    noTelp: contactForm.elements['telpSiswa'].value,
    email: contactForm.elements['emailSiswa'].value,
    alamat: contactForm.elements['alamatSiswa'].value,

    namaAyah: contactForm.elements['namaAyah'].value,
    telpAyah: contactForm.elements['telpAyah'].value,
    emailAyah: contactForm.elements['emailAyah'].value,

    namaIbu: contactForm.elements['namaIbu'].value,
    telpIbu: contactForm.elements['telpIbu'].value,
    emailIbu: contactForm.elements['emailIbu'].value,

    namaWali: contactForm.elements['namaWali'].value,
    telpWali: contactForm.elements['telpWali'].value,
    emailWali: contactForm.elements['emailWali'].value
  };

  try {
    const response = await fetch(`http://tibby-web-backend.vercel.app/api/siswa/${currentSiswaId}/kontak`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    if (!response.ok) throw new Error('Gagal update data');

    const updatedSiswa = await response.json();

    const index = dataSiswa.findIndex(s => s._id === currentSiswaId);
    if (index !== -1) {
      dataSiswa[index] = updatedSiswa;
    }

    tampilkanSiswa(dataSiswa);
    contactModal.style.display = 'none';

    showToast('Data siswa telah disimpan.');
    
  } catch (err) {
    console.error(err);
    showToast('Gagal menyimpan perubahan.');
  }
});
