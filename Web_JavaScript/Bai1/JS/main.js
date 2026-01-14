const btn = document.getElementById('btnChange');
// 2. Tao mot mang cac mau sac
const colors = ['red','orange','yellow','green','blue','purple'];
// 3. Dinh nghia ham thay doi mau nen
function changeColor(){
// Chon mot mau sac ngau nhien tu mang
const randomColor = colors[Math.floor(colors.length * Math.random())];
// Gan mau nen moi cho the <body>
document.body.style.background = randomColor;
}
// 4. Gan su kien 'click' cho nut bam
btn.addEventListener('click', changeColor);
