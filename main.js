document.addEventListener('DOMContentLoaded', () => {
    // 테마 설정
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            themeToggle.textContent = '☀️';
        }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.removeItem('theme');
            themeToggle.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️';
        }
    });

    // 문의 폼 토글
    const showFormBtn = document.getElementById('show-contact-form-btn');
    const contactForm = document.getElementById('contact-form-container');

    showFormBtn.addEventListener('click', () => {
        contactForm.style.display = 'block';
        showFormBtn.style.display = 'none';
        contactForm.scrollIntoView({ behavior: 'smooth' });
    });
});

function calculateDaily() {
    const p = parseFloat(document.getElementById('principal').value);
    const r = parseFloat(document.getElementById('rate').value) / 100;
    let d = parseInt(document.getElementById('days').value);

    if (isNaN(p) || isNaN(r) || isNaN(d)) {
        alert("모든 값을 입력해주세요.");
        return;
    }

    d = Math.min(d, 999);
    document.getElementById('days').value = d;

    const listContainer = document.getElementById('daily-list');
    const wrapper = document.getElementById('result-wrapper');
    listContainer.innerHTML = "";
    wrapper.style.display = "block";

    let currentAmount = p;
    for (let i = 1; i <= d; i++) {
        currentAmount *= (1 + r);
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `<span>${i}일차</span><span class="amount-label">${Math.floor(currentAmount).toLocaleString()} 원</span>`;
        listContainer.appendChild(item);
    }
    document.getElementById('final-summary').innerText = `최종: ${Math.floor(currentAmount).toLocaleString()} 원`;
    wrapper.scrollIntoView({ behavior: 'smooth' });
}

// 이미지를 생성하는 공통 함수
async function generateImage() {
    const area = document.getElementById('capture-area');
    const list = document.querySelector('.result-list');
    const originalHeight = list.style.maxHeight;
    
    // 현재 테마의 배경색을 캔버스에 적용
    const bodyStyles = getComputedStyle(document.body);
    const bgColor = bodyStyles.backgroundColor;

    list.style.maxHeight = 'none'; // 전체 리스트 캡처를 위해 스크롤 해제
    const canvas = await html2canvas(area, { scale: 2, backgroundColor: bgColor });
    list.style.maxHeight = originalHeight; // 복구
    
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

async function saveAsImage() {
    const blob = await generateImage();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `복리계산_${new Date().getTime()}.png`;
    link.click();
}

async function shareResults() {
    if (!navigator.share) {
        alert("이 브라우저는 공유 기능을 지원하지 않습니다. '저장' 버튼을 이용해 주세요.");
        return;
    }

    try {
        const blob = await generateImage();
        const file = new File([blob], 'compound_result.png', { type: 'image/png' });
        
        await navigator.share({
            files: [file],
            title: '복리 계산 결과',
            text: '일별 복리 계산 결과입니다.'
        });
    } catch (err) {
        console.log("공유 취소 또는 실패:", err);
    }
}