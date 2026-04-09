/**
 * app.js — Controlador Principal da Aplicação
 * Êxito Contábil — Gerador de Contratos
 *
 * Responsável por:
 * - Inicialização da aplicação
 * - Navegação entre abas
 * - Gerenciamento de configurações (localStorage)
 * - Download da planilha modelo
 * - Renderização da lista de placeholders e colunas
 */

/* ══════════════════════════════════════════
   LISTA DE PLACEHOLDERS
   Todos os campos suportados pelo template .docx
   Usados para:
   - Exibir referência na aba Configurações
   - Gerar colunas da planilha modelo
══════════════════════════════════════════ */

const LISTA_PLACEHOLDERS = [
  // CONTRATANTE
  { campo: 'razao_social',           label: 'Razão Social',                 obrigatorio: true,  grupo: 'Contratante' },
  { campo: 'nome_fantasia',          label: 'Nome Fantasia',                obrigatorio: false, grupo: 'Contratante' },
  { campo: 'cnpj',                   label: 'CNPJ',                         obrigatorio: true,  grupo: 'Contratante' },
  { campo: 'email',                  label: 'E-mail',                       obrigatorio: true,  grupo: 'Contratante' },
  { campo: 'telefone',               label: 'Telefone/WhatsApp',            obrigatorio: false, grupo: 'Contratante' },
  // ENDEREÇO
  { campo: 'cep',                    label: 'CEP',                          obrigatorio: true,  grupo: 'Endereço' },
  { campo: 'logradouro',             label: 'Logradouro',                   obrigatorio: true,  grupo: 'Endereço' },
  { campo: 'numero',                 label: 'Número',                       obrigatorio: true,  grupo: 'Endereço' },
  { campo: 'complemento',            label: 'Complemento',                  obrigatorio: false, grupo: 'Endereço' },
  { campo: 'bairro',                 label: 'Bairro',                       obrigatorio: true,  grupo: 'Endereço' },
  { campo: 'cidade',                 label: 'Cidade',                       obrigatorio: true,  grupo: 'Endereço' },
  { campo: 'uf',                     label: 'UF',                           obrigatorio: true,  grupo: 'Endereço' },
  // REPRESENTANTE
  { campo: 'representante_nome',     label: 'Nome do Representante',        obrigatorio: true,  grupo: 'Representante' },
  { campo: 'representante_cpf',      label: 'CPF do Representante',         obrigatorio: true,  grupo: 'Representante' },
  { campo: 'representante_cargo',    label: 'Cargo do Representante',       obrigatorio: false, grupo: 'Representante' },
  // FINANCEIRO
  { campo: 'honorarios_mensais',     label: 'Honorários Mensais',           obrigatorio: true,  grupo: 'Financeiro' },
  { campo: 'dia_vencimento',         label: 'Dia de Vencimento',            obrigatorio: true,  grupo: 'Financeiro' },
  { campo: 'multa_atraso',           label: 'Multa por Atraso (%)',         obrigatorio: false, grupo: 'Financeiro' },
  { campo: 'juros_atraso',           label: 'Juros por Atraso',             obrigatorio: false, grupo: 'Financeiro' },
  { campo: 'prazo_suspensao',        label: 'Prazo Suspensão (dias)',        obrigatorio: false, grupo: 'Financeiro' },
  { campo: 'quantidade_mensalidades_mora', label: 'Qtd. Mensalidades Mora', obrigatorio: false, grupo: 'Financeiro' },
  // REAJUSTE
  { campo: 'percentual_reajuste_minimo', label: 'Piso Reajuste (%)',        obrigatorio: false, grupo: 'Reajuste' },
  { campo: 'indice_reajuste',        label: 'Índice de Reajuste',           obrigatorio: false, grupo: 'Reajuste' },
  // 13ª PARCELA
  { campo: 'dia_decimo_terceiro',    label: 'Dia da 13ª Parcela',           obrigatorio: false, grupo: '13ª Parcela' },
  { campo: 'proporcional_decimo_terceiro', label: '13ª Proporcional (sim/nao)', obrigatorio: false, grupo: '13ª Parcela' },
  // VIGÊNCIA E ASSINATURA
  { campo: 'prazo_vigencia',         label: 'Prazo de Vigência',            obrigatorio: false, grupo: 'Vigência' },
  { campo: 'prazo_rescisao',         label: 'Aviso Prévio Rescisão',        obrigatorio: false, grupo: 'Vigência' },
  { campo: 'data_assinatura',        label: 'Data de Assinatura',           obrigatorio: true,  grupo: 'Vigência' },
  { campo: 'cidade_assinatura',      label: 'Cidade da Assinatura',         obrigatorio: false, grupo: 'Vigência' },
  { campo: 'uf_assinatura',          label: 'UF da Assinatura',             obrigatorio: false, grupo: 'Vigência' },
  { campo: 'foro',                   label: 'Foro Contratual',              obrigatorio: false, grupo: 'Vigência' },
  // PERFIL OPERACIONAL
  { campo: 'regime_tributario',      label: 'Regime Tributário',            obrigatorio: true,  grupo: 'Operacional' },
  { campo: 'atividade_principal',    label: 'Atividade Principal',          obrigatorio: false, grupo: 'Operacional' },
  { campo: 'incluir_dp',             label: 'Incluir DP (sim/nao)',         obrigatorio: false, grupo: 'Operacional' },
  { campo: 'quantidade_funcionarios',label: 'Qtd. Funcionários',            obrigatorio: false, grupo: 'Operacional' },
  { campo: 'incluir_sped',           label: 'Incluir SPED (sim/nao)',       obrigatorio: false, grupo: 'Operacional' },
  { campo: 'incluir_anexo_certificado', label: 'Incluir Anexo 03 Cert. Digital (sim/nao)', obrigatorio: false, grupo: 'Operacional' },
  { campo: 'observacoes',            label: 'Observações Internas',         obrigatorio: false, grupo: 'Operacional' },
];

/* ══════════════════════════════════════════
   NAVEGAÇÃO POR ABAS
══════════════════════════════════════════ */

// Mapa de títulos para a topbar
const TITULOS_ABAS = {
  individual: 'Contrato Individual',
  lote:       'Importação em Lote',
  preview:    'Pré-visualização',
  planilha:   'Modelo da Planilha',
  config:     'Configurações',
};

/**
 * Alterna para a aba indicada
 * @param {string} tabId - ID da aba (ex: 'individual')
 */
function switchTab(tabId) {
  // Oculta todos os conteúdos
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.remove('active');
  });

  // Remove active de todos os nav-items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
  });

  // Ativa o conteúdo e o nav-item correspondentes
  document.getElementById(`tab-${tabId}`)?.classList.add('active');
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');

  // Atualiza título da topbar
  const titulo = document.getElementById('topbar-title');
  if (titulo) titulo.textContent = TITULOS_ABAS[tabId] || '';

  // Em mobile, fecha o sidebar ao navegar
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar')?.classList.remove('open');
  }
}

/**
 * Abre/fecha o sidebar em mobile
 */
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

/* ══════════════════════════════════════════
   CONFIGURAÇÕES DO ESCRITÓRIO
   Persistidas no localStorage do navegador
══════════════════════════════════════════ */

const CFG_KEY = 'exito_config_escritorio';

/**
 * Lê as configurações salvas do localStorage
 * Retorna defaults se nenhuma configuração foi salva ainda
 * @returns {Object}
 */
function carregarConfiguracoes() {
  const salvas = localStorage.getItem(CFG_KEY);
  if (salvas) {
    try {
      return JSON.parse(salvas);
    } catch(e) {
      // Se corrompido, usa defaults
    }
  }
  // Defaults da Êxito Contábil
  return {
    dia_vencimento:    '10',
    multa_atraso:      '2%',
    juros_atraso:      '1% ao mês',
    prazo_suspensao:   '30',
    qtd_mora:          '3',
    percentual_reajuste: '7%',
    indice_reajuste:   'IPCA',
    dia_13:            '20',
    prazo_vigencia:    '12 (doze) meses',
    prazo_rescisao:    '30 (trinta) dias',
    cidade_assinatura: 'João Pessoa',
    uf_assinatura:     'PB',
    foro:              'Comarca de João Pessoa/PB',
  };
}

/**
 * Salva as configurações preenchidas na aba Configurações
 * no localStorage e atualiza os campos do formulário
 */
function salvarConfiguracoes() {
  const cfg = {
    dia_vencimento:    document.getElementById('cfg_dia_vencimento')?.value    || '10',
    multa_atraso:      document.getElementById('cfg_multa_atraso')?.value      || '2%',
    juros_atraso:      document.getElementById('cfg_juros_atraso')?.value      || '1% ao mês',
    prazo_suspensao:   document.getElementById('cfg_prazo_suspensao')?.value   || '30',
    qtd_mora:          document.getElementById('cfg_qtd_mora')?.value          || '3',
    percentual_reajuste: document.getElementById('cfg_percentual_reajuste')?.value || '7%',
    indice_reajuste:   document.getElementById('cfg_indice_reajuste')?.value   || 'IPCA',
    dia_13:            document.getElementById('cfg_dia_13')?.value            || '20',
    prazo_vigencia:    document.getElementById('cfg_prazo_vigencia')?.value    || '12 (doze) meses',
    prazo_rescisao:    document.getElementById('cfg_prazo_rescisao')?.value    || '30 (trinta) dias',
    cidade_assinatura: document.getElementById('cfg_cidade_assinatura')?.value || 'João Pessoa',
    uf_assinatura:     document.getElementById('cfg_uf_assinatura')?.value     || 'PB',
    foro:              document.getElementById('cfg_foro')?.value              || 'Comarca de João Pessoa/PB',
  };

  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));

  // Aplica os novos defaults no formulário individual
  aplicarConfiguracoesNoFormulario(cfg);

  showToast('Configurações salvas com sucesso!', 'success');
}

/**
 * Preenche os campos do formulário com as configurações do escritório
 * @param {Object} cfg
 */
function aplicarConfiguracoesNoFormulario(cfg) {
  const mapa = {
    'dia_vencimento':            cfg.dia_vencimento,
    'multa_atraso':              cfg.multa_atraso,
    'juros_atraso':              cfg.juros_atraso,
    'prazo_suspensao':           cfg.prazo_suspensao,
    'quantidade_mensalidades_mora': cfg.qtd_mora,
    'percentual_reajuste_minimo':cfg.percentual_reajuste,
    'indice_reajuste':           cfg.indice_reajuste,
    'dia_decimo_terceiro':       cfg.dia_13,
    'prazo_vigencia':            cfg.prazo_vigencia,
    'prazo_rescisao':            cfg.prazo_rescisao,
    'cidade_assinatura':         cfg.cidade_assinatura,
    'uf_assinatura':             cfg.uf_assinatura,
    'foro':                      cfg.foro,
  };

  Object.entries(mapa).forEach(([id, valor]) => {
    const el = document.getElementById(id);
    if (el && valor) el.value = valor;
  });
}

/* ══════════════════════════════════════════
   LIMPAR FORMULÁRIO
══════════════════════════════════════════ */

/**
 * Limpa todos os campos do formulário individual
 * Mantém os valores de configuração (defaults do escritório)
 */
function limparFormulario() {
  const form = document.getElementById('form-individual');
  if (!form) return;

  // Campos a NÃO limpar (defaults do escritório)
  const manter = [
    'dia_vencimento', 'multa_atraso', 'juros_atraso', 'prazo_suspensao',
    'quantidade_mensalidades_mora', 'percentual_reajuste_minimo', 'indice_reajuste',
    'dia_decimo_terceiro', 'prazo_vigencia', 'prazo_rescisao',
    'cidade_assinatura', 'uf_assinatura', 'foro'
  ];

  form.querySelectorAll('input, select, textarea').forEach(el => {
    if (!manter.includes(el.name)) {
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = '';
    }
  });

  limparTodosErros();
  showToast('Formulário limpo.', 'info', 2000);
}

/* ══════════════════════════════════════════
   DOWNLOAD DA PLANILHA MODELO
══════════════════════════════════════════ */

/**
 * Gera e baixa a planilha modelo .xlsx
 * com todas as colunas esperadas pelo sistema
 * e uma linha de exemplo preenchida
 */
function baixarPlanilhaModelo() {
  // Linha de cabeçalho: nomes dos campos
  const cabecalhos = LISTA_PLACEHOLDERS.map(p => p.campo);

  // Linha de exemplo com dados fictícios
  const exemplo = {
    razao_social:                'EMPRESA EXEMPLO LTDA',
    nome_fantasia:               'Exemplo',
    cnpj:                        '11.222.333/0001-44',
    email:                       'contato@exemplo.com.br',
    telefone:                    '(83) 99999-0000',
    cep:                         '58000-000',
    logradouro:                  'Rua das Flores',
    numero:                      '123',
    complemento:                 'Sala 01',
    bairro:                      'Centro',
    cidade:                      'João Pessoa',
    uf:                          'PB',
    representante_nome:          'JOAO DA SILVA',
    representante_cpf:           '000.000.000-00',
    representante_cargo:         'Sócio Administrador',
    honorarios_mensais:          'R$ 850,00',
    dia_vencimento:              '10',
    multa_atraso:                '2%',
    juros_atraso:                '1% ao mês',
    prazo_suspensao:             '30',
    quantidade_mensalidades_mora:'3',
    percentual_reajuste_minimo:  '7%',
    indice_reajuste:             'IPCA',
    dia_decimo_terceiro:         '20',
    proporcional_decimo_terceiro:'sim',
    prazo_vigencia:              '12 (doze) meses',
    prazo_rescisao:              '30 (trinta) dias',
    data_assinatura:             '2026-04-09',
    cidade_assinatura:           'João Pessoa',
    uf_assinatura:               'PB',
    foro:                        'Comarca de João Pessoa/PB',
    regime_tributario:           'Simples Nacional',
    atividade_principal:         'Comércio varejista de alimentos',
    incluir_dp:                  'sim',
    quantidade_funcionarios:     '3',
    incluir_sped:                'nao',
    incluir_anexo_certificado:   'nao',
    observacoes:                 'Cliente novo - indicação',
  };

  const linhaExemplo = cabecalhos.map(c => exemplo[c] || '');

  // Monta a planilha com SheetJS
  const ws = XLSX.utils.aoa_to_sheet([cabecalhos, linhaExemplo]);

  // Estiliza larguras das colunas para melhor leitura
  ws['!cols'] = cabecalhos.map(c => ({ wch: Math.max(c.length + 4, 18) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Contratos');

  // Dispara o download
  XLSX.writeFile(wb, 'modelo-planilha-exito.xlsx');

  showToast('Planilha modelo baixada!', 'success');
}

/* ══════════════════════════════════════════
   RENDERIZAÇÃO DA LISTA DE PLACEHOLDERS
   Na aba Configurações
══════════════════════════════════════════ */

/**
 * Renderiza os chips de placeholders na aba Configurações
 */
function renderizarPlaceholders() {
  const container = document.getElementById('placeholders-lista');
  if (!container) return;

  container.innerHTML = LISTA_PLACEHOLDERS.map(p => `
    <div class="placeholder-chip" title="${p.label} ${p.obrigatorio ? '(obrigatório)' : ''}">
      {{${p.campo}}}
    </div>
  `).join('');
}

/**
 * Renderiza as colunas da planilha na aba "Modelo da Planilha"
 */
function renderizarColunasPlanilha() {
  const container = document.getElementById('columns-grid');
  if (!container) return;

  container.innerHTML = LISTA_PLACEHOLDERS.map((p, i) => `
    <div class="column-chip">
      <span class="col-nome">${p.campo}</span>
      <span class="col-desc">${p.label}</span>
      ${p.obrigatorio ? '<span class="col-req">* Obrigatório</span>' : ''}
    </div>
  `).join('');
}

/* ══════════════════════════════════════════
   INICIALIZAÇÃO DA APLICAÇÃO
   Executada quando o DOM está carregado
══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  // 1. Inicializa ícones Lucide
  lucide.createIcons();

  // 2. Inicializa máscaras de input (CNPJ, CPF)
  inicializarMascaras();

  // 3. Carrega e aplica configurações salvas no formulário
  const cfg = carregarConfiguracoes();
  aplicarConfiguracoesNoFormulario(cfg);

  // 4. Preenche campos de configurações com os valores salvos
  preencherCamposConfig(cfg);

  // 5. Renderiza listas
  renderizarPlaceholders();
  renderizarColunasPlanilha();

  // 6. Define data de hoje como padrão no campo de assinatura
  const campoData = document.getElementById('data_assinatura');
  if (campoData && !campoData.value) {
    campoData.value = hoje();
  }

  // 7. Ativa a aba inicial
  switchTab('individual');

  // 8. Observa mudança no select de DP para mostrar/ocultar campo de funcionários
  document.getElementById('incluir_dp')?.addEventListener('change', function() {
    const campo = document.getElementById('campo-qtd-funcionarios');
    if (campo) {
      campo.style.display = this.value === 'sim' ? 'flex' : 'none';
    }
  });

  console.log('[Êxito Contábil] Gerador de Contratos v1.0.0 — Pronto.');
});

/**
 * Preenche os campos da aba de configurações com os valores salvos
 * @param {Object} cfg
 */
function preencherCamposConfig(cfg) {
  const mapa = {
    'cfg_dia_vencimento':     cfg.dia_vencimento,
    'cfg_multa_atraso':       cfg.multa_atraso,
    'cfg_juros_atraso':       cfg.juros_atraso,
    'cfg_prazo_suspensao':    cfg.prazo_suspensao,
    'cfg_qtd_mora':           cfg.qtd_mora,
    'cfg_percentual_reajuste':cfg.percentual_reajuste,
    'cfg_indice_reajuste':    cfg.indice_reajuste,
    'cfg_dia_13':             cfg.dia_13,
    'cfg_prazo_vigencia':     cfg.prazo_vigencia,
    'cfg_prazo_rescisao':     cfg.prazo_rescisao,
    'cfg_cidade_assinatura':  cfg.cidade_assinatura,
    'cfg_uf_assinatura':      cfg.uf_assinatura,
    'cfg_foro':               cfg.foro,
  };

  Object.entries(mapa).forEach(([id, valor]) => {
    const el = document.getElementById(id);
    if (el && valor) el.value = valor;
  });
}
