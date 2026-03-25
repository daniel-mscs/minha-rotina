// ============================================
// TEMA CLARO / ESCURO
// ============================================

const themeBtn = document.getElementById('themeBtn');

(function initTheme() {
    if (localStorage.getItem('tema') === 'light') {
        document.body.classList.add('light');
        themeBtn.textContent = '☀️';
    }
})();

themeBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    themeBtn.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('tema', isLight ? 'light' : 'dark');
});

// ============================================
// NAVEGAÇÃO DE ABAS
// ============================================

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const alvo = tab.dataset.tab;

        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById('tab-' + alvo).classList.add('active');
    });
});

// ============================================
// EXPORTAR PDF
// ============================================

document.getElementById('exportPdfBtn').addEventListener('click', () => {
    // garante que a aba rotina está visível antes de imprimir
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="rotina"]').classList.add('active');
    document.getElementById('tab-rotina').classList.add('active');

    setTimeout(() => window.print(), 150);
});

// ============================================
// 1. GERAR DIAS POR INTERVALO DE DATAS
// ============================================

document.getElementById('generateDays').addEventListener('click', () => {
    const startValue = document.getElementById('startDate').value;
    const endValue = document.getElementById('endDate').value;

    if (!startValue || !endValue) {
        alert("Selecione as duas datas.");
        return;
    }

    const start = new Date(startValue + "T00:00:00");
    const end = new Date(endValue + "T00:00:00");

    if (start > end) {
        alert("A data inicial não pode ser maior que a final.");
        return;
    }

    const container = document.getElementById('daysContainer');

    if (container.innerHTML.trim() !== "") {
        if (!confirm("Você já tem uma rotina! Deseja apagar tudo e criar uma nova?")) return;
    }

    container.innerHTML = "";

    let current = new Date(start);
    while (current <= end) {
        const dateString = current.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        createDayBlock(dateString);
        current.setDate(current.getDate() + 1);
    }

    saveAll();
});

// ============================================
// 2. CRIAR BLOCO DE DIA
// ============================================

function createDayBlock(dateString) {
    const container = document.getElementById('daysContainer');
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day-block');
    dayDiv.innerHTML = `
        <h2 class="day-title">${dateString}</h2>
        ${createPeriodHTML("Acordar")}
        ${createPeriodHTML("Manhã")}
        ${createPeriodHTML("Tarde")}
        ${createPeriodHTML("Noite")}
    `;

    dayDiv.querySelectorAll('.add-period-btn').forEach(btn => {
        btn.addEventListener('click', () => addDynamicItem(btn));
    });

    container.appendChild(dayDiv);
}

function createPeriodHTML(name) {
    return `
        <div class="period" data-period-name="${name}">
            <h3>${name}</h3>
            <ul></ul>
            <button class="add-period-btn">+ Item</button>
        </div>
    `;
}

// ============================================
// 3. ADICIONAR ITEM NA LISTA
// ============================================

function addDynamicItem(button, text = "", checked = false) {
    const period = button.closest('.period');
    const ul = period.querySelector('ul');

    const li = document.createElement('li');
    li.innerHTML = `
        <input type="checkbox" ${checked ? 'checked' : ''}>
        <span class="item-text ${!text ? 'placeholder' : ''}" contenteditable="true">${text || "Digite aqui..."}</span>
        <button class="delete-item-btn" style="margin-left:auto; opacity:0.3; border:none; background:none; color:inherit; cursor:pointer;">✕</button>
    `;

    const span = li.querySelector('.item-text');
    const checkbox = li.querySelector('input');

    if (checked) span.style.textDecoration = "line-through";

    span.addEventListener('focus', () => {
        if (span.classList.contains('placeholder')) {
            span.innerText = "";
            span.classList.remove('placeholder');
        }
    });

    span.addEventListener('blur', () => {
        if (span.innerText.trim() === "") {
            span.innerText = "Digite aqui...";
            span.classList.add('placeholder');
        }
        saveAll();
    });

    span.addEventListener('input', saveAll);

    checkbox.addEventListener('change', () => {
        span.style.textDecoration = checkbox.checked ? "line-through" : "none";
        saveAll();
    });

    li.querySelector('.delete-item-btn').addEventListener('click', () => {
        li.remove();
        saveAll();
    });

    span.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addDynamicItem(button);
        }
    });

    ul.appendChild(li);
    if (!text) setTimeout(() => span.focus(), 10);
}

// ============================================
// 4. SALVAR E CARREGAR
// ============================================

function saveAll() {
    const days = [];

    document.querySelectorAll('.day-block').forEach(dayBlock => {
        const dayData = {
            date: dayBlock.querySelector('.day-title').innerText,
            periods: []
        };

        dayBlock.querySelectorAll('.period').forEach(period => {
            const items = [];
            period.querySelectorAll('li').forEach(li => {
                const text = li.querySelector('.item-text').innerText;
                if (text !== "Digite aqui...") {
                    items.push({
                        text: text,
                        checked: li.querySelector('input').checked
                    });
                }
            });
            dayData.periods.push({
                name: period.dataset.periodName,
                items: items
            });
        });

        days.push(dayData);
    });

    const dataToSave = {
        pageTitle: document.getElementById('pageTitle').innerText,
        weight: document.getElementById('weightInput').value,
        days: days
    };

    localStorage.setItem('my_routine_data', JSON.stringify(dataToSave));
}

function loadAll() {
    const saved = localStorage.getItem('my_routine_data');
    if (!saved) return;

    const data = JSON.parse(saved);

    if (data.pageTitle) document.getElementById('pageTitle').innerText = data.pageTitle;

    if (data.weight) {
        document.getElementById('weightInput').value = data.weight;
        const liters = ((data.weight * 35) / 1000).toFixed(2);
        document.getElementById('waterResult').innerText = `💧 Beba pelo menos ${liters}L de água por dia!`;
    }

    data.days.forEach(dayData => {
        createDayBlock(dayData.date);
        const allDayBlocks = document.querySelectorAll('#daysContainer .day-block');
        const lastDayBlock = allDayBlocks[allDayBlocks.length - 1];

        dayData.periods.forEach(periodData => {
            const periodDiv = Array.from(lastDayBlock.querySelectorAll('.period'))
                .find(p => p.dataset.periodName === periodData.name);

            const btn = periodDiv.querySelector('.add-period-btn');
            periodData.items.forEach(item => {
                addDynamicItem(btn, item.text, item.checked);
            });
        });
    });
}

// ============================================
// 5. CALCULADORA DE ÁGUA
// ============================================

document.getElementById('calcWater').addEventListener('click', () => {
    const weight = parseFloat(document.getElementById('weightInput').value);
    if (!weight || weight <= 0) {
        alert("Digite um peso válido!");
        return;
    }
    const liters = ((weight * 35) / 1000).toFixed(2);
    document.getElementById('waterResult').innerText = `💧 Beba pelo menos ${liters}L de água por dia!`;
    saveAll();
});

// ============================================
// 6. TÍTULO COM LIMITE DE CARACTERES
// ============================================

document.getElementById('pageTitle').addEventListener('input', () => {
    const el = document.getElementById('pageTitle');
    const max = parseInt(el.dataset.maxlength);
    if (el.innerText.length > max) {
        el.innerText = el.innerText.substring(0, max);
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    saveAll();
});

// ============================================
// 7. BLOQUEAR DATAS PASSADAS
// ============================================

function configurarDatas() {
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');

    const hoje = new Date();
    const offset = hoje.getTimezoneOffset();
    const hojeLocal = new Date(hoje.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

    startInput.min = hojeLocal;
    endInput.min = hojeLocal;

    startInput.addEventListener('change', () => {
        if (startInput.value) {
            if (startInput.value < hojeLocal) {
                alert("Você não pode selecionar uma data no passado!");
                startInput.value = hojeLocal;
            }
            endInput.min = startInput.value;
            if (endInput.value && endInput.value < startInput.value) {
                endInput.value = startInput.value;
            }
        }
        saveAll();
    });

    endInput.addEventListener('change', () => {
        if (endInput.value) {
            if (endInput.value < hojeLocal) {
                alert("A data final não pode ser no passado!");
                endInput.value = hojeLocal;
            }
            if (startInput.value && endInput.value < startInput.value) {
                alert("A data final não pode ser anterior à data inicial!");
                endInput.value = startInput.value;
            }
        }
        saveAll();
    });
}

configurarDatas();

// ============================================
// 8. RESET
// ============================================

document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm("Apagar tudo permanentemente?")) {
        localStorage.removeItem('my_routine_data');
        location.reload();
    }
});

// ============================================
// 9. INICIALIZAR
// ============================================

loadAll();