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

// abre modal automaticamente se não tem perfil ainda
(function checkPerfil() {
    const p = getPerfil();
    if (!p.nome) setTimeout(showPerfilModal, 800);
})();

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
    if (imc < 25)   return { label: 'Normal', color: '#97C459' };
    if (imc < 30)   return { label: 'Sobrepeso', color: '#FAC775' };
    if (imc < 35)   return { label: 'Obesidade I', color: '#EF9F27' };
    return               { label: 'Obesidade II+', color: '#F09595' };
}

function calcGordura(imc, idade) {
    // Fórmula Deurenberg para homens: (1.20 × IMC) + (0.23 × idade) − 10.8 − 5.4
    return (1.20 * imc) + (0.23 * idade) - 10.8 - 5.4;
}

function imcToBarPct(imc) {
    // mapeia IMC 15–40 para 0–100%
    const min = 15, max = 40;
    return Math.min(100, Math.max(0, ((imc - min) / (max - min)) * 100));
}

let pesoChart = null;

function renderPeso() {
    const data   = getPesoData();
    const cfg    = getPesoConfig();

    // preenche inputs salvos
    if (cfg.altura) document.getElementById('p-altura').value = cfg.altura;
    if (cfg.idade)  document.getElementById('p-idade').value  = cfg.idade;

    const ultimo = data.length > 0 ? data[data.length - 1] : null;

    // cards
    const elPeso  = document.getElementById('pc-peso');
    const elImc   = document.getElementById('pc-imc');
    const elImcCl = document.getElementById('pc-imc-class');
    const elGord  = document.getElementById('pc-gord');
    const elIdeal = document.getElementById('pc-ideal');
    const marker  = document.getElementById('imc-marker');
    const markerV = document.getElementById('imc-marker-val');

    if (ultimo && cfg.altura && cfg.idade) {
        const imc     = calcIMC(ultimo.peso, cfg.altura);
        const cls     = classifyIMC(imc);
        const gord    = calcGordura(imc, cfg.idade);
        const h       = cfg.altura / 100;
        const idealMin = (22 * h * h).toFixed(1);
        const idealMax = (24 * h * h).toFixed(1);
        const pct     = imcToBarPct(imc);

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

    // histórico
    renderPesoLog(data);

    // gráfico
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
                tooltip: {
                    callbacks: {
                        label: ctx => ctx.parsed.y.toFixed(1) + ' kg'
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(136,135,128,0.15)' },
                    ticks: { font: { size: 11 }, color: '#888780', maxRotation: 45 }
                },
                y: {
                    grid: { color: 'rgba(136,135,128,0.15)' },
                    ticks: { font: { size: 11 }, color: '#888780', callback: v => v + ' kg' }
                }
            }
        }
    });
}

// salvar config
document.getElementById('p-config-save-btn').addEventListener('click', () => {
    const altura = parseInt(document.getElementById('p-altura').value);
    const idade  = parseInt(document.getElementById('p-idade').value);
    if (!altura || altura < 100 || altura > 250) { alert('Digite uma altura válida (cm)!'); return; }
    if (!idade  || idade  < 10  || idade  > 100) { alert('Digite uma idade válida!'); return; }
    savePesoConfig({ altura, idade });
    renderPeso();
});

// adicionar peso
document.getElementById('p-add-btn').addEventListener('click', () => {
    const input = document.getElementById('p-peso-input');
    const val   = parseFloat(input.value);
    if (!val || val < 30 || val > 300) { alert('Digite um peso válido!'); return; }

    const data  = getPesoData();
    const today = new Date().toLocaleDateString('pt-BR');

    // atualiza se já tem registro hoje
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

// média semanal
document.getElementById('p-media-btn').addEventListener('click', () => {
    const data    = getPesoData();
    const result  = document.getElementById('p-media-result');
    if (!result) return;

    if (data.length < 2) {
        result.style.display = 'block';
        result.innerHTML = '<span style="color:var(--muted)">Registre pelo menos 2 pesos para calcular a média.</span>';
        return;
    }

    // pega últimos 7 dias com registro
    const ultimos = data.slice(-7);
    const primeiro = ultimos[0].peso;
    const ultimo   = ultimos[ultimos.length - 1].peso;
    const diff     = ultimo - primeiro;
    const media    = diff / (ultimos.length - 1);
    const dias     = ultimos.length - 1;

    let diffClass = diff < 0 ? 'p-loss' : diff > 0 ? 'p-gain' : 'p-same';
    let diffSinal = diff < 0 ? '▼' : diff > 0 ? '▲' : '=';
    let diffLabel = diff < 0 ? 'perdidos' : diff > 0 ? 'ganhos' : 'sem alteração';
    let mediaLabel = media < 0 ? 'perdendo' : media > 0 ? 'ganhando' : 'estável';

    result.style.display = 'block';
    result.innerHTML = `
        📅 Período: <strong>${ultimos[0].date}</strong> → <strong>${ultimos[ultimos.length-1].date}</strong> (${dias} dia${dias > 1 ? 's' : ''})<br>
        ⚖️ Início: <strong>${primeiro.toFixed(1)} kg</strong> → Atual: <strong>${ultimo.toFixed(1)} kg</strong><br>
        ${diffSinal} Total: <span class="${diffClass}">${Math.abs(diff).toFixed(1)} kg ${diffLabel}</span><br>
        📊 Média: <span class="${diffClass}">${Math.abs(media).toFixed(2)} kg/dia</span> (${mediaLabel})
    `;
});

// limpar tudo
document.getElementById('p-clear-btn').addEventListener('click', () => {
    if (!confirm('Apagar todo o histórico de peso?')) return;
    savePesoData([]);
    renderPeso();
});

// carrega Chart.js e renderiza
(function loadChartAndRender() {
    if (window.Chart) { renderPeso(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    s.onload = () => renderPeso();
    document.head.appendChild(s);
})();

// ============================================

const HABITS_KEY = 'habits_data';

const FRASES = [
    "Disciplina é fazer o que precisa ser feito, mesmo quando não quer. 💪",
    "Cada plantão é uma prova de força. Cada treino também. 🏋️",
    "O José vai crescer vendo um pai que não desiste. 👶",
    "Pequenas ações consistentes constroem grandes resultados. 🎯",
    "Você está construindo o futuro enquanto cuida do presente. 🚀",
    "Engenharia, enfermagem e paternidade — você carrega muito. Descanse quando precisar. 🌙",
    "Beber água, treinar, estudar. Um dia de cada vez. 💧",
    "A jornada de mil km começa com um passo. Você já está andando. 👣",
    "Consistência bate talento quando o talento não é consistente. 🔥",
    "Seu filho vai perguntar um dia o que você fez quando foi difícil. 👨‍👦",
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
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(c => c.classList.remove('active'));
    const tab = document.querySelector(`[data-tab="${tabName}"]`);
    if (tab) tab.classList.add('active');
    const content = document.getElementById('tab-' + tabName);
    if (content) content.classList.add('active');
}

function renderDashboard() {
    // saudação
    const greetEl = document.getElementById('dash-greeting');
    if (greetEl) {
        const perfil = getPerfil();
        const nome   = perfil.nome ? `, ${perfil.nome.split(' ')[0]}` : '';
        greetEl.textContent = getGreeting().replace('!', nome + '!');
    }

    // data
    const dateEl = document.getElementById('dash-date');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('pt-BR', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
        });
    }

    // frase do dia (muda uma vez por dia baseado na data)
    const quoteEl = document.getElementById('dash-quote');
    if (quoteEl) {
        const idx = new Date().getDate() % FRASES.length;
        quoteEl.textContent = FRASES[idx];
    }

    // streak (dias consecutivos com hábitos)
    const streakEl = document.getElementById('dash-streak');
    if (streakEl) {
        const data = getHabitsData();
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toLocaleDateString('pt-BR');
            const h = data[key] || {};
            if (Object.values(h).some(v => v)) streak++;
            else if (i > 0) break;
        }
        streakEl.textContent = streak > 0 ? `🔥 ${streak} dia${streak > 1 ? 's' : ''} seguido${streak > 1 ? 's' : ''}` : '🎯 Comece hoje!';
    }

    // card água
    const meta  = getWaterMeta();
    const total = getTodayTotal();
    const pct   = Math.min(100, Math.round((total / meta) * 100));
    const aguaVal = document.getElementById('dc-agua-val');
    const aguaBar = document.getElementById('dc-agua-bar');
    const aguaSub = document.getElementById('dc-agua-sub');
    if (aguaVal) aguaVal.textContent = total.toLocaleString('pt-BR') + ' ml';
    if (aguaBar) { aguaBar.style.width = pct + '%'; aguaBar.classList.toggle('done', pct >= 100); }
    if (aguaSub) aguaSub.textContent = pct + '% da meta (' + meta.toLocaleString('pt-BR') + ' ml)';

    // card peso
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

    // hábitos
    const habits = getTodayHabits();
    ['treino','estudo','sono','hidratacao','alimentacao','produtividade'].forEach(key => {
        const item = document.getElementById('hab-' + key);
        const check = document.getElementById('hc-' + key);
        if (item)  item.classList.toggle('done', !!habits[key]);
        if (check) check.textContent = habits[key] ? '✓' : '○';
    });

    // tarefas de hoje da rotina
    renderDashTasks();
}

function renderDashTasks() {
    const container = document.getElementById('dash-tasks');
    if (!container) return;

    const today = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    });

    // procura o bloco do dia de hoje
    const dayBlocks = document.querySelectorAll('#daysContainer .day-block');
    let todayBlock = null;
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

    let html = '';
    let hasItems = false;

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

// render inicial do dashboard
renderDashboard();

// atualiza dashboard quando muda de aba
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        if (tab.dataset.tab === 'dashboard') {
            setTimeout(renderDashboard, 50);
        }
    });
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
// DASHBOARD
// ============================================
// 9. INICIALIZAR
// ============================================

loadAll();