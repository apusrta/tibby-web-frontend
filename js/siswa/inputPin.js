const inputs = document.querySelectorAll(".inputOtp");
const verifyButton = document.getElementById("verifyCode");
const pesanOtp = document.getElementById("pesanOtp");
const usernameInput = document.getElementById("usernameSiswa");

document.getElementById('logoutButton').addEventListener('click', async function () {
  const confirmLogout = await showConfirm("Kembali ke halaman utama?");
  
  if (confirmLogout) {
    window.location.href = '../index.html';
  }
});

let realValues = Array(inputs.length).fill(""); 

inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    const value = input.value;

    realValues[index] = value;

    if (value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }

    setTimeout(() => {
      input.value = "*";
    }, 400);

    checkAllFilled();
  });

  input.addEventListener("focus", () => {
    input.value = realValues[index];
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && input.value === "*" && index > 0) {
      realValues[index] = "";
      input.value = "";
      inputs[index - 1].focus();
    }
  });
});

usernameInput.addEventListener("input", checkAllFilled);


function checkAllFilled() {
  const allFilled = realValues.every(val => val !== "") && usernameInput.value.trim() !== "";

  if (allFilled) {
    verifyButton.classList.add("active");
    verifyButton.disabled = false;
  } else {
    verifyButton.classList.remove("active");
    verifyButton.disabled = true;
  }
}

verifyButton.addEventListener("click", async () => {
  const kodeKelas = realValues.join("");
  const usernameKelas = usernameInput.value.trim();

  if (!usernameKelas || kodeKelas.length !== 6) {
    pesanOtp.textContent = "Lengkapi username dan kode kelas.";
    pesanOtp.style.display = "block";
    return;
  }

  try {
    const res = await fetch("https://tibby-web-backend.vercel.app/api/users/verifikasi-kelas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameKelas, passwordKelas: kodeKelas })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);
    // Simpan ke sessionStorage & redirect
    sessionStorage.setItem("siswaUsername", usernameKelas);
    sessionStorage.setItem("namaKelas", data.namaKelas);
    sessionStorage.setItem("kelasAktif", usernameKelas); 
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem('loggedInUser', JSON.stringify({ username: usernameKelas }));

    console.log('Login berhasil untuk kelas:', usernameKelas);
    console.log('kelasAktif diset ke:', sessionStorage.getItem('kelasAktif'));
    console.log("Token:", sessionStorage.getItem('token'));

    showToast("Login berhasil!");

    setTimeout(() => {
      window.location.href = "beranda.html";
    }, 3000);

  } catch (err) {
    pesanOtp.textContent = err.message;
    pesanOtp.style.display = "block";

    const otpWrapper = document.getElementById("wrapperOtp");
    otpWrapper.classList.add("shake");
    setTimeout(() => otpWrapper.classList.remove("shake"), 400);
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