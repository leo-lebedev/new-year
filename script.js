// ========== Инициализация и глобальные переменные ==========
const snowCanvas = document.getElementById('snow-canvas');
const snowCtx = snowCanvas.getContext('2d');
const fireworkCanvas = document.getElementById('firework-canvas');
const fireworkCtx = fireworkCanvas.getContext('2d');
const santaContainer = document.getElementById('santa-container');
const musicToggle = document.getElementById('music-toggle');
const backgroundMusic = document.getElementById('background-music');

let snowflakes = [];
let fireworks = [];
let particles = [];
let mouseX = 0;
let mouseY = 0;

// Настройка размеров canvas
function resizeCanvas() {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
    fireworkCanvas.width = window.innerWidth;
    fireworkCanvas.height = window.innerHeight;

    // Пересоздаем снежинки при изменении размера
    initSnowflakes();
}

// ========== Анимация снега ==========
class Snowflake {
    constructor() {
        this.reset();
        this.y = Math.random() * snowCanvas.height;
    }

    reset() {
        this.x = Math.random() * snowCanvas.width;
        this.y = -10;
        this.radius = Math.random() * 3 + 1;
        this.speed = Math.random() * 1 + 0.5;
        this.wind = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.6 + 0.4;
    }

    update() {
        this.y += this.speed;
        this.x += this.wind;

        // Интерактивность: снежинки реагируют на мышь
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
            const force = (100 - distance) / 100;
            this.x -= (dx / distance) * force * 2;
            this.y -= (dy / distance) * force * 2;
        }

        // Сброс снежинки когда она выходит за пределы
        if (this.y > snowCanvas.height) {
            this.reset();
        }

        if (this.x > snowCanvas.width) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = snowCanvas.width;
        }
    }

    draw() {
        snowCtx.beginPath();
        snowCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        snowCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        snowCtx.fill();
        snowCtx.closePath();
    }
}

function initSnowflakes() {
    snowflakes = [];
    // Адаптивное количество снежинок
    const snowflakeCount = window.innerWidth < 768 ? 50 : 100;
    for (let i = 0; i < snowflakeCount; i++) {
        snowflakes.push(new Snowflake());
    }
}

function animateSnow() {
    snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

    snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.draw();
    });

    requestAnimationFrame(animateSnow);
}

// ========== Фейерверк ==========
class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetY = y - Math.random() * 200 - 100;
        this.speed = 3;
        this.exploded = false;
        this.radius = 3;
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    }

    update() {
        if (!this.exploded) {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode();
            }
        }
    }

    explode() {
        this.exploded = true;
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(this.x, this.y, this.color));
        }
    }

    draw() {
        if (!this.exploded) {
            fireworkCtx.beginPath();
            fireworkCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            fireworkCtx.fillStyle = this.color;
            fireworkCtx.fill();
            fireworkCtx.closePath();
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 2 + 1;
        this.velocity = {
            x: (Math.random() - 0.5) * 6,
            y: (Math.random() - 0.5) * 6
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
        this.gravity = 0.05;
    }

    update() {
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
    }

    draw() {
        fireworkCtx.save();
        fireworkCtx.globalAlpha = this.alpha;
        fireworkCtx.beginPath();
        fireworkCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        fireworkCtx.fillStyle = this.color;
        fireworkCtx.fill();
        fireworkCtx.closePath();
        fireworkCtx.restore();
    }
}

function createRandomFirework() {
    const x = Math.random() * fireworkCanvas.width;
    const y = fireworkCanvas.height;
    fireworks.push(new Firework(x, y));
}

function animateFireworks() {
    fireworkCtx.fillStyle = 'rgba(15, 32, 39, 0.1)';
    fireworkCtx.fillRect(0, 0, fireworkCanvas.width, fireworkCanvas.height);

    // Обновление фейерверков
    fireworks = fireworks.filter(firework => {
        firework.update();
        firework.draw();
        return !firework.exploded;
    });

    // Обновление частиц
    particles = particles.filter(particle => {
        particle.update();
        particle.draw();
        return particle.alpha > 0;
    });

    requestAnimationFrame(animateFireworks);
}

// Автоматический запуск фейерверков
function startAutoFireworks() {
    setInterval(() => {
        if (Math.random() > 0.3) {
            createRandomFirework();
        }
    }, 1500);
}

// Фейерверк по клику
fireworkCanvas.addEventListener('click', (e) => {
    fireworks.push(new Firework(e.clientX, fireworkCanvas.height));
});

// ========== Санта с санями ==========
function flySanta() {
    // Интерактивность: случайная высота полета
    const randomTop = Math.random() * 40 + 10; // 10-50% от высоты экрана
    santaContainer.style.top = randomTop + '%';

    santaContainer.classList.add('flying');

    // Удаляем класс после окончания анимации (8 секунд)
    setTimeout(() => {
        santaContainer.classList.remove('flying');
    }, 8000);
}

// Запуск периодических полетов Санты
function startSantaFlights() {
    flySanta(); // Первый полет

    // Затем запускаем периодически каждые 15-25 секунд
    setInterval(() => {
        flySanta();
    }, Math.random() * 10000 + 15000);
}

// Интерактивность: Санта реагирует на мышь
santaContainer.addEventListener('mouseenter', () => {
    santaContainer.style.transform = 'translateY(-20px) scale(1.1)';
});

santaContainer.addEventListener('mouseleave', () => {
    santaContainer.style.transform = '';
});

// ========== Музыка ==========
let isMusicPlaying = false;

function toggleMusic() {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
        document.querySelector('.music-icon.playing').style.display = 'none';
        document.querySelector('.music-icon.paused').style.display = 'inline';
    } else {
        backgroundMusic.play().catch(err => {
            console.log('Ошибка воспроизведения:', err);
        });
        isMusicPlaying = true;
        document.querySelector('.music-icon.playing').style.display = 'inline';
        document.querySelector('.music-icon.paused').style.display = 'none';
    }
}

// Попытка автоматического воспроизведения
function tryAutoplay() {
    backgroundMusic.play()
        .then(() => {
            isMusicPlaying = true;
            console.log('Музыка запущена автоматически');
        })
        .catch(err => {
            console.log('Автовоспроизведение заблокировано. Нажмите кнопку для включения музыки.');
            isMusicPlaying = false;
            document.querySelector('.music-icon.playing').style.display = 'none';
            document.querySelector('.music-icon.paused').style.display = 'inline';
        });
}

musicToggle.addEventListener('click', toggleMusic);

// ========== Отслеживание мыши для интерактивности ==========
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Для мобильных устройств
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
});

// ========== Инициализация при загрузке страницы ==========
window.addEventListener('load', () => {
    resizeCanvas();
    initSnowflakes();
    animateSnow();
    animateFireworks();

    // Запуск периодических полетов Санты через 3 секунды после загрузки
    setTimeout(startSantaFlights, 3000);

    // Запуск автоматических фейерверков
    startAutoFireworks();

    // Попытка автоматического воспроизведения музыки
    setTimeout(tryAutoplay, 500);
});

// ========== Обработка изменения размера окна ==========
window.addEventListener('resize', resizeCanvas);

// ========== Оптимизация производительности ==========
// Приостановка анимаций когда вкладка неактивна
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (isMusicPlaying) {
            backgroundMusic.pause();
        }
    } else {
        if (isMusicPlaying) {
            backgroundMusic.play();
        }
    }
});

// ========== Дополнительные эффекты ==========
// Добавление легкого параллакса к основному контенту
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const mainContent = document.querySelector('.main-content');

    if (mainContent) {
        mainContent.style.transform = `translateY(${scrollY * 0.5}px)`;
    }

    lastScrollY = scrollY;
});

console.log('🎄 С Новым Годом! Сайт успешно загружен! 🎄');
