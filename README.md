# Minha Rotina - PWA

Organizador de rotina pessoal focado em saúde, produtividade e monitoramento de hábitos. Desenvolvido como um Progressive Web App (PWA) de alta performance, utilizando tecnologias web nativas para garantir leveza, privacidade e funcionamento offline.

Acesse o projeto: [https://daniel-mscs.github.io/minha-rotina/](https://daniel-mscs.github.io/minha-rotina/)

---

## Atualizações de Implementação (v5.0)

### Interface de Navegação
- **Sistema de Menu Lateral:** Substituição da barra de navegação superior por uma topbar minimalista e menu lateral retrátil (sidebar).
- **UX Adaptativa:** O menu centraliza navegação principal, configurações de perfil, alternância de tema e exportação de dados, otimizando o espaço de tela em dispositivos móveis.

### Monitoramento de Ciclo Anual
- **Contador Regressivo:** Implementação de dashboard com dias restantes para o encerramento do ciclo anual.
- **Visualização de Progresso:** Indicador percentual de conclusão do ano com barra de progresso em estilo dourado (Memento Mori digital).

### Módulo de Estatísticas
- **Análise Reativa:** Aba dedicada com análise dos últimos 30 dias de dados.
- **Visualização de Dados:** Integração avançada com Chart.js para:
    - Balanço hídrico com diferenciação visual de metas atingidas.
    - Evolução temporal de peso e composição corporal.
    - Heatmap de consistência de hábitos diários.
    - Monitoramento de balanço calórico.

---

## Funcionalidades Detalhadas

### Gestão de Rotina e Tarefas
- **Estrutura por Períodos:** Planejamento dividido em Acordar, Manhã, Tarde e Noite.
- **Interatividade:** Suporte a edição inline e sistema de Drag and Drop para reordenamento de tarefas em desktop e dispositivos touch.
- **Persistência de Dados:** Sincronização em tempo real com o armazenamento local do navegador.

### Saúde e Composição Corporal
- **Antropometria:** Cálculo automatizado de IMC e estimativa de percentual de gordura via Fórmula de Deurenberg.
- **Hidratação:** Gestão de meta diária personalizada baseada em massa corporal e registro de histórico com marcação temporal.
- **Nutrição:** Registro de macronutrientes com base de dados interna de +35 alimentos e suporte a busca por autocomplete.

### Sistema PWA e Segurança
- **Funcionamento Offline:** Service Workers configurados para cache de ativos e funcionamento sem conexão à rede.
- **Instalação Nativa:** Manifesto configurado para instalação em sistemas Android e iOS.
- **Privacidade:** Todos os dados são processados e armazenados localmente (localStorage), sem tráfego de informações pessoais para servidores externos.

---

## Especificações Técnicas

- **Linguagens:** HTML5, CSS3 (Custom Properties), JavaScript ES6+.
- **Dependências Externas:** Chart.js (via CDN).
- **Hospedagem:** GitHub Pages.
- **Padrão de Design:** Interface minimalista com suporte nativo a temas Light/Dark.

---

## Estrutura de Arquivos

```text
├── index.html       — Estrutura semântica e containers das views
├── style.css        — Definições de estilo, temas e animações de transição
├── script.js        — Lógica de negócio, manipulação de DOM e gráficos
├── manifest.json    — Configurações de aplicação instalável
└── sw.js            — Estratégias de cache e service worker
---

## Dicionário de Armazenamento (localStorage)

| Chave | Descrição do Dado |
| :--- | :--- |
| `my_routine_data` | Estrutura de tarefas e blocos diários |
| `water_data` | Histórico cronológico de consumo hídrico |
| `peso_data` | Registros históricos de massa corporal |
| `macros_data` | Log de ingestão de macronutrientes |
| `habits_data` | Matriz de consistência de hábitos (Heatmap) |
| `user_perfil` | Metadados do usuário (Nome, Sexo, Idade) |

---

## Instalação e Execução

#### Como Web App
- **Android (Chrome):** Menu de opções -> Instalar aplicativo.
- **iOS (Safari):** Botão compartilhar -> Adicionar à Tela de Início.

#### Ambiente de Desenvolvimento
Para execução local, recomenda-se o uso de um servidor estático simples ou a extensão Live Server (VS Code) para garantir o funcionamento correto do Service Worker e das rotas internas de manifesto.

---

Desenvolvido por [Daniel](https://github.com/daniel-mscs) — Versão 5.0