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

// ============================================
// MENU HAMBURGUER
// ============================================

const TAB_TITLES = {
    dashboard: 'Início', rotina: 'Rotina', agua: 'Água',
    peso: 'Peso', macros: 'Macros', stats: 'Estatísticas',
    ajuda: 'Ajuda', contato: 'Contato'
};

function openMenu() {
    document.getElementById('side-menu').classList.add('open');
    document.getElementById('menu-overlay').classList.add('active');
}

function closeMenu() {
    document.getElementById('side-menu').classList.remove('open');
    document.getElementById('menu-overlay').classList.remove('active');
}

document.getElementById('menu-open-btn').addEventListener('click', openMenu);
document.getElementById('menu-close-btn').addEventListener('click', closeMenu);
document.getElementById('menu-overlay').addEventListener('click', closeMenu);

document.querySelectorAll('.side-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const alvo = tab.dataset.tab;
        document.querySelectorAll('.side-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + alvo).classList.add('active');
        const titleEl = document.getElementById('topbar-title');
        if (titleEl) titleEl.textContent = TAB_TITLES[alvo] || alvo;
        closeMenu();
        if (alvo === 'dashboard') setTimeout(renderDashboard, 50);
        if (alvo === 'stats') setTimeout(renderStats, 100);
    });
});

// ============================================
// EXPORTAR PDF
// ============================================

document.getElementById('exportPdfBtn').addEventListener('click', () => {
    document.querySelectorAll('.side-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="rotina"]').classList.add('active');
    document.getElementById('tab-rotina').classList.add('active');
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = 'Rotina';
    closeMenu();
    setTimeout(() => window.print(), 150);
});

// ============================================
// PERFIL DO USUÁRIO
// ============================================

const PERFIL_KEY = 'user_perfil';

function getPerfil() {
    const raw = localStorage.getItem(PERFIL_KEY);
    return raw ? JSON.parse(raw) : {};
}

function savePerfil(data) {
    localStorage.setItem(PERFIL_KEY, JSON.stringify(data));
}

function showPerfilModal() {
    document.getElementById('perfil-modal').style.display = 'flex';
    const p = getPerfil();
    if (p.nome)  document.getElementById('pf-nome').value  = p.nome;
    if (p.sexo)  document.getElementById('pf-sexo').value  = p.sexo;
    if (p.idade) document.getElementById('pf-idade').value = p.idade;
}

function hidePerfilModal() {
    document.getElementById('perfil-modal').style.display = 'none';
}

document.getElementById('pf-save-btn').addEventListener('click', () => {
    const nome  = document.getElementById('pf-nome').value.trim();
    const sexo  = document.getElementById('pf-sexo').value;
    const idade = parseInt(document.getElementById('pf-idade').value);
    if (!nome)  { alert('Digite seu nome!'); return; }
    if (!sexo)  { alert('Selecione seu sexo!'); return; }
    if (!idade) { alert('Digite sua idade!'); return; }
    savePerfil({ nome, sexo, idade });
    hidePerfilModal();
    renderDashboard();
});

document.getElementById('pf-cancel-btn').addEventListener('click', hidePerfilModal);

document.getElementById('perfil-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('perfil-modal')) hidePerfilModal();
});

(function checkPerfil() {
    const p = getPerfil();
    if (!p.nome) setTimeout(showPerfilModal, 800);
})();

// ============================================
// CONTROLE DE ÁGUA
// ============================================

const W_KEY      = 'water_data';
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

    const label = document.getElementById('water-date-label');
    if (label) label.textContent = 'Hoje · ' + today;

    const elMeta = document.getElementById('w-meta-display');
    const elCons = document.getElementById('w-consumed');
    const elRem  = document.getElementById('w-remaining');
    if (elMeta) elMeta.textContent = meta.toLocaleString('pt-BR');
    if (elCons) elCons.textContent = total.toLocaleString('pt-BR') + ' ml';
    if (elRem)  elRem.textContent  = remaining > 0 ? remaining.toLocaleString('pt-BR') + ' ml' : '✅ Meta atingida!';

    const bar = document.getElementById('w-bar-fill');
    const pctEl = document.getElementById('w-bar-pct');
    if (bar) {
        bar.style.width = pct + '%';
        bar.classList.toggle('done', pct >= 100);
    }
    if (pctEl) pctEl.textContent = pct + '%';

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

document.querySelectorAll('.w-quick').forEach(btn => {
    btn.addEventListener('click', () => addWaterEntry(parseInt(btn.dataset.ml)));
});

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

document.getElementById('w-meta-save-btn').addEventListener('click', () => {
    const input = document.getElementById('w-meta-input');
    const val = parseInt(input.value);
    if (!val || val < 500) { alert('Digite uma meta válida (mínimo 500ml)!'); return; }
    saveWaterMeta(val);
    input.value = '';
    renderWater();
});

document.getElementById('w-clear-day-btn').addEventListener('click', () => {
    if (!confirm('Zerar todos os registros de hoje?')) return;
    const data  = getWaterData();
    const today = getTodayKey();
    data[today] = [];
    saveWaterData(data);
    renderWater();
});

renderWater();

// ============================================
// META DE PESO
// ============================================

const PESO_META_KEY = 'peso_meta';

function getPesoMeta() {
    return parseFloat(localStorage.getItem(PESO_META_KEY) || '0');
}

function renderPesoMeta() {
    const meta    = getPesoMeta();
    const data    = getPesoData();
    const result  = document.getElementById('p-meta-result');
    const input   = document.getElementById('p-meta-input');
    if (input && meta) input.value = meta;
    if (!result) return;

    if (!meta) { result.style.display = 'none'; return; }

    const ultimo = data.length > 0 ? data[data.length - 1].peso : null;
    if (!ultimo) {
        result.style.display = 'block';
        result.innerHTML = `🎯 Meta: <strong>${meta} kg</strong><br>Registre seu peso para ver o progresso.`;
        return;
    }

    const diff = ultimo - meta;
    const mediaData = data.slice(-7);
    let projecao = '';
    if (mediaData.length >= 2) {
        const mediaPerDay = (mediaData[mediaData.length-1].peso - mediaData[0].peso) / (mediaData.length - 1);
        if (mediaPerDay < 0 && diff > 0) {
            const dias = Math.ceil(diff / Math.abs(mediaPerDay));
            const dataProj = new Date();
            dataProj.setDate(dataProj.getDate() + dias);
            projecao = `<br>📅 Projeção: <strong>${dataProj.toLocaleDateString('pt-BR')}</strong> (~${dias} dias no ritmo atual)`;
        }
    }

    result.style.display = 'block';
    result.innerHTML = `
        🎯 Meta: <strong>${meta} kg</strong><br>
        ⚖️ Atual: <strong>${ultimo.toFixed(1)} kg</strong><br>
        ${diff > 0
            ? `📉 Faltam: <span style="color:#3b82f6;font-weight:600;">${diff.toFixed(1)} kg</span>`
            : `✅ <span style="color:#1D9E75;font-weight:600;">Meta atingida! Parabéns!</span>`}
        ${projecao}
    `;
}

document.getElementById('p-meta-save-btn').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('p-meta-input').value);
    if (!val || val < 30) { alert('Digite uma meta válida!'); return; }
    localStorage.setItem(PESO_META_KEY, val);
    renderPesoMeta();
});

// ============================================
// MACROS
// ============================================

const MACROS_KEY      = 'macros_data';
const MACROS_META_KEY = 'macros_meta';

const FOOD_TABLE = [
    // Carboidratos / base
    { name: 'Arroz branco cozido',       kcal: 128, prot: 2.5,  carb: 28.1, gord: 0.2  },
    { name: 'Arroz integral cozido',      kcal: 124, prot: 2.6,  carb: 25.8, gord: 1.0  },
    { name: 'Batata doce cozida',         kcal: 77,  prot: 1.4,  carb: 18.4, gord: 0.1  },
    { name: 'Batata inglesa cozida',      kcal: 56,  prot: 1.6,  carb: 13.0, gord: 0.1  },
    { name: 'Batata frita',               kcal: 312, prot: 3.4,  carb: 41.4, gord: 15.0 },
    { name: 'Macarrão cozido',            kcal: 130, prot: 4.3,  carb: 26.4, gord: 0.9  },
    { name: 'Pão francês',                kcal: 300, prot: 8.0,  carb: 58.6, gord: 3.1  },
    { name: 'Aveia em flocos',            kcal: 394, prot: 13.9, carb: 67.0, gord: 8.5  },
    { name: 'Feijão cozido',              kcal: 76,  prot: 4.8,  carb: 13.5, gord: 0.5  },
    { name: 'Lentilha cozida',            kcal: 93,  prot: 6.3,  carb: 16.3, gord: 0.4  },
    // Proteínas
    { name: 'Frango grelhado (peito)',    kcal: 159, prot: 32.0, carb: 0.0,  gord: 2.7  },
    { name: 'Frango cozido (coxa)',       kcal: 191, prot: 26.0, carb: 0.0,  gord: 9.3  },
    { name: 'Carne bovina patinho',       kcal: 219, prot: 21.0, carb: 0.0,  gord: 14.5 },
    { name: 'Carne moída (patinho)',      kcal: 189, prot: 26.0, carb: 0.0,  gord: 9.5  },
    { name: 'Tilápia grelhada',           kcal: 128, prot: 26.2, carb: 0.0,  gord: 2.7  },
    { name: 'Salmão grelhado',            kcal: 208, prot: 20.0, carb: 0.0,  gord: 13.4 },
    { name: 'Atum em lata (água)',        kcal: 109, prot: 24.4, carb: 0.0,  gord: 0.9  },
    { name: 'Sardinha em lata',           kcal: 208, prot: 24.6, carb: 0.0,  gord: 11.5 },
    { name: 'Ovo inteiro cozido',         kcal: 155, prot: 12.6, carb: 1.1,  gord: 10.6 },
    { name: 'Clara de ovo',               kcal: 52,  prot: 11.0, carb: 0.7,  gord: 0.2  },
    { name: 'Whey protein',               kcal: 370, prot: 75.0, carb: 9.0,  gord: 4.0  },
    { name: 'Iogurte grego natural',      kcal: 97,  prot: 9.0,  carb: 3.6,  gord: 5.0  },
    { name: 'Queijo cottage',             kcal: 98,  prot: 11.1, carb: 3.4,  gord: 4.3  },
    // Laticínios / extras
    { name: 'Leite em pó integral',       kcal: 496, prot: 24.6, carb: 39.4, gord: 26.3 },
    { name: 'Leite desnatado',            kcal: 36,  prot: 3.5,  carb: 5.1,  gord: 0.1  },
    // Frutas
    { name: 'Banana nanica',              kcal: 89,  prot: 1.1,  carb: 22.8, gord: 0.3  },
    { name: 'Maçã',                       kcal: 56,  prot: 0.3,  carb: 15.2, gord: 0.1  },
    { name: 'Laranja',                    kcal: 47,  prot: 0.9,  carb: 11.7, gord: 0.1  },
    { name: 'Mamão papaia',               kcal: 45,  prot: 0.5,  carb: 11.8, gord: 0.1  },
    // Gorduras / oleaginosas
    { name: 'Azeite de oliva',            kcal: 884, prot: 0.0,  carb: 0.0,  gord: 100.0},
    { name: 'Amendoim torrado',           kcal: 567, prot: 25.8, carb: 16.1, gord: 49.2 },
    { name: 'Castanha do pará',           kcal: 656, prot: 14.3, carb: 15.1, gord: 63.5 },
    // Vegetais
    { name: 'Salada (folhas mistas)',     kcal: 17,  prot: 1.3,  carb: 2.9,  gord: 0.2  },
    { name: 'Tomate',                     kcal: 18,  prot: 0.9,  carb: 3.9,  gord: 0.2  },
    { name: 'Brócolis cozido',            kcal: 35,  prot: 2.4,  carb: 6.6,  gord: 0.4  },
    { name: 'Cenoura crua',               kcal: 34,  prot: 0.9,  carb: 7.9,  gord: 0.2  },
];

function getMacrosData() {
    const raw = localStorage.getItem(MACROS_KEY);
    return raw ? JSON.parse(raw) : {};
}

function saveMacrosData(data) {
    localStorage.setItem(MACROS_KEY, JSON.stringify(data));
}

function getMacrosMeta() {
    return parseInt(localStorage.getItem(MACROS_META_KEY) || '2000');
}

// FIX: arredonda corretamente sem floating point bug
function round1(n) { return Math.round(n * 10) / 10; }

function calcMacros(food, grams) {
    const factor = grams / 100;
    return {
        kcal: Math.round(food.kcal * factor),
        prot: round1(food.prot * factor),
        carb: round1(food.carb * factor),
        gord: round1(food.gord * factor),
    };
}

function getTodayMacrosTotal() {
    const data    = getMacrosData();
    const today   = new Date().toLocaleDateString('pt-BR');
    const entries = data[today] || [];
    return entries.reduce((acc, e) => ({
        kcal: acc.kcal + e.kcal,
        prot: round1(acc.prot + e.prot),
        carb: round1(acc.carb + e.carb),
        gord: round1(acc.gord + e.gord),
    }), { kcal: 0, prot: 0, carb: 0, gord: 0 });
}

// ============================================
// AUTOCOMPLETE
// ============================================

let selectedFoodIndex = -1;
let currentSuggestionIndex = -1;

function normalizeText(text) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filterFoods(query) {
    if (!query) return [];
    const normalizedQuery = normalizeText(query);
    return FOOD_TABLE
        .map((food, index) => ({ food, index }))
        .filter(({ food }) => normalizeText(food.name).includes(normalizedQuery));
}

function showSuggestions(query) {
    const suggestionsList = document.getElementById('mc-food-suggestions');
    const filtered = filterFoods(query);

    suggestionsList.innerHTML = '';
    currentSuggestionIndex = -1;

    if (filtered.length === 0) {
        if (query.length > 0) {
            const li = document.createElement('li');
            li.className = 'autocomplete-no-results';
            li.textContent = 'Nenhum alimento encontrado';
            suggestionsList.appendChild(li);
            suggestionsList.classList.add('show');
        } else {
            suggestionsList.classList.remove('show');
        }
        return;
    }

    filtered.forEach(({ food, index }) => {
        const li = document.createElement('li');
        li.className = 'autocomplete-item';
        li.dataset.index = index;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'autocomplete-item-name';
        nameDiv.textContent = food.name;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'autocomplete-item-info';
        infoDiv.textContent = `${food.kcal} kcal | P: ${food.prot}g C: ${food.carb}g G: ${food.gord}g (por 100g)`;

        li.appendChild(nameDiv);
        li.appendChild(infoDiv);
        li.addEventListener('click', () => selectFood(index, food.name));
        suggestionsList.appendChild(li);
    });

    suggestionsList.classList.add('show');
}

function selectFood(index, name) {
    selectedFoodIndex = index;
    const input = document.getElementById('mc-food-input');
    input.value = name;
    hideSuggestions();
    renderMacrosPreview();
    document.getElementById('mc-grams-input').focus();
}

function hideSuggestions() {
    const suggestionsList = document.getElementById('mc-food-suggestions');
    suggestionsList.classList.remove('show');
    currentSuggestionIndex = -1;
}

function navigateSuggestions(direction) {
    const items = document.querySelectorAll('.autocomplete-item:not(.autocomplete-no-results)');
    if (items.length === 0) return;

    if (currentSuggestionIndex >= 0 && currentSuggestionIndex < items.length) {
        items[currentSuggestionIndex].classList.remove('active');
    }

    if (direction === 'down') {
        currentSuggestionIndex = (currentSuggestionIndex + 1) % items.length;
    } else if (direction === 'up') {
        currentSuggestionIndex = currentSuggestionIndex <= 0 ? items.length - 1 : currentSuggestionIndex - 1;
    }

    items[currentSuggestionIndex].classList.add('active');
    items[currentSuggestionIndex].scrollIntoView({ block: 'nearest' });
}

function selectCurrentSuggestion() {
    const items = document.querySelectorAll('.autocomplete-item:not(.autocomplete-no-results)');
    if (currentSuggestionIndex >= 0 && currentSuggestionIndex < items.length) {
        const index = parseInt(items[currentSuggestionIndex].dataset.index);
        const food = FOOD_TABLE[index];
        selectFood(index, food.name);
    }
}

function renderMacrosPreview() {
    const grams   = parseFloat(document.getElementById('mc-grams-input').value);
    const preview = document.getElementById('mc-preview');
    if (!preview) return;

    if (selectedFoodIndex === -1 || !grams || grams <= 0) {
        preview.style.display = 'none';
        return;
    }

    const food = FOOD_TABLE[selectedFoodIndex];
    const m    = calcMacros(food, grams);
    preview.style.display = 'block';
    preview.innerHTML = `⚡ ${m.kcal} kcal &nbsp;|&nbsp; 🥩 ${m.prot}g prot &nbsp;|&nbsp; 🍞 ${m.carb}g carb &nbsp;|&nbsp; 🧈 ${m.gord}g gord`;
}

function renderMacros() {
    const today  = new Date().toLocaleDateString('pt-BR');
    const label  = document.getElementById('macros-date-label');
    if (label) label.textContent = 'Hoje · ' + today;

    const total  = getTodayMacrosTotal();
    const meta   = getMacrosMeta();
    const pct    = Math.min(100, Math.round((total.kcal / meta) * 100));

    const set    = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setBar = (id, p)   => { const el = document.getElementById(id); if (el) el.style.width = p + '%'; };

    set('mc-kcal', total.kcal);
    set('mc-prot', total.prot);
    set('mc-carb', total.carb);
    set('mc-gord', total.gord);
    setBar('mc-kcal-bar', pct);
    setBar('mc-prot-bar', Math.min(100, Math.round(total.prot / 2)));
    setBar('mc-carb-bar', Math.min(100, Math.round(total.carb / 3)));
    setBar('mc-gord-bar', Math.min(100, Math.round(total.gord / 0.8)));

    const metaEl = document.getElementById('mc-kcal-meta');
    if (metaEl) metaEl.textContent = `${pct}% de ${meta} kcal`;

    const metaInput = document.getElementById('mc-meta-input');
    if (metaInput && !metaInput.value) metaInput.placeholder = `Meta atual: ${meta} kcal`;

    renderMacrosLog();
}

function renderMacrosLog() {
    const list  = document.getElementById('mc-log-list');
    if (!list) return;
    const data  = getMacrosData();
    const today = new Date().toLocaleDateString('pt-BR');
    const entries = data[today] || [];

    if (entries.length === 0) {
        list.innerHTML = '<li class="w-log-empty">Nenhum alimento registrado.</li>';
        return;
    }

    list.innerHTML = '';
    entries.slice().reverse().forEach((e, revIdx) => {
        const realIdx = entries.length - 1 - revIdx;
        const li = document.createElement('li');
        li.className = 'mc-log-item';
        li.innerHTML = `
            <div class="mc-log-item-top">
                <span class="mc-log-name">${e.name} <span class="mc-log-grams">(${e.grams}g)</span></span>
                <button class="w-log-del" data-idx="${realIdx}">✕</button>
            </div>
            <div class="mc-log-macros">
                <span>⚡ ${e.kcal} kcal</span>
                <span>🥩 ${e.prot}g</span>
                <span>🍞 ${e.carb}g</span>
                <span>🧈 ${e.gord}g</span>
            </div>
        `;
        li.querySelector('.w-log-del').addEventListener('click', () => {
            const d = getMacrosData();
            d[today].splice(realIdx, 1);
            saveMacrosData(d);
            renderMacros();
        });
        list.appendChild(li);
    });
}

// Event listeners autocomplete
const foodInput  = document.getElementById('mc-food-input');
const gramsInput = document.getElementById('mc-grams-input');

foodInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    selectedFoodIndex = -1;
    showSuggestions(query);
    renderMacrosPreview();
});

foodInput.addEventListener('keydown', (e) => {
    const suggestionsList = document.getElementById('mc-food-suggestions');
    const isOpen = suggestionsList.classList.contains('show');
    if (e.key === 'ArrowDown' && isOpen)  { e.preventDefault(); navigateSuggestions('down'); }
    else if (e.key === 'ArrowUp' && isOpen) { e.preventDefault(); navigateSuggestions('up'); }
    else if (e.key === 'Enter') {
        e.preventDefault();
        if (isOpen && currentSuggestionIndex >= 0) selectCurrentSuggestion();
        else if (selectedFoodIndex >= 0) gramsInput.focus();
    } else if (e.key === 'Escape') hideSuggestions();
});

foodInput.addEventListener('focus', (e) => {
    if (e.target.value.trim()) showSuggestions(e.target.value.trim());
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) hideSuggestions();
});

gramsInput.addEventListener('input', renderMacrosPreview);
gramsInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('mc-add-btn').click(); }
});

document.getElementById('mc-add-btn').addEventListener('click', () => {
    const grams = parseFloat(gramsInput.value);
    if (selectedFoodIndex === -1) { alert('Selecione um alimento!'); foodInput.focus(); return; }
    if (!grams || grams <= 0)    { alert('Digite a quantidade em gramas!'); gramsInput.focus(); return; }

    const food  = FOOD_TABLE[selectedFoodIndex];
    const m     = calcMacros(food, grams);
    const data  = getMacrosData();
    const today = new Date().toLocaleDateString('pt-BR');
    if (!data[today]) data[today] = [];
    data[today].push({ name: food.name, grams, ...m });
    saveMacrosData(data);

    foodInput.value  = '';
    gramsInput.value = '';
    selectedFoodIndex = -1;
    document.getElementById('mc-preview').style.display = 'none';
    renderMacros();
    foodInput.focus();
});

document.getElementById('mc-meta-save-btn').addEventListener('click', () => {
    const val = parseInt(document.getElementById('mc-meta-input').value);
    if (!val || val < 500) { alert('Digite uma meta válida (mínimo 500 kcal)!'); return; }
    localStorage.setItem(MACROS_META_KEY, val);
    renderMacros();
});

document.getElementById('mc-clear-btn').addEventListener('click', () => {
    if (!confirm('Zerar todos os registros de hoje?')) return;
    const data  = getMacrosData();
    const today = new Date().toLocaleDateString('pt-BR');
    data[today] = [];
    saveMacrosData(data);
    renderMacros();
});

renderMacros();

// ============================================
// RELATÓRIO SEMANAL (aparece aos sábados)
// ============================================

function renderWeeklyReport() {
    const dash = document.getElementById('dash-weekly-report');
    if (!dash) return;

    const hoje = new Date();
    if (hoje.getDay() !== 6) { dash.style.display = 'none'; return; }

    const wData  = getWaterData();
    const meta   = getWaterMeta();
    const last7  = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(hoje);
        d.setDate(hoje.getDate() - i);
        const key = d.toLocaleDateString('pt-BR');
        const entries = wData[key] || [];
        last7.push(entries.reduce((s, e) => s + e.ml, 0));
    }
    const mediaAgua = Math.round(last7.reduce((s, v) => s + v, 0) / 7);
    const diasMeta  = last7.filter(v => v >= meta).length;

    const pData   = getPesoData();
    const semana  = pData.slice(-7);
    const pesoVar = semana.length >= 2
        ? (semana[semana.length-1].peso - semana[0].peso).toFixed(1)
        : null;

    const hData = getHabitsData();
    let totalH = 0, doneH = 0;
    for (let i = 6; i >= 0; i--) {
        const d = new Date(hoje);
        d.setDate(hoje.getDate() - i);
        const key    = d.toLocaleDateString('pt-BR');
        const habits = hData[key] || {};
        const keys   = ['treino','estudo','sono','hidratacao','alimentacao','produtividade'];
        keys.forEach(k => { totalH++; if (habits[k]) doneH++; });
    }
    const pctHabitos = Math.round((doneH / totalH) * 100);

    const mData = getMacrosData();
    let totalKcal = 0, diasComRegistro = 0;
    for (let i = 6; i >= 0; i--) {
        const d = new Date(hoje);
        d.setDate(hoje.getDate() - i);
        const key     = d.toLocaleDateString('pt-BR');
        const entries = mData[key] || [];
        if (entries.length > 0) {
            totalKcal += entries.reduce((s, e) => s + e.kcal, 0);
            diasComRegistro++;
        }
    }
    const mediaKcal = diasComRegistro > 0 ? Math.round(totalKcal / diasComRegistro) : null;

    dash.style.display = 'block';
    dash.innerHTML = `
        <div class="dash-section-title">📊 Relatório da semana</div>
        <div class="weekly-grid">
            <div class="weekly-item">
                <span class="weekly-icon">💧</span>
                <div>
                    <div class="weekly-label">Média de água</div>
                    <div class="weekly-val">${mediaAgua.toLocaleString('pt-BR')} ml/dia</div>
                    <div class="weekly-sub">${diasMeta} de 7 dias bateu a meta</div>
                </div>
            </div>
            ${pesoVar !== null ? `
            <div class="weekly-item">
                <span class="weekly-icon">⚖️</span>
                <div>
                    <div class="weekly-label">Variação de peso</div>
                    <div class="weekly-val" style="color:${parseFloat(pesoVar) < 0 ? '#1D9E75' : parseFloat(pesoVar) > 0 ? '#ef4444' : 'var(--text)'}">
                        ${parseFloat(pesoVar) > 0 ? '+' : ''}${pesoVar} kg
                    </div>
                    <div class="weekly-sub">${parseFloat(pesoVar) < 0 ? 'Ótimo progresso!' : parseFloat(pesoVar) > 0 ? 'Atenção à dieta' : 'Peso estável'}</div>
                </div>
            </div>` : ''}
            <div class="weekly-item">
                <span class="weekly-icon">✅</span>
                <div>
                    <div class="weekly-label">Hábitos cumpridos</div>
                    <div class="weekly-val">${pctHabitos}%</div>
                    <div class="weekly-sub">${doneH} de ${totalH} hábitos</div>
                </div>
            </div>
            ${mediaKcal ? `
            <div class="weekly-item">
                <span class="weekly-icon">🍽️</span>
                <div>
                    <div class="weekly-label">Média calórica</div>
                    <div class="weekly-val">${mediaKcal.toLocaleString('pt-BR')} kcal</div>
                    <div class="weekly-sub">em ${diasComRegistro} dias registrados</div>
                </div>
            </div>` : ''}
        </div>
    `;
}

// ============================================
// CONTROLE DE PESO
// ============================================

const PESO_KEY        = 'peso_data';
const PESO_CONFIG_KEY = 'peso_config';

function getPesoData() {
    const raw = localStorage.getItem(PESO_KEY);
    return raw ? JSON.parse(raw) : [];
}

function savePesoData(data) {
    localStorage.setItem(PESO_KEY, JSON.stringify(data));
}

function getPesoConfig() {
    const raw = localStorage.getItem(PESO_CONFIG_KEY);
    return raw ? JSON.parse(raw) : { altura: null, idade: null };
}

function savePesoConfig(cfg) {
    localStorage.setItem(PESO_CONFIG_KEY, JSON.stringify(cfg));
}

function calcIMC(peso, alturaCm) {
    const h = alturaCm / 100;
    return peso / (h * h);
}

function classifyIMC(imc) {
    if (imc < 18.5) return { label: 'Abaixo do peso', color: '#85B7EB' };
    if (imc < 25)   return { label: 'Normal',          color: '#97C459' };
    if (imc < 30)   return { label: 'Sobrepeso',       color: '#FAC775' };
    if (imc < 35)   return { label: 'Obesidade I',     color: '#EF9F27' };
    return               { label: 'Obesidade II+',    color: '#F09595' };
}

function calcGordura(imc, idade) {
    return (1.20 * imc) + (0.23 * idade) - 10.8 - 5.4;
}

function imcToBarPct(imc) {
    const min = 15, max = 40;
    return Math.min(100, Math.max(0, ((imc - min) / (max - min)) * 100));
}

let pesoChart = null;

function renderPeso() {
    const data = getPesoData();
    const cfg  = getPesoConfig();

    if (cfg.altura) document.getElementById('p-altura').value = cfg.altura;
    if (cfg.idade)  document.getElementById('p-idade').value  = cfg.idade;

    const ultimo = data.length > 0 ? data[data.length - 1] : null;

    const elPeso  = document.getElementById('pc-peso');
    const elImc   = document.getElementById('pc-imc');
    const elImcCl = document.getElementById('pc-imc-class');
    const elGord  = document.getElementById('pc-gord');
    const elIdeal = document.getElementById('pc-ideal');
    const marker  = document.getElementById('imc-marker');
    const markerV = document.getElementById('imc-marker-val');

    if (ultimo && cfg.altura && cfg.idade) {
        const imc      = calcIMC(ultimo.peso, cfg.altura);
        const cls      = classifyIMC(imc);
        const gord     = calcGordura(imc, cfg.idade);
        const h        = cfg.altura / 100;
        const idealMin = (22 * h * h).toFixed(1);
        const idealMax = (24 * h * h).toFixed(1);
        const pct      = imcToBarPct(imc);

        if (elPeso)  elPeso.textContent  = ultimo.peso.toFixed(1) + ' kg';
        if (elImc)   elImc.textContent   = imc.toFixed(1);
        if (elImcCl) { elImcCl.textContent = cls.label; elImcCl.style.color = cls.color; }
        if (elGord)  elGord.textContent  = Math.max(0, gord).toFixed(1) + '%';
        if (elIdeal) elIdeal.textContent = idealMin + '–' + idealMax + ' kg';

        if (marker && markerV) {
            marker.style.left    = pct + '%';
            marker.style.display = 'block';
            markerV.textContent  = imc.toFixed(1);
        }
    } else {
        if (elPeso)  elPeso.textContent  = '—';
        if (elImc)   elImc.textContent   = '—';
        if (elImcCl) elImcCl.textContent = cfg.altura && cfg.idade ? 'Registre um peso' : 'Configure altura e idade';
        if (elGord)  elGord.textContent  = '—';
        if (elIdeal) elIdeal.textContent = cfg.altura ? (() => { const h = cfg.altura/100; return (22*h*h).toFixed(1)+'–'+(24*h*h).toFixed(1)+' kg'; })() : '—';
        if (marker)  marker.style.display = 'none';
    }

    renderPesoMeta();
    renderPesoLog(data);
    renderPesoChart(data);
}

function renderPesoLog(data) {
    const list = document.getElementById('p-log-list');
    if (!list) return;
    list.innerHTML = '';

    if (data.length === 0) {
        list.innerHTML = '<li class="w-log-empty">Nenhum registro ainda.</li>';
        return;
    }

    data.slice().reverse().forEach((entry, revIdx) => {
        const realIdx = data.length - 1 - revIdx;
        const prev    = realIdx > 0 ? data[realIdx - 1].peso : null;
        const diff    = prev !== null ? (entry.peso - prev) : null;
        let diffHtml  = '';
        if (diff !== null) {
            if (diff < 0)      diffHtml = `<span style="color:#1D9E75;font-size:12px;">▼ ${Math.abs(diff).toFixed(1)} kg</span>`;
            else if (diff > 0) diffHtml = `<span style="color:#E24B4A;font-size:12px;">▲ ${diff.toFixed(1)} kg</span>`;
            else               diffHtml = `<span style="color:var(--muted);font-size:12px;">= igual</span>`;
        }

        const li = document.createElement('li');
        li.className = 'w-log-item';
        li.innerHTML = `
            <div class="w-log-item-left">
                <span class="w-log-ml">${entry.peso.toFixed(1)} kg</span>
                <span class="w-log-time">${entry.date}</span>
                ${diffHtml}
            </div>
            <button class="w-log-del" data-idx="${realIdx}">✕</button>
        `;
        li.querySelector('.w-log-del').addEventListener('click', () => {
            const d = getPesoData();
            d.splice(realIdx, 1);
            savePesoData(d);
            renderPeso();
        });
        list.appendChild(li);
    });
}

function renderPesoChart(data) {
    const emptyEl = document.getElementById('p-chart-empty');
    const canvas  = document.getElementById('pesoChart');
    if (!canvas) return;

    if (data.length < 2) {
        canvas.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        if (pesoChart) { pesoChart.destroy(); pesoChart = null; }
        return;
    }

    canvas.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';

    const labels = data.map(e => e.date);
    const values = data.map(e => e.peso);

    if (pesoChart) pesoChart.destroy();

    pesoChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Peso (kg)',
                data: values,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.08)',
                pointBackgroundColor: '#3b82f6',
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(1) + ' kg' } }
            },
            scales: {
                x: { grid: { color: 'rgba(136,135,128,0.15)' }, ticks: { font: { size: 11 }, color: '#888780', maxRotation: 45 } },
                y: { grid: { color: 'rgba(136,135,128,0.15)' }, ticks: { font: { size: 11 }, color: '#888780', callback: v => v + ' kg' } }
            }
        }
    });
}

document.getElementById('p-config-save-btn').addEventListener('click', () => {
    const altura = parseInt(document.getElementById('p-altura').value);
    const idade  = parseInt(document.getElementById('p-idade').value);
    if (!altura || altura < 100 || altura > 250) { alert('Digite uma altura válida (cm)!'); return; }
    if (!idade  || idade  < 10  || idade  > 100) { alert('Digite uma idade válida!'); return; }
    savePesoConfig({ altura, idade });
    renderPeso();
});

document.getElementById('p-add-btn').addEventListener('click', () => {
    const input = document.getElementById('p-peso-input');
    const val   = parseFloat(input.value);
    if (!val || val < 30 || val > 300) { alert('Digite um peso válido!'); return; }

    const data  = getPesoData();
    const today = new Date().toLocaleDateString('pt-BR');

    const existing = data.findIndex(e => e.date === today);
    if (existing >= 0) {
        if (!confirm('Já existe um registro hoje. Deseja substituir?')) return;
        data[existing].peso = val;
    } else {
        data.push({ date: today, peso: val });
    }

    savePesoData(data);
    input.value = '';
    renderPeso();
});

document.getElementById('p-peso-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('p-add-btn').click();
});

document.getElementById('p-media-btn').addEventListener('click', () => {
    const data   = getPesoData();
    const result = document.getElementById('p-media-result');
    if (!result) return;

    if (data.length < 2) {
        result.style.display = 'block';
        result.innerHTML = '<span style="color:var(--muted)">Registre pelo menos 2 pesos para calcular a média.</span>';
        return;
    }

    const ultimos  = data.slice(-7);
    const primeiro = ultimos[0].peso;
    const ultimo   = ultimos[ultimos.length - 1].peso;
    const diff     = ultimo - primeiro;
    const media    = diff / (ultimos.length - 1);
    const dias     = ultimos.length - 1;

    const diffClass  = diff < 0 ? 'p-loss' : diff > 0 ? 'p-gain' : 'p-same';
    const diffSinal  = diff < 0 ? '▼' : diff > 0 ? '▲' : '=';
    const diffLabel  = diff < 0 ? 'perdidos' : diff > 0 ? 'ganhos' : 'sem alteração';
    const mediaLabel = media < 0 ? 'perdendo' : media > 0 ? 'ganhando' : 'estável';

    result.style.display = 'block';
    result.innerHTML = `
        📅 Período: <strong>${ultimos[0].date}</strong> → <strong>${ultimos[ultimos.length-1].date}</strong> (${dias} dia${dias > 1 ? 's' : ''})<br>
        ⚖️ Início: <strong>${primeiro.toFixed(1)} kg</strong> → Atual: <strong>${ultimo.toFixed(1)} kg</strong><br>
        ${diffSinal} Total: <span class="${diffClass}">${Math.abs(diff).toFixed(1)} kg ${diffLabel}</span><br>
        📊 Média: <span class="${diffClass}">${Math.abs(media).toFixed(2)} kg/dia</span> (${mediaLabel})
    `;
});

document.getElementById('p-clear-btn').addEventListener('click', () => {
    if (!confirm('Apagar todo o histórico de peso?')) return;
    savePesoData([]);
    renderPeso();
});

(function loadChartAndRender() {
    if (window.Chart) { renderPeso(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    s.onload = () => renderPeso();
    document.head.appendChild(s);
})();

// ============================================
// DASHBOARD + HÁBITOS + FRASES
// ============================================

const HABITS_KEY = 'habits_data';

const FRASES = [
    // Motivacionais pessoais
    "Disciplina é fazer o que precisa ser feito, mesmo quando não quer. 💪",
    "Pequenas ações consistentes constroem grandes resultados. 🎯",
    "Você está construindo o futuro enquanto cuida do presente. 🚀",
    "Beber água, treinar, estudar. Um dia de cada vez. 💧",
    "A jornada de mil km começa com um passo. Você já está andando. 👣",
    "Consistência bate talento quando o talento não é consistente. 🔥",
    "Engenharia, enfermagem e paternidade — você carrega muito. Descanse quando precisar. 🌙",
    // Estoicismo — Marco Aurélio
    "Você tem poder sobre sua mente, não sobre os eventos externos. Perceba isso e encontrará força. — Marco Aurélio 🏛️",
    "Faça cada ato de sua vida como se fosse o último. — Marco Aurélio 🏛️",
    "A melhor vingança é não ser como o seu inimigo. — Marco Aurélio 🏛️",
    "Perca o tempo que você tem e você perderá o que você não tem. — Marco Aurélio 🏛️",
    "Nunca estime que algo seja do seu interesse se isso o forçar a quebrar uma promessa. — Marco Aurélio 🏛️",
    // Estoicismo — Epicteto
    "Não procure que os eventos que acontecem sejam como você quer, mas deseje os eventos como eles são e encontrará tranquilidade. — Epicteto 🏛️",
    "Temos dois ouvidos e uma boca para que possamos ouvir o dobro do que falamos. — Epicteto 🏛️",
    "É impossível para um homem aprender o que ele acha que já sabe. — Epicteto 🏛️",
    "Não é o que acontece com você, mas como você reage a isso que importa. — Epicteto 🏛️",
    // Estoicismo — Sêneca
    "Não é porque as coisas são difíceis que não ousamos. É porque não ousamos que as coisas são difíceis. — Sêneca 🏛️",
    "Enquanto adiamos, a vida passa. — Sêneca 🏛️",
    "Trate a cada novo dia como um novo começo. — Sêneca 🏛️",
    "Devemos sofrer o que não podemos evitar. — Sêneca 🏛️",
];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia! ☀️';
    if (h < 18) return 'Boa tarde! 🌤️';
    return 'Boa noite! 🌙';
}

function getHabitsData() {
    const raw = localStorage.getItem(HABITS_KEY);
    return raw ? JSON.parse(raw) : {};
}

function saveHabitsData(data) {
    localStorage.setItem(HABITS_KEY, JSON.stringify(data));
}

function getTodayHabits() {
    const data  = getHabitsData();
    const today = new Date().toLocaleDateString('pt-BR');
    return data[today] || {};
}

function saveTodayHabits(habits) {
    const data  = getHabitsData();
    const today = new Date().toLocaleDateString('pt-BR');
    data[today] = habits;
    saveHabitsData(data);
}

function toggleHabit(key) {
    const habits = getTodayHabits();
    habits[key]  = !habits[key];
    saveTodayHabits(habits);
    renderDashboard();
}

function switchTab(tabName) {
    document.querySelectorAll('.side-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(c => c.classList.remove('active'));
    const tab = document.querySelector(`.side-tab[data-tab="${tabName}"]`);
    if (tab) tab.classList.add('active');
    const content = document.getElementById('tab-' + tabName);
    if (content) content.classList.add('active');
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = TAB_TITLES[tabName] || tabName;
}

function renderDashboard() {
    const greetEl = document.getElementById('dash-greeting');
    if (greetEl) {
        const perfil = getPerfil();
        const nome   = perfil.nome ? `, ${perfil.nome.split(' ')[0]}` : '';
        greetEl.textContent = getGreeting().replace('!', nome + '!');
    }

    const dateEl = document.getElementById('dash-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('pt-BR', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
        });
    }

    // contador de dias até fim do ano
    const ycEl = document.getElementById('year-countdown');
    if (ycEl) {
        const now      = new Date();
        const endYear  = new Date(now.getFullYear(), 11, 31);
        const dayOfYear= Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / 86400000);
        const totalDays= now.getFullYear() % 4 === 0 ? 366 : 365;
        const remaining= Math.ceil((endYear - now) / 86400000);
        const pctYear  = Math.round((dayOfYear / totalDays) * 100);
        ycEl.innerHTML = `
            <span class="yc-icon">⏳</span>
            <div class="yc-body">
                <div class="yc-days">${remaining} dias</div>
                <div class="yc-label">restam até o fim de ${now.getFullYear()} · ${pctYear}% do ano passou</div>
                <div class="yc-bar-wrap"><div class="yc-bar" style="width:${pctYear}%"></div></div>
            </div>
        `;
    }

    const quoteEl = document.getElementById('dash-quote');
    if (quoteEl) {
        const idx = new Date().getDate() % FRASES.length;
        quoteEl.textContent = FRASES[idx];
    }

    const streakEl = document.getElementById('dash-streak');
    if (streakEl) {
        const data  = getHabitsData();
        let streak  = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toLocaleDateString('pt-BR');
            const h   = data[key] || {};
            if (Object.values(h).some(v => v)) streak++;
            else if (i > 0) break;
        }
        streakEl.textContent = streak > 0 ? `🔥 ${streak} dia${streak > 1 ? 's' : ''} seguido${streak > 1 ? 's' : ''}` : '🎯 Comece hoje!';
    }

    const meta  = getWaterMeta();
    const total = getTodayTotal();
    const pct   = Math.min(100, Math.round((total / meta) * 100));
    const aguaVal = document.getElementById('dc-agua-val');
    const aguaBar = document.getElementById('dc-agua-bar');
    const aguaSub = document.getElementById('dc-agua-sub');
    if (aguaVal) aguaVal.textContent = total.toLocaleString('pt-BR') + ' ml';
    if (aguaBar) { aguaBar.style.width = pct + '%'; aguaBar.classList.toggle('done', pct >= 100); }
    if (aguaSub) aguaSub.textContent = pct + '% da meta (' + meta.toLocaleString('pt-BR') + ' ml)';

    const pesoData = getPesoData();
    const today    = new Date().toLocaleDateString('pt-BR');
    const pesoHoje = pesoData.find(e => e.date === today);
    const pesoVal  = document.getElementById('dc-peso-val');
    const pesoSub  = document.getElementById('dc-peso-sub');
    if (pesoHoje) {
        if (pesoVal) pesoVal.textContent = pesoHoje.peso.toFixed(1) + ' kg';
        const prev = pesoData.length > 1 ? pesoData[pesoData.length - 2] : null;
        if (pesoSub && prev && prev.date !== today) {
            const diff = pesoHoje.peso - prev.peso;
            if (diff < 0)      pesoSub.innerHTML = `<span style="color:#1D9E75">▼ ${Math.abs(diff).toFixed(1)} kg desde ontem</span>`;
            else if (diff > 0) pesoSub.innerHTML = `<span style="color:#E24B4A">▲ ${diff.toFixed(1)} kg desde ontem</span>`;
            else               pesoSub.textContent = '= igual ao último';
        } else if (pesoSub) {
            pesoSub.textContent = 'Registrado hoje';
        }
    } else {
        if (pesoVal) pesoVal.textContent = '—';
        if (pesoSub) pesoSub.textContent = 'Toque para registrar';
    }

    renderWeeklyReport();

    const habits = getTodayHabits();
    ['treino','estudo','sono','hidratacao','alimentacao','produtividade'].forEach(key => {
        const item  = document.getElementById('hab-' + key);
        const check = document.getElementById('hc-' + key);
        if (item)  item.classList.toggle('done', !!habits[key]);
        if (check) check.textContent = habits[key] ? '✓' : '○';
    });

    renderDashTasks();
}

function renderDashTasks() {
    const container = document.getElementById('dash-tasks');
    if (!container) return;

    const today = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const dayBlocks = document.querySelectorAll('#daysContainer .day-block');
    let todayBlock  = null;
    dayBlocks.forEach(block => {
        const title = block.querySelector('.day-title');
        if (title && title.innerText.toLowerCase() === today.toLowerCase()) {
            todayBlock = block;
        }
    });

    if (!todayBlock) {
        container.innerHTML = '<div class="dash-empty">Nenhuma rotina gerada para hoje.<br>Vá até a aba Rotina e gere os dias.</div>';
        return;
    }

    let html = '', hasItems = false;

    todayBlock.querySelectorAll('.period').forEach(period => {
        const items = period.querySelectorAll('li');
        const validItems = Array.from(items).filter(li => {
            const text = li.querySelector('.item-text');
            return text && !text.classList.contains('placeholder') && text.innerText !== 'Digite aqui...';
        });

        if (validItems.length === 0) return;
        hasItems = true;

        html += `<div class="dash-task-period">${period.dataset.periodName}</div>`;
        validItems.forEach(li => {
            const checked = li.querySelector('input[type="checkbox"]').checked;
            const text    = li.querySelector('.item-text').innerText;
            html += `
                <div class="dash-task-item ${checked ? 'done' : ''}">
                    <input type="checkbox" ${checked ? 'checked' : ''} disabled>
                    ${text}
                </div>`;
        });
    });

    container.innerHTML = hasItems ? html : '<div class="dash-empty">Nenhuma tarefa adicionada para hoje.</div>';
}

renderDashboard();

// side-tab navigation handles dashboard refresh above

// ============================================
// 1. GERAR DIAS
// ============================================

document.getElementById('generateDays').addEventListener('click', () => {
    const startValue = document.getElementById('startDate').value;
    const endValue   = document.getElementById('endDate').value;

    if (!startValue || !endValue) { alert("Selecione as duas datas."); return; }

    const start = new Date(startValue + "T00:00:00");
    const end   = new Date(endValue   + "T00:00:00");

    if (start > end) { alert("A data inicial não pode ser maior que a final."); return; }

    const container = document.getElementById('daysContainer');

    if (container.innerHTML.trim() !== "") {
        if (!confirm("Você já tem uma rotina! Deseja apagar tudo e criar uma nova?")) return;
    }

    container.innerHTML = "";

    let current = new Date(start);
    while (current <= end) {
        const dateString = current.toLocaleDateString('pt-BR', {
            weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
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
    const dayDiv    = document.createElement('div');
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
// 3. ADICIONAR ITEM
// ============================================

function addDynamicItem(button, text = "", checked = false) {
    const period = button.closest('.period');
    const ul     = period.querySelector('ul');

    const li = document.createElement('li');
    li.draggable = true;
    li.innerHTML = `
        <span class="drag-handle" title="Arrastar para reordenar">⠿</span>
        <input type="checkbox" ${checked ? 'checked' : ''}>
        <span class="item-text ${!text ? 'placeholder' : ''}" contenteditable="true">${text || "Digite aqui..."}</span>
        <button class="delete-item-btn" style="margin-left:auto; opacity:0.3; border:none; background:none; color:inherit; cursor:pointer;">✕</button>
    `;

    const span    = li.querySelector('.item-text');
    const checkbox = li.querySelector('input');
    const handle  = li.querySelector('.drag-handle');

    if (checked) span.style.textDecoration = "line-through";

    span.addEventListener('focus', () => {
        if (span.classList.contains('placeholder')) { span.innerText = ""; span.classList.remove('placeholder'); }
    });

    span.addEventListener('blur', () => {
        if (span.innerText.trim() === "") { span.innerText = "Digite aqui..."; span.classList.add('placeholder'); }
        saveAll();
    });

    span.addEventListener('input', saveAll);

    checkbox.addEventListener('change', () => {
        span.style.textDecoration = checkbox.checked ? "line-through" : "none";
        saveAll();
    });

    li.querySelector('.delete-item-btn').addEventListener('click', () => { li.remove(); saveAll(); });

    span.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addDynamicItem(button); }
    });

    // Drag mouse
    li.addEventListener('dragstart', (e) => {
        if (!e.target.closest('.drag-handle') && e.target !== handle) { e.preventDefault(); return; }
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
        if (e.clientY < midY) ul.insertBefore(dragging, li);
        else                   ul.insertBefore(dragging, li.nextSibling);
    });

    li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
    li.addEventListener('drop', (e) => { e.preventDefault(); li.classList.remove('drag-over'); });

    // Touch drag
    let touchDragging = null, touchClone = null, touchOffsetY = 0;

    handle.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        touchDragging = li;
        touchOffsetY  = touch.clientY - li.getBoundingClientRect().top;
        touchClone = li.cloneNode(true);
        touchClone.style.cssText = `position:fixed;z-index:9999;left:${li.getBoundingClientRect().left}px;width:${li.offsetWidth}px;opacity:.85;pointer-events:none;background:var(--card-hover);border-radius:6px;padding:6px 4px;`;
        document.body.appendChild(touchClone);
        li.classList.add('dragging');
        e.preventDefault();
    }, { passive: false });

    handle.addEventListener('touchmove', (e) => {
        if (!touchDragging) return;
        const touch = e.touches[0];
        touchClone.style.top = `${touch.clientY - touchOffsetY}px`;
        const elements = ul.querySelectorAll('li:not(.dragging)');
        elements.forEach(el => el.classList.remove('drag-over'));
        let target = null;
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) target = el;
        });
        if (target) {
            target.classList.add('drag-over');
            const rect = target.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (touch.clientY < midY) ul.insertBefore(touchDragging, target);
            else                       ul.insertBefore(touchDragging, target.nextSibling);
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
                    items.push({ text: text, checked: li.querySelector('input').checked });
                }
            });
            dayData.periods.push({ name: period.dataset.periodName, items: items });
        });

        days.push(dayData);
    });

    localStorage.setItem('my_routine_data', JSON.stringify({
        pageTitle: document.getElementById('pageTitle').innerText,
        weight: document.getElementById('weightInput').value,
        days: days
    }));
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
            periodData.items.forEach(item => addDynamicItem(btn, item.text, item.checked));
        });
    });
}

// ============================================
// 5. CALCULADORA DE ÁGUA
// ============================================

document.getElementById('calcWater').addEventListener('click', () => {
    const weight = parseFloat(document.getElementById('weightInput').value);
    if (!weight || weight <= 0) { alert("Digite um peso válido!"); return; }
    const liters = ((weight * 35) / 1000).toFixed(2);
    document.getElementById('waterResult').innerText = `💧 Beba pelo menos ${liters}L de água por dia!`;
    saveAll();
});

// ============================================
// 6. TÍTULO
// ============================================

document.getElementById('pageTitle').addEventListener('input', () => {
    const el  = document.getElementById('pageTitle');
    const max = parseInt(el.dataset.maxlength);
    if (el.innerText.length > max) {
        el.innerText = el.innerText.substring(0, max);
        const range = document.createRange();
        const sel   = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    saveAll();
});

// ============================================
// 7. DATAS
// ============================================

function configurarDatas() {
    const startInput = document.getElementById('startDate');
    const endInput   = document.getElementById('endDate');

    const hoje      = new Date();
    const offset    = hoje.getTimezoneOffset();
    const hojeLocal = new Date(hoje.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

    startInput.min = hojeLocal;
    endInput.min   = hojeLocal;

    startInput.addEventListener('change', () => {
        if (startInput.value) {
            if (startInput.value < hojeLocal) { alert("Você não pode selecionar uma data no passado!"); startInput.value = hojeLocal; }
            endInput.min = startInput.value;
            if (endInput.value && endInput.value < startInput.value) endInput.value = startInput.value;
        }
        saveAll();
    });

    endInput.addEventListener('change', () => {
        if (endInput.value) {
            if (endInput.value < hojeLocal) { alert("A data final não pode ser no passado!"); endInput.value = hojeLocal; }
            if (startInput.value && endInput.value < startInput.value) { alert("A data final não pode ser anterior à data inicial!"); endInput.value = startInput.value; }
        }
        saveAll();
    });
}

configurarDatas();

// ============================================
// 8. RESET
// ============================================

document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('⚠️ Isso vai apagar SOMENTE sua rotina (os dias e tarefas gerados).\n\nSeus dados de água, peso, macros, hábitos e perfil NÃO serão apagados.\n\nDeseja continuar?')) {
        localStorage.removeItem('my_routine_data');
        location.reload();
    }
});


// ============================================
// ESTATÍSTICAS (30 dias)
// ============================================

let statsAguaChart = null, statsPesoChart = null, statsMacrosChart = null;

function getLast30Days() {
    const days = [];
    const hoje = new Date();
    for (let i = 29; i >= 0; i--) {
        const d = new Date(hoje);
        d.setDate(hoje.getDate() - i);
        days.push(d.toLocaleDateString('pt-BR'));
    }
    return days;
}

function renderStats() {
    if (!window.Chart) {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
        s.onload = () => renderStats();
        document.head.appendChild(s);
        return;
    }

    const days    = getLast30Days();
    const wData   = getWaterData();
    const pData   = getPesoData();
    const hData   = getHabitsData();
    const mData   = getMacrosData();
    const wMeta   = getWaterMeta();

    // --- ÁGUA ---
    const aguaVals = days.map(d => {
        const entries = wData[d] || [];
        return entries.reduce((s, e) => s + e.ml, 0);
    });
    const mediaAgua = Math.round(aguaVals.reduce((s,v) => s+v, 0) / aguaVals.filter(v=>v>0).length) || 0;
    const diasMetaAgua = aguaVals.filter(v => v >= wMeta).length;

    const stAguaMedia = document.getElementById('st-agua-media');
    const stAguaSub   = document.getElementById('st-agua-sub');
    if (stAguaMedia) stAguaMedia.textContent = mediaAgua > 0 ? mediaAgua.toLocaleString('pt-BR') + ' ml' : '—';
    if (stAguaSub)   stAguaSub.textContent   = diasMetaAgua + ' dias bateu a meta';

    const aguaCtx = document.getElementById('statsAguaChart');
    if (aguaCtx) {
        if (statsAguaChart) statsAguaChart.destroy();
        statsAguaChart = new Chart(aguaCtx, {
            type: 'bar',
            data: {
                labels: days.map(d => d.split('/').slice(0,2).join('/')),
                datasets: [{
                    data: aguaVals,
                    backgroundColor: aguaVals.map(v => v >= wMeta ? 'rgba(29,158,117,0.7)' : 'rgba(59,130,246,0.5)'),
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y.toLocaleString('pt-BR') + ' ml' } } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#888', maxRotation: 45, autoSkip: true, maxTicksLimit: 10 } },
                    y: { grid: { color: 'rgba(136,135,128,0.15)' }, ticks: { font: { size: 10 }, color: '#888', callback: v => v >= 1000 ? (v/1000).toFixed(1)+'L' : v+'ml' } }
                }
            }
        });
    }

    // --- PESO ---
    const pesoRecent = pData.filter(e => {
        const [d,m,y] = e.date.split('/');
        return new Date(y,m-1,d) >= new Date(new Date().setDate(new Date().getDate()-29));
    });

    const stPesoVar = document.getElementById('st-peso-var');
    const stPesoSub = document.getElementById('st-peso-sub');
    if (pesoRecent.length >= 2) {
        const varPeso = (pesoRecent[pesoRecent.length-1].peso - pesoRecent[0].peso).toFixed(1);
        if (stPesoVar) {
            stPesoVar.textContent = (parseFloat(varPeso) > 0 ? '+' : '') + varPeso + ' kg';
            stPesoVar.style.color = parseFloat(varPeso) < 0 ? '#1D9E75' : parseFloat(varPeso) > 0 ? '#ef4444' : 'var(--text)';
        }
        if (stPesoSub) stPesoSub.textContent = pesoRecent[0].peso.toFixed(1) + ' → ' + pesoRecent[pesoRecent.length-1].peso.toFixed(1) + ' kg';
    } else {
        if (stPesoVar) stPesoVar.textContent = '—';
        if (stPesoSub) stPesoSub.textContent = 'poucos registros';
    }

    const pesoCvsEl  = document.getElementById('statsPesoChart');
    const pesoEmpty  = document.getElementById('st-peso-empty');
    if (pesoCvsEl) {
        if (pesoRecent.length >= 2) {
            pesoCvsEl.style.display = 'block';
            if (pesoEmpty) pesoEmpty.style.display = 'none';
            if (statsPesoChart) statsPesoChart.destroy();
            statsPesoChart = new Chart(pesoCvsEl, {
                type: 'line',
                data: {
                    labels: pesoRecent.map(e => e.date.split('/').slice(0,2).join('/')),
                    datasets: [{ data: pesoRecent.map(e => e.peso), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', pointRadius: 4, borderWidth: 2, tension: 0.3, fill: true }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(1) + ' kg' } } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#888' } },
                        y: { grid: { color: 'rgba(136,135,128,0.15)' }, ticks: { font: { size: 10 }, color: '#888', callback: v => v + ' kg' } }
                    }
                }
            });
        } else {
            pesoCvsEl.style.display = 'none';
            if (pesoEmpty) pesoEmpty.style.display = 'block';
        }
    }

    // --- HÁBITOS ---
    const habitKeys = ['treino','estudo','sono','hidratacao','alimentacao','produtividade'];
    let totalH = 0, doneH = 0;
    const heatmap = document.getElementById('stats-habits-heatmap');
    if (heatmap) {
        heatmap.innerHTML = '';
        days.forEach(d => {
            const h = hData[d] || {};
            const count = habitKeys.filter(k => h[k]).length;
            totalH += habitKeys.length;
            doneH  += count;
            const cell = document.createElement('div');
            cell.className = 'hm-cell';
            cell.dataset.level = count === 0 ? '0' : count <= 2 ? '1' : count <= 4 ? '2' : '3';
            cell.title = d + ': ' + count + ' hábitos';
            heatmap.appendChild(cell);
        });
    }
    const pctH = totalH > 0 ? Math.round((doneH/totalH)*100) : 0;
    const stHPct = document.getElementById('st-habitos-pct');
    const stHSub = document.getElementById('st-habitos-sub');
    if (stHPct) stHPct.textContent = pctH + '%';
    if (stHSub) stHSub.textContent = doneH + ' de ' + totalH + ' hábitos';

    // --- MACROS ---
    const kcalVals = days.map(d => {
        const entries = mData[d] || [];
        return entries.reduce((s, e) => s + e.kcal, 0);
    });
    const diasComKcal = kcalVals.filter(v => v > 0).length;
    const mediaKcal   = diasComKcal > 0 ? Math.round(kcalVals.reduce((s,v) => s+v, 0) / diasComKcal) : 0;

    const stKcal = document.getElementById('st-kcal-media');
    const stKSub = document.getElementById('st-kcal-sub');
    if (stKcal) stKcal.textContent = mediaKcal > 0 ? mediaKcal.toLocaleString('pt-BR') + ' kcal' : '—';
    if (stKSub) stKSub.textContent = diasComKcal + ' dias com registro';

    const macroCtx = document.getElementById('statsMacrosChart');
    if (macroCtx) {
        if (statsMacrosChart) statsMacrosChart.destroy();
        statsMacrosChart = new Chart(macroCtx, {
            type: 'bar',
            data: {
                labels: days.map(d => d.split('/').slice(0,2).join('/')),
                datasets: [{
                    data: kcalVals,
                    backgroundColor: 'rgba(245,197,24,0.6)',
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y + ' kcal' } } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#888', maxRotation: 45, autoSkip: true, maxTicksLimit: 10 } },
                    y: { grid: { color: 'rgba(136,135,128,0.15)' }, ticks: { font: { size: 10 }, color: '#888', callback: v => v + ' kcal' } }
                }
            }
        });
    }
}

// ============================================
// 9. INICIALIZAR
// ============================================

loadAll();