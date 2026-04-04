# Minha Rotina

Organizador de rotina pessoal com foco em saúde, produtividade e hábitos diários. Desenvolvido como PWA (Progressive Web App) com HTML, CSS e JavaScript puro — sem frameworks ou dependências externas além do Chart.js para gráficos.

Acesse: https://daniel-mscs.github.io/minha-rotina/

---

## Funcionalidades

**Dashboard (Início)**
- Saudação personalizada com nome do usuário e horário do dia
- Frase motivacional e estoica diária (20 frases, muda uma vez por dia)
- Cards de resumo: consumo de água e peso do dia com variação
- Hábitos diários com marcação por toque (Treino, Estudo, Sono, Hidratação, Alimentação, Produtividade)
- Streak de dias consecutivos de uso
- Relatório semanal automático todo sábado (água, peso, hábitos, calorias)
- Tarefas de hoje integradas com a aba Rotina

**Rotina**
- Geração de blocos de dias por intervalo de datas
- 4 períodos por dia: Acordar, Manhã, Tarde e Noite
- Tarefas editáveis inline com checkbox de conclusão
- Drag and drop para reordenar tarefas (desktop e mobile touch)
- Atalho Enter para criação rápida de itens
- Reset seguro que apaga apenas a rotina, preservando todos os outros dados

**Controle de Água**
- Meta diária personalizável (padrão: peso × 35 ml)
- Botões rápidos: 180ml, 300ml, 500ml e 1000ml
- Campo manual para qualquer volume
- Barra de progresso (azul → verde ao atingir a meta)
- Log do dia com horário de cada registro
- Histórico dos últimos 7 dias

**Controle de Peso**
- Registro diário com comparação ao dia anterior
- Cálculo de IMC com barra visual de classificação
- Estimativa de gordura corporal (Fórmula de Deurenberg)
- Meta de peso com projeção de data baseada na média atual
- Gráfico de linha com evolução do peso
- Média semanal de perda ou ganho

**Controle de Macros**
- Tabela com 35 alimentos pré-cadastrados com busca por autocomplete
- Cálculo automático de kcal, proteína, carboidrato e gordura por grama
- Preview dos macros antes de confirmar o registro
- Meta calórica diária personalizável
- Cards de resumo atualizados em tempo real
- Log do dia com opção de excluir registros individuais

**Geral**
- Perfil do usuário (nome, sexo biológico, idade)
- Tema claro e escuro com persistência entre sessões
- Exportação para PDF
- Salvamento automático via localStorage
- Instalável como app (PWA) no Android e iOS
- Funciona offline após primeira visita

---

## Alimentos cadastrados nos Macros

Carboidratos: arroz branco, arroz integral, batata doce, batata inglesa, batata frita, macarrão, pão francês, aveia, feijão, lentilha

Proteínas: frango (peito e coxa), carne bovina, carne moída, tilápia, salmão, atum, sardinha, ovo inteiro, clara de ovo, whey protein, iogurte grego, queijo cottage

Laticínios: leite em pó integral, leite desnatado

Frutas: banana, maçã, laranja, mamão

Gorduras: azeite de oliva, amendoim, castanha do pará

Vegetais: salada, tomate, brócolis, cenoura

---

## Tecnologias

- HTML5
- CSS3 com variáveis para temas claro/escuro
- JavaScript ES6+ sem frameworks
- localStorage para persistência de dados
- Service Worker para funcionamento offline
- Web App Manifest para instalação como PWA
- Chart.js para gráfico de evolução do peso
- GitHub Pages para hospedagem

---

## Estrutura do projeto

```
├── index.html       — estrutura e abas
├── style.css        — estilos e temas
├── script.js        — lógica e persistência
├── manifest.json    — configurações do PWA
└── sw.js            — service worker (offline)
```

---

## Dados salvos (localStorage)

| Chave | Conteúdo |
|---|---|
| `my_routine_data` | Rotina (dias e tarefas) |
| `water_data` | Registros de água por data |
| `water_meta` | Meta diária de água |
| `peso_data` | Registros de peso por data |
| `peso_config` | Altura e idade |
| `peso_meta` | Meta de peso alvo |
| `macros_data` | Registros de alimentos por data |
| `macros_meta` | Meta calórica diária |
| `habits_data` | Hábitos por data |
| `user_perfil` | Nome, sexo e idade |
| `tema` | Preferência de tema |

---

## Como instalar como app

**Android (Chrome):** três pontinhos no menu → Instalar aplicativo

**iPhone (Safari):** botão compartilhar → Adicionar à Tela de Início

---

## Como rodar localmente

Basta abrir o `index.html` no navegador ou usar o Live Server do VS Code.

---

Desenvolvido por [Daniel](https://github.com/daniel-mscs) — v4.0