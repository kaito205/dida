window.addEventListener("load", () => {
  Swal.fire({
    title: "Mau lagu latar? Biar gagal lo ada soundtrack-nya!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  }).then((result) => {
    const song = document.querySelector(".song");
    if (result.isConfirmed) {
      if (song) {
        song
          .play()
          .then(() => {
            console.log("Lagu diputar!");
          })
          .catch((err) => {
            console.error("Gagal muter lagu:", err);
          });
      }
    }
    animationTimeline();
  });
});

// Initialising the canvas
var canvas = document.getElementById("canvas-matrix"),
  ctx = canvas.getContext("2d");

// Setting the width and height of the canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Setting up the letters
var letters = "I LOVE UI LOVE UI LOVE UI LOVE UI LOVE U ❤";
letters = letters.split("");

// Setting up the columns
var fontSize = 10,
  columns = canvas.width / fontSize;

// Setting up the drops
var drops = [];
for (var i = 0; i < columns; i++) {
  drops[i] = 1;
}

// Setting up the draw function
function draw() {
  ctx.fillStyle = "rgba(0, 0, 0, .1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < drops.length; i++) {
    var text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillStyle = "#ff5ba5";
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    drops[i]++;
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
      drops[i] = 0;
    }
  }
}

// Loop the animation
setInterval(draw, 33);
