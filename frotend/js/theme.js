document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Проверка поддержки localStorage
    const storageAvailable = (() => {
        try {
            const testKey = '__theme_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    })();

    // Применение темы
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (storageAvailable) {
            localStorage.setItem('theme', theme);
        }
        
        themeToggle.setAttribute('aria-pressed', theme === 'dark');
        themeToggle.setAttribute('aria-label', 
            theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему');
    };

    // Инициализация темы
    const initTheme = () => {
        const savedTheme = storageAvailable ? localStorage.getItem('theme') : null;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        applyTheme(savedTheme || systemTheme);
    };

    // Обработчик переключения
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // Следим за изменением системных предпочтений
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!storageAvailable || !localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    initTheme();
});