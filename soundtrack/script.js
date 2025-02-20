const music = document.querySelector("#music");
const btnStart = document.querySelector("#btn-play");
const btnStop = document.querySelector("#btn-stop");
console.log(music.duration);
btnStart.addEventListener("click", () => {
  music.play();
});
btnStop.addEventListener("click", () => {
  music.pause();
  console.log(music.currentTime);
});
