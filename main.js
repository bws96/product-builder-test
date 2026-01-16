
const generateButton = document.getElementById('generate');
const numbersDiv = document.getElementById('numbers');

generateButton.addEventListener('click', () => {
  numbersDiv.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const numbers = generateLottoNumbers();
    const setDiv = document.createElement('div');
    setDiv.classList.add('lotto-set');
    setDiv.textContent = numbers.join(', ');
    numbersDiv.appendChild(setDiv);
  }
});

function generateLottoNumbers() {
  const numbers = new Set();
  while (numbers.size < 6) {
    const randomNumber = Math.floor(Math.random() * 45) + 1;
    numbers.add(randomNumber);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}
