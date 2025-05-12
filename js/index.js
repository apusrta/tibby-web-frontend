const loginTeacher = document.querySelector('.loginTeacher');
const loginStudent = document.querySelector('.loginStudent');

loginTeacher.addEventListener('click', function () {

  window.location.href = 'masukAkun.html';
});

loginStudent.addEventListener('click', function () {

  window.location.href = 'siswa/inputPin.html';
});

document.getElementById("daftarLink").addEventListener("click", function () {
  window.location.href = "daftarAkun.html";
}); 