document.addEventListener('DOMContentLoaded', function() {
    const text = document.querySelector('#scrollingText');
    
    if (text) {
      text.innerHTML = text.textContent.split('').map((char, index) => 
        `<span style="animation-delay: ${index * 0.1}s">${char}</span>`
      ).join('');
    }
  });