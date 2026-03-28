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
            <button class="add-period-btn">+ Nova tarefa</button>
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
    li.draggable = true;
    li.innerHTML = `
        <span class="drag-handle" title="Arrastar para reordenar">⠿</span>
        <input type="checkbox" ${checked ? 'checked' : ''}>
        <span class="item-text ${!text ? 'placeholder' : ''}" contenteditable="true">${text || "Digite aqui..."}</span>
        <button class="delete-item-btn" style="margin-left:auto; opacity:0.3; border:none; background:none; color:inherit; cursor:pointer;">✕</button>
    `;

    const span = li.querySelector('.item-text');
    const checkbox = li.querySelector('input');
    const handle = li.querySelector('.drag-handle');

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

    // ── DRAG AND DROP (mouse) ──
    li.addEventListener('dragstart', (e) => {
        // só inicia se o handle foi clicado
        if (!e.target.closest('.drag-handle') && e.target !== handle) {
            e.preventDefault();
            return;
        }
        li.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        ul.querySelectorAll('li').forEach(el => el.classList.remove('drag-over'));
        saveAll();
    });

    li.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragging = ul.querySelector('.dragging');
        if (!dragging || dragging === li) return;
        ul.querySelectorAll('li').forEach(el => el.classList.remove('drag-over'));
        li.classList.add('drag-over');

        const rect = li.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
            ul.insertBefore(dragging, li);
        } else {
            ul.insertBefore(dragging, li.nextSibling);
        }
    });

    li.addEventListener('dragleave', () => {
        li.classList.remove('drag-over');
    });

    li.addEventListener('drop', (e) => {
        e.preventDefault();
        li.classList.remove('drag-over');
    });

    // ── TOUCH DRAG (mobile) ──
    let touchDragging = null;
    let touchClone = null;
    let touchOffsetY = 0;

    handle.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        touchDragging = li;
        touchOffsetY = touch.clientY - li.getBoundingClientRect().top;

        touchClone = li.cloneNode(true);
        touchClone.style.cssText = `
            position: fixed;
            z-index: 9999;
            left: ${li.getBoundingClientRect().left}px;
            width: ${li.offsetWidth}px;
            opacity: 0.85;
            pointer-events: none;
            background: var(--card-hover);
            border-radius: 6px;
            padding: 6px 4px;
        `;
        document.body.appendChild(touchClone);
        li.classList.add('dragging');
        e.preventDefault();
    }, { passive: false });

    handle.addEventListener('touchmove', (e) => {
        if (!touchDragging) return;
        const touch = e.touches[0];
        const y = touch.clientY - touchOffsetY;
        touchClone.style.top = `${y}px`;

        const elements = ul.querySelectorAll('li:not(.dragging)');
        elements.forEach(el => el.classList.remove('drag-over'));

        let target = null;
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                target = el;
            }
        });

        if (target) {
            target.classList.add('drag-over');
            const rect = target.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (touch.clientY < midY) {
                ul.insertBefore(touchDragging, target);
            } else {
                ul.insertBefore(touchDragging, target.nextSibling);
            }
        }
        e.preventDefault();
    }, { passive: false });

    handle.addEventListener('touchend', () => {
        if (!touchDragging) return;
        li.classList.remove('dragging');
        ul.querySelectorAll('li').forEach(el => el.classList.remove('drag-over'));
        if (touchClone) { touchClone.remove(); touchClone = null; }
        touchDragging = null;
        saveAll();
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
// CONTROLE DE ÁGUA
// ============================================

const W_KEY     = 'water_data';
const W_META_KEY = 'water_meta';

function getTodayKey() {
    return new Date().toLocaleDateString('pt-BR');
}

function getWaterData() {
    const raw = localStorage.getItem(W_KEY);
    return raw ? JSON.parse(raw) : {};
}

function saveWaterData(data) {
    localStorage.setItem(W_KEY, JSON.stringify(data));
}

function getWaterMeta() {
    return parseInt(localStorage.getItem(W_META_KEY) || '2500');
}

function saveWaterMeta(val) {
    localStorage.setItem(W_META_KEY, val);
}

function getTodayTotal() {
    const data = getWaterData();
    const today = getTodayKey();
    const entries = data[today] || [];
    return entries.reduce((sum, e) => sum + e.ml, 0);
}

function renderWater() {
    const meta      = getWaterMeta();
    const data      = getWaterData();
    const today     = getTodayKey();
    const entries   = data[today] || [];
    const total     = entries.reduce((sum, e) => sum + e.ml, 0);
    const remaining = Math.max(0, meta - total);
    const pct       = Math.min(100, Math.round((total / meta) * 100));

    // label data
    const label = document.getElementById('water-date-label');
    if (label) label.textContent = 'Hoje · ' + today;

    // cards topo
    const elMeta = document.getElementById('w-meta-display');
    const elCons = document.getElementById('w-consumed');
    const elRem  = document.getElementById('w-remaining');
    if (elMeta) elMeta.textContent = meta.toLocaleString('pt-BR');
    if (elCons) elCons.textContent = total.toLocaleString('pt-BR') + ' ml';
    if (elRem)  elRem.textContent  = remaining > 0 ? remaining.toLocaleString('pt-BR') + ' ml' : '✅ Meta atingida!';

    // progress bar
    const bar = document.getElementById('w-bar-fill');
    const pctEl = document.getElementById('w-bar-pct');
    if (bar) {
        bar.style.width = pct + '%';
        bar.classList.toggle('done', pct >= 100);
    }
    if (pctEl) pctEl.textContent = pct + '%';

    // hint calculadora
    const hint = document.getElementById('w-calc-hint');
    if (hint) {
        const savedWeight = localStorage.getItem('my_routine_data');
        if (savedWeight) {
            const parsed = JSON.parse(savedWeight);
            if (parsed.weight) {
                const calcMl = Math.round(parsed.weight * 35);
                hint.textContent = calcMl.toLocaleString('pt-BR');
            } else {
                hint.textContent = '—';
            }
        }
    }

    // log do dia
    const logList = document.getElementById('w-log-list');
    if (logList) {
        logList.innerHTML = '';
        if (entries.length === 0) {
            logList.innerHTML = '<li class="w-log-empty">Nenhum registro ainda.</li>';
        } else {
            entries.slice().reverse().forEach((entry, revIdx) => {
                const realIdx = entries.length - 1 - revIdx;
                const li = document.createElement('li');
                li.className = 'w-log-item';
                li.innerHTML = `
                    <div class="w-log-item-left">
                        <span class="w-log-ml">+${entry.ml} ml</span>
                        <span class="w-log-time">${entry.time}</span>
                    </div>
                    <button class="w-log-del" data-idx="${realIdx}">✕</button>
                `;
                li.querySelector('.w-log-del').addEventListener('click', () => {
                    const d = getWaterData();
                    d[today].splice(realIdx, 1);
                    saveWaterData(d);
                    renderWater();
                });
                logList.appendChild(li);
            });
        }
    }

    // histórico
    renderWaterHistory(data, meta);
}

function renderWaterHistory(data, meta) {
    const hist = document.getElementById('w-history');
    if (!hist) return;

    const today = getTodayKey();
    const keys = Object.keys(data)
        .filter(k => k !== today && data[k].length > 0)
        .sort((a, b) => {
            const parse = s => { const [d,m,y] = s.split('/'); return new Date(y,m-1,d); };
            return parse(b) - parse(a);
        })
        .slice(0, 7);

    if (keys.length === 0) {
        hist.innerHTML = '<p class="w-hist-empty">Nenhum histórico ainda.</p>';
        return;
    }

    hist.innerHTML = '';
    keys.forEach(key => {
        const entries = data[key] || [];
        const total = entries.reduce((s, e) => s + e.ml, 0);
        const pct = Math.min(100, Math.round((total / meta) * 100));
        const div = document.createElement('div');
        div.className = 'w-hist-item';
        div.innerHTML = `
            <span class="w-hist-date">${key}</span>
            <div class="w-hist-bar-wrap">
                <div class="w-hist-bar ${pct >= 100 ? 'done' : ''}" style="width:${pct}%"></div>
            </div>
            <span class="w-hist-val">${total.toLocaleString('pt-BR')} ml</span>
        `;
        hist.appendChild(div);
    });
}

function addWaterEntry(ml) {
    if (!ml || ml <= 0) return;
    const data  = getWaterData();
    const today = getTodayKey();
    if (!data[today]) data[today] = [];
    const now = new Date();
    data[today].push({
        ml: ml,
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
    saveWaterData(data);
    renderWater();
}

// botões rápidos
document.querySelectorAll('.w-quick').forEach(btn => {
    btn.addEventListener('click', () => addWaterEntry(parseInt(btn.dataset.ml)));
});

// botão custom
document.getElementById('w-custom-add-btn').addEventListener('click', () => {
    const input = document.getElementById('w-custom-input');
    const val = parseInt(input.value);
    if (!val || val <= 0) { alert('Digite um valor válido!'); return; }
    addWaterEntry(val);
    input.value = '';
});

document.getElementById('w-custom-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('w-custom-add-btn').click();
});

// salvar meta
document.getElementById('w-meta-save-btn').addEventListener('click', () => {
    const input = document.getElementById('w-meta-input');
    const val = parseInt(input.value);
    if (!val || val < 500) { alert('Digite uma meta válida (mínimo 500ml)!'); return; }
    saveWaterMeta(val);
    input.value = '';
    renderWater();
});

// zerar dia
document.getElementById('w-clear-day-btn').addEventListener('click', () => {
    if (!confirm('Zerar todos os registros de hoje?')) return;
    const data  = getWaterData();
    const today = getTodayKey();
    data[today] = [];
    saveWaterData(data);
    renderWater();
});

// render inicial
renderWater();

// ============================================
// 9. INICIALIZAR
// ============================================

loadAll();