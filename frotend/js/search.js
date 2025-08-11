document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput) return;

    // Дебаунс
    const debounce = (func, delay = 300) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Безопасное создание regex
    const safeRegExp = (str) => {
        try {
            return new RegExp(str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi');
        } catch (e) {
            console.error('Invalid regex:', e);
            return null;
        }
    };

    // Подсветка результатов
    const highlightText = (text, regex) => {
        return text.replace(regex, match => `<mark class="highlight">${match}</mark>`);
    };

    // Очистка подсветки
    const clearHighlights = () => {
        document.querySelectorAll('.highlight').forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), parent);
        });
    };

    // Поиск и подсветка
    const performSearch = (query) => {
        clearHighlights();
        
        if (query.length < 2) return;
        
        const regex = safeRegExp(query);
        if (!regex) return;
        
        document.querySelectorAll('main p, main li, main h2, main h3, main pre code').forEach(el => {
            if (el.querySelector('mark')) return;
            
            const html = highlightText(el.textContent, regex);
            if (html !== el.textContent) {
                el.innerHTML = html;
            }
        });
        
        const firstMatch = document.querySelector('mark.highlight');
        if (firstMatch) {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    // Обработчики событий
    searchInput.addEventListener('input', debounce(() => {
        performSearch(searchInput.value.trim());
    }));

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(searchInput.value.trim());
        }
    });
});