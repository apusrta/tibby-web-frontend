const iconMinis = document.querySelectorAll('.iconMini');

iconMinis.forEach((iconDiv, index) => {
  const img = iconDiv.querySelector('img');

  if (index === 0) {
    img.classList.add("active");
  }

  switch (index) {
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
      iconDiv.addEventListener('click', () => {
        window.location.href = "../guru/profile.html";
      });
      break;
  }
});

const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
const username = loggedInUser?.username;

if (!username) {
  console.error("Username tidak ditemukan di sessionStorage.");
} else {
  fetch(`http://localhost:3000/api/users/guru?username=${username}`)
    .then((res) => res.json())
    .then((dataGuru) => {
      const sapaan = dataGuru.gender === "Laki-laki" ? "Pak" : "Bu";
      const namaGuruDiv = document.querySelector(".namaGuru");
      if (namaGuruDiv) {
        namaGuruDiv.textContent = `${sapaan} ${dataGuru.nama}!`;
      }
    })
    .catch((error) => {
      console.error("Gagal mengambil data guru:", error);
    });
}

