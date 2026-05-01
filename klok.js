const minEl = document.querySelector(".min");
/*const secEl = document.querySelector('.sec');*/
const hourEl = document.querySelector(".hour");

setInterval(() => {
  const date = new Date();
  const localeMinuten = document.getElementById("inputMinuten").value;
  const locaalUur = document.getElementById("inputUur").value;

  const minDeg = (localeMinuten / 60) * 360 - 90;
  const xtraHourDeg = (localeMinuten / 60) * 30;
  const hourDeg = (locaalUur / 12) * 360 - 90 + xtraHourDeg;
  minEl.style.transform = `rotate(${minDeg}deg)`;
  hourEl.style.transform = `rotate(${hourDeg}deg)`;
}, 1000);
