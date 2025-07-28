function yaa() {
  alert("Yeeey🥴");
  window.location.href = "main.html";
}
// function yaa() {
//   const heartsElement = document.querySelector('.hearts');
//   const messagesElement = document.querySelector('.massages');

//   // Menampilkan elemen hearts
//   heartsElement.removeAttribute('hidden');

//   // Menyembunyikan elemen messages
//   messagesElement.style.display = 'none';
// }

const button = document.getElementById("tidak");

button.addEventListener("mouseover", function (event) {
  // Dapatkan dimensi viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Dapatkan posisi acak yang baru
  const newLeft = Math.random() * (viewportWidth - button.offsetWidth);
  const newTop = Math.random() * (viewportHeight - button.offsetHeight);

  // Pindahkan tombol ke posisi baru
  button.style.left = `${newLeft}px`;
  button.style.top = `${newTop}px`;
});

button.addEventListener("click", function () {
  window.location.href = "loos.html"; // Pindah ke halaman lain saat diklik
});
