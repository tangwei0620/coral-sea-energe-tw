/* ========== 导航栏滚动效果 ========== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ========== 移动端菜单 ========== */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
// 点击链接后关闭菜单
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ========== Tab 切换 ========== */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + target).classList.add('active');
  });
});

/* ========== 滚动动画 ========== */
const animateElements = document.querySelectorAll('[data-animate]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      // 交错动画延迟
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 120);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

animateElements.forEach(el => observer.observe(el));

/* ========== Hero 粒子效果 ========== */
const particlesContainer = document.getElementById('heroParticles');
function createParticles() {
  const count = window.innerWidth < 768 ? 12 : 25;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 6 + 3;
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 12;
    const opacity = Math.random() * 0.4 + 0.1;
    particle.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${left}%; bottom: -10px;
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
      opacity: ${opacity};
      background: rgba(255,107,53,${opacity});
    `;
    particlesContainer.appendChild(particle);
  }
}
createParticles();

/* ========== 表单提交（真实 API） ========== */
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  const originalBg = btn.style.background;

  // 禁用按钮，显示加载状态
  btn.disabled = true;
  btn.textContent = '提交中...';

  try {
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      btn.textContent = '✅ 提交成功！';
      btn.style.background = '#10AC84';
      contactForm.reset();
    } else {
      btn.textContent = '❌ ' + (result.error || '提交失败');
      btn.style.background = '#FF5F56';
    }
  } catch (err) {
    btn.textContent = '❌ 网络错误，请重试';
    btn.style.background = '#FF5F56';
  }

  // 3秒后恢复
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = originalBg;
    btn.disabled = false;
  }, 3000);
});

/* ========== 平滑锚点滚动（兼容） ========== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ========== 控制台时间更新 ========== */
const dashTime = document.querySelector('.dash-time');
if (dashTime) {
  function updateDashTime() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    dashTime.textContent = `${y}-${m}-${d} ${h}:${min}`;
  }
  updateDashTime();
  setInterval(updateDashTime, 60000);
}
