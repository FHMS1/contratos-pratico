/**
 * importacao-lote.js — Importação em Lote
 * Êxito Contábil — Gerador de Contratos
 *
 * Responsável por:
 * - Receber o upload da planilha (.xlsx ou .csv)
 * - Ler e parsear os dados com SheetJS
 * - Validar cada linha individualmente
 * - Exibir tabela de prévia com status por linha
 * - Gerar todos os contratos válidos em um arquivo .zip
 * - Gerar relatório de erros em .csv para download
 */

// Estado da importação: armazena os dados da planilha em memória
let dadosLote          = [];   // todas as linhas (válidas + inválidas)
let errosLote          = [];   // erros coletados na validação
let avisosLote         = [];   // avisos (não impedem geração)
let linhasValidas      = [];   // apenas linhas que passaram na validação
let nomeArquivoLote    = '';   // nome do arquivo carregado

/* ══════════════════════════════════════════
   DRAG AND DROP — ZONA DE UPLOAD
══════════════════════════════════════════ */

function handleDragOver(event) {
  event.preventDefault();
  document.getElementById('upload-zone')?.classList.add('drag-over');
}

function handleDragLeave(event) {
  document.getElementById('upload-zone')?.classList.remove('drag-over');
}

function handleDrop(event) {
  event.preventDefault();
  document.getElementById('upload-zone')?.classList.remove('drag-over');
  const arquivo = event.dataTransfer.files[0];
  if (arquivo) processarArquivoLote(arquivo);
}

function handleFileSelect(event) {
  const arquivo = event.target.files[0];
  if (arquivo) processarArquivoLote(arquivo);
}

/* ══════════════════════════════════════════
   PROCESSAMENTO DO ARQUIVO DA PLANILHA
══════════════════════════════════════════ */

/**
 * Lê o arquivo de planilha e dispara a validação e prévia
 * @param {File} arquivo - arquivo .xlsx ou .csv selecionado
 */
function processarArquivoLote(arquivo) {
  const ext = arquivo.name.split('.').pop().toLowerCase();
  if (!['xlsx', 'csv'].includes(ext)) {
    showToast('Formato inválido. Use .xlsx ou .csv', 'error');
    return;
  }

  nomeArquivoLote = arquivo.name;
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      // SheetJS lê o arquivo — funciona com .xlsx e .csv
      const workbook = XLSX.read(data, {
        type:       'array',
        cellDates:  true,  // converte datas automaticamente
        raw:        false  // formata números como string
      });

      // Pega a primeira aba da planilha
      const nomePrimeiraPlanilha = workbook.SheetNames[0];
      const planilha = workbook.Sheets[nomePrimeiraPlanilha];

      // Converte para array de objetos usando a primeira linha como cabeçalho
      // defval: '' — campos vazios viram string vazia (não undefined)
      const linhas = XLSX.utils.sheet_to_json(planilha, {
        defval:     '',
        raw:        false
      });

      // Remove linhas completamente vazias
      const linhasNaoVazias = linhas.filter(linha =>
        Object.values(linha).some(v => String(v).trim() !== '')
      );

      if (linhasNaoVazias.length === 0) {
        showToast('A planilha está vazia ou não tem dados nas linhas.', 'warn');
        return;
      }

      // Normaliza os dados: trim em todos os valores, chaves em lowercase com underscore
      dadosLote = linhasNaoVazias.map(linha => normalizarLinhaLote(linha));

      // Valida e exibe a prévia
      validarEExibirPrevia();

    } catch (err) {
      console.error('[processarArquivoLote] Erro:', err);
      showToast('Erro ao ler a planilha. Verifique o formato.', 'error');
    }
  };

  reader.readAsArrayBuffer(arquivo);
}

/**
 * Normaliza uma linha da planilha:
 * - Remove espaços em branco dos valores
 * - Converte cabeçalhos para o padrão esperado pelo sistema
 *
 * O sistema aceita tanto o nome exato do placeholder (ex: razao_social)
 * quanto variações com espaços ou capitalização diferente
 *
 * @param {Object} linha - linha bruta do SheetJS
 * @returns {Object} - linha normalizada
 */
function normalizarLinhaLote(linha) {
  const resultado = {};

  Object.entries(linha).forEach(([chave, valor]) => {
    // Normaliza a chave: lowercase, espaços → underscore, remove acentos
    const chaveNorm = chave
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    // Normaliza o valor: trim e converte para string
    resultado[chaveNorm] = String(valor).trim();
  });

  return resultado;
}

/* ══════════════════════════════════════════
   VALIDAÇÃO E EXIBIÇÃO DA PRÉVIA
══════════════════════════════════════════ */

/**
 * Valida cada linha e exibe a tabela de prévia com status
 */
function validarEExibirPrevia() {
  errosLote   = [];
  avisosLote  = [];
  linhasValidas = [];

  const resultados = dadosLote.map((linha, idx) => {
    const numLinha = idx + 2; // +2 porque linha 1 é o cabeçalho na planilha
    const resultado = validarLinhaLote(linha, numLinha);

    if (resultado.valido) {
      linhasValidas.push({ linha, numLinha });
    }

    errosLote.push(...resultado.erros);
    avisosLote.push(...resultado.avisos);

    return {
      linha,
      numLinha,
      valido:  resultado.valido,
      erros:   resultado.erros,
      avisos:  resultado.avisos
    };
  });

  // Detecta CNPJs duplicados entre as linhas
  const cnpjsVistos = {};
  resultados.forEach(r => {
    const cnpj = (r.linha.cnpj || '').replace(/\D/g, '');
    if (cnpj) {
      if (cnpjsVistos[cnpj]) {
        avisosLote.push(`CNPJ ${r.linha.cnpj} aparece duplicado (linhas ${cnpjsVistos[cnpj]} e ${r.numLinha})`);
      } else {
        cnpjsVistos[cnpj] = r.numLinha;
      }
    }
  });

  // Renderiza os stats e a tabela
  renderizarStats(resultados);
  renderizarTabelaPrevia(resultados);
  renderizarRelatorioErros();

  // Exibe a seção de prévia
  document.getElementById('import-preview').style.display = 'flex';
  document.getElementById('import-preview').style.flexDirection = 'column';

  // Habilita/desabilita botão de gerar
  const btnGerar = document.getElementById('btn-gerar-lote');
  if (btnGerar) {
    btnGerar.disabled = linhasValidas.length === 0;
  }

  const msg = `${dadosLote.length} linha(s) encontrada(s): ${linhasValidas.length} válida(s), ${errosLote.length > 0 ? errosLote.length + ' com erro' : 'sem erros'}`;
  showToast(msg, linhasValidas.length > 0 ? 'info' : 'warn');
}

/**
 * Renderiza os cards de estatísticas
 * @param {Array} resultados
 */
function renderizarStats(resultados) {
  const validos     = resultados.filter(r => r.valido).length;
  const comErros    = resultados.filter(r => !r.valido).length;
  const duplicados  = avisosLote.filter(a => a.includes('duplicado')).length;

  document.getElementById('stat-validos').textContent    = validos;
  document.getElementById('stat-erros').textContent      = comErros;
  document.getElementById('stat-duplicados').textContent = duplicados;
  document.getElementById('stat-total').textContent      = resultados.length;
}

/**
 * Renderiza a tabela de prévia com as colunas mais relevantes
 * @param {Array} resultados
 */
function renderizarTabelaPrevia(resultados) {
  const thead = document.getElementById('import-table-head');
  const tbody = document.getElementById('import-table-body');
  if (!thead || !tbody) return;

  // Colunas exibidas na prévia (subconjunto das colunas da planilha)
  const colunas = [
    { key: 'status',            label: 'Status' },
    { key: 'linha_num',         label: 'Linha' },
    { key: 'razao_social',      label: 'Razão Social' },
    { key: 'cnpj',              label: 'CNPJ' },
    { key: 'regime_tributario', label: 'Regime' },
    { key: 'honorarios_mensais',label: 'Honorários' },
    { key: 'cidade',            label: 'Cidade' },
    { key: 'uf',                label: 'UF' },
    { key: 'data_assinatura',   label: 'Assinatura' },
  ];

  // Cabeçalho
  thead.innerHTML = `<tr>${colunas.map(c => `<th>${c.label}</th>`).join('')}</tr>`;

  // Linhas
  tbody.innerHTML = resultados.map(r => {
    const cls   = r.valido ? '' : 'row-error';
    const pill  = r.valido
      ? `<span class="status-pill ok">✓ OK</span>`
      : `<span class="status-pill err">✗ Erro</span>`;

    const cols = colunas.map(c => {
      if (c.key === 'status')    return `<td>${pill}</td>`;
      if (c.key === 'linha_num') return `<td>${r.numLinha}</td>`;
      const val = r.linha[c.key] || '—';
      return `<td title="${val}">${val}</td>`;
    }).join('');

    return `<tr class="${cls}">${cols}</tr>`;
  }).join('');
}

/**
 * Renderiza a lista de erros e avisos encontrados
 */
function renderizarRelatorioErros() {
  const container = document.getElementById('erros-container');
  const lista     = document.getElementById('erros-list');
  if (!container || !lista) return;

  const todos = [...errosLote, ...avisosLote];

  if (todos.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  lista.innerHTML = todos.map(msg => `<li>${msg}</li>`).join('');
}

/* ══════════════════════════════════════════
   GERAÇÃO EM LOTE — DOWNLOAD .ZIP
══════════════════════════════════════════ */

/**
 * Gera todos os contratos válidos e empacota em um .zip
 * Mostra barra de progresso durante a geração
 */
async function gerarContratosLote() {
  if (linhasValidas.length === 0) {
    showToast('Nenhuma linha válida para gerar.', 'warn');
    return;
  }

  if (!modeloDocxBuffer) {
    showToast('Carregue o modelo .docx primeiro (aba Configurações)', 'warn', 5000);
    switchTab('config');
    return;
  }

  // Exibe barra de progresso
  const progressContainer = document.getElementById('progress-container');
  const progressBar       = document.getElementById('progress-bar-fill');
  const progressText      = document.getElementById('progress-text');
  const progressCount     = document.getElementById('progress-count');

  if (progressContainer) progressContainer.style.display = 'block';

  const zip      = new JSZip();
  const total    = linhasValidas.length;
  let   gerados  = 0;
  let   falharam = [];

  for (const { linha, numLinha } of linhasValidas) {
    try {
      // Prepara os dados da linha complementando com defaults do escritório
      const dados = prepararDadosLinha(linha);

      // Gera o blob do contrato
      const blob = await gerarDocxBlob(dados);

      // Nome do arquivo: Contrato_RazaoSocial_CNPJ.docx
      const nomeArq = gerarNomeArquivo(dados.razao_social, dados.cnpj);

      // Adiciona ao zip
      zip.file(nomeArq, blob);
      gerados++;

    } catch (err) {
      falharam.push({ numLinha, razao: linha.razao_social, erro: err.message });
      console.error(`[gerarContratosLote] Linha ${numLinha} falhou:`, err);
    }

    // Atualiza barra de progresso
    const pct = Math.round(((gerados + falharam.length) / total) * 100);
    if (progressBar)   progressBar.style.width     = `${pct}%`;
    if (progressText)  progressText.textContent     = `Gerando contratos...`;
    if (progressCount) progressCount.textContent    = `${gerados + falharam.length} / ${total}`;

    // Yield para não travar a UI
    await new Promise(r => setTimeout(r, 10));
  }

  // Finaliza e faz download do .zip
  if (gerados > 0) {
    const dataHoje = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const nomeZip  = `Contratos_Exito_${dataHoje}.zip`;

    const conteudoZip = await zip.generateAsync({ type: 'blob' });
    saveAs(conteudoZip, nomeZip);

    showToast(
      `${gerados} contrato(s) gerado(s) com sucesso! ${falharam.length > 0 ? `(${falharam.length} falharam)` : ''}`,
      'success',
      6000
    );
  } else {
    showToast('Nenhum contrato foi gerado. Verifique os erros.', 'error');
  }

  // Oculta barra de progresso
  setTimeout(() => {
    if (progressContainer) progressContainer.style.display = 'none';
  }, 2000);
}

/**
 * Prepara os dados de uma linha da planilha para o template,
 * aplicando os defaults do escritório para campos não preenchidos
 *
 * @param {Object} linha - dados brutos da planilha
 * @returns {Object} - dados prontos para o template
 */
function prepararDadosLinha(linha) {
  // Lê configurações salvas do escritório
  const cfg = carregarConfiguracoes();

  // Monta objeto com fallback para os defaults
  const d = {
    razao_social:               linha.razao_social || '',
    nome_fantasia:              linha.nome_fantasia || '',
    cnpj:                       linha.cnpj || '',
    email:                      linha.email || '',
    telefone:                   linha.telefone || '',
    cep:                        linha.cep || '',
    logradouro:                 linha.logradouro || '',
    numero:                     linha.numero || '',
    complemento:                linha.complemento || '',
    bairro:                     linha.bairro || '',
    cidade:                     linha.cidade || '',
    uf:                         (linha.uf || '').toUpperCase(),
    cidade_uf:                  `${linha.cidade || ''}/${(linha.uf || '').toUpperCase()}`,
    representante_nome:         linha.representante_nome || '',
    representante_cpf:          linha.representante_cpf || '',
    representante_cargo:        linha.representante_cargo || 'Sócio Administrador',
    honorarios_mensais:         linha.honorarios_mensais || '',
    dia_vencimento:             linha.dia_vencimento || cfg.dia_vencimento || '10',
    multa_atraso:               linha.multa_atraso || cfg.multa_atraso || '2%',
    juros_atraso:               linha.juros_atraso || cfg.juros_atraso || '1% ao mês',
    prazo_suspensao:            linha.prazo_suspensao || cfg.prazo_suspensao || '30',
    quantidade_mensalidades_mora: linha.quantidade_mensalidades_mora || cfg.qtd_mora || '3',
    percentual_reajuste_minimo: linha.percentual_reajuste_minimo || cfg.percentual_reajuste || '7%',
    indice_reajuste:            linha.indice_reajuste || cfg.indice_reajuste || 'IPCA',
    dia_decimo_terceiro:        linha.dia_decimo_terceiro || cfg.dia_13 || '20',
    proporcional_decimo_terceiro: linha.proporcional_decimo_terceiro || 'sim',
    prazo_vigencia:             linha.prazo_vigencia || cfg.prazo_vigencia || '12 (doze) meses',
    prazo_rescisao:             linha.prazo_rescisao || cfg.prazo_rescisao || '30 (trinta) dias',
    data_assinatura:            formatarDataExtenso(linha.data_assinatura) || '',
    data_assinatura_iso:        linha.data_assinatura || '',
    cidade_assinatura:          linha.cidade_assinatura || cfg.cidade_assinatura || 'João Pessoa',
    uf_assinatura:              (linha.uf_assinatura || cfg.uf_assinatura || 'PB').toUpperCase(),
    foro:                       linha.foro || cfg.foro || 'Comarca de João Pessoa/PB',
    regime_tributario:          linha.regime_tributario || '',
    atividade_principal:        linha.atividade_principal || 'Conforme objeto social',
    incluir_dp:                 linha.incluir_dp || 'sim',
    quantidade_funcionarios:    linha.quantidade_funcionarios || '0',
    incluir_sped:               linha.incluir_sped || 'sim',
    incluir_anexo_certificado:  linha.incluir_anexo_certificado || 'nao',
    observacoes:                linha.observacoes || '',
  };

  // Monta endereço completo
  d.endereco_completo = [d.logradouro, d.numero, d.complemento, d.bairro,
    d.cidade_uf, d.cep ? `CEP ${d.cep}` : ''].filter(Boolean).join(', ');

  return d;
}

/* ══════════════════════════════════════════
   DOWNLOAD DO RELATÓRIO DE ERROS
══════════════════════════════════════════ */

/**
 * Gera e baixa um arquivo .csv com os erros e avisos da importação
 */
function baixarRelatorioErros() {
  const todos = [
    ...errosLote.map(e => ({ tipo: 'ERRO', mensagem: e })),
    ...avisosLote.map(a => ({ tipo: 'AVISO', mensagem: a }))
  ];

  if (todos.length === 0) {
    showToast('Sem erros para exportar.', 'info');
    return;
  }

  // Monta CSV
  const cabecalho = 'Tipo,Mensagem\n';
  const linhas = todos.map(item =>
    `"${item.tipo}","${item.mensagem.replace(/"/g, '""')}"`
  ).join('\n');

  const blob = new Blob(['\uFEFF' + cabecalho + linhas], {
    type: 'text/csv;charset=utf-8'
  });

  const data = new Date().toISOString().split('T')[0].replace(/-/g, '');
  saveAs(blob, `Erros_Importacao_${data}.csv`);
}

/* ══════════════════════════════════════════
   LIMPAR IMPORTAÇÃO
══════════════════════════════════════════ */

/**
 * Reseta o estado da importação em lote
 */
function limparImportacao() {
  dadosLote     = [];
  errosLote     = [];
  avisosLote    = [];
  linhasValidas = [];

  // Reseta input de arquivo
  const fileInput = document.getElementById('file-input');
  if (fileInput) fileInput.value = '';

  // Oculta prévia
  const preview = document.getElementById('import-preview');
  if (preview) preview.style.display = 'none';

  const progress = document.getElementById('progress-container');
  if (progress) progress.style.display = 'none';
}
