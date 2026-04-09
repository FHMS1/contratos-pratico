/**
 * utils.js — Funções Utilitárias
 * Êxito Contábil — Gerador de Contratos
 *
 * Contém:
 * - Formatação e máscaras de input (CNPJ, CPF, CEP, moeda)
 * - Busca de CEP via ViaCEP (API gratuita)
 * - Sanitização de nomes de arquivo
 * - Toast notifications
 * - Helpers de data e texto
 */

/* ══════════════════════════════════════════
   MÁSCARAS DE INPUT
   Aplicadas via oninput nos campos do HTML
══════════════════════════════════════════ */

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 * @param {HTMLInputElement} input
 */
function maskCNPJ(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 14);
  v = v
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
  input.value = v;
}

/**
 * Aplica máscara de CPF: 000.000.000-00
 * @param {HTMLInputElement} input
 */
function maskCPF(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 11);
  v = v
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
  input.value = v;
}

/**
 * Aplica máscara de CEP: 00000-000
 * @param {HTMLInputElement} input
 */
function maskCEP(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 8);
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
  input.value = v;
}

/**
 * Aplica máscara monetária: R$ 0.000,00
 * @param {HTMLInputElement} input
 */
function maskMoeda(input) {
  let v = input.value.replace(/\D/g, '');
  if (!v) { input.value = ''; return; }
  const n = parseInt(v, 10) / 100;
  input.value = 'R$ ' + n.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/* ══════════════════════════════════════════
   BUSCA DE CEP — ViaCEP
   Preenche logradouro, bairro, cidade e UF
   automaticamente ao digitar o CEP
══════════════════════════════════════════ */

/**
 * Busca dados do CEP na API ViaCEP
 * Preenche campos de endereço do formulário individual
 */
async function buscarCEP() {
  const cepInput = document.getElementById('cep');
  if (!cepInput) return;

  const cep = cepInput.value.replace(/\D/g, '');
  if (cep.length !== 8) return;

  // Indicador visual de carregamento
  cepInput.style.opacity = '0.6';
  cepInput.placeholder = 'Buscando...';

  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await resp.json();

    if (data.erro) {
      showToast('CEP não encontrado. Verifique e tente novamente.', 'warn');
      return;
    }

    // Preenche os campos
    setValorCampo('logradouro', data.logradouro);
    setValorCampo('bairro',     data.bairro);
    setValorCampo('cidade',     data.localidade);
    setValorCampo('uf',         data.uf);

    // Foca no número para agilizar preenchimento
    document.getElementById('numero')?.focus();

  } catch (err) {
    showToast('Erro ao buscar CEP. Verifique sua conexão.', 'error');
  } finally {
    cepInput.style.opacity = '';
    cepInput.placeholder   = '58000-000';
  }
}

/**
 * Seta valor em um campo sem sobrescrever se já preenchido pelo usuário
 * @param {string} id - ID do campo
 * @param {string} valor - valor a ser inserido
 */
function setValorCampo(id, valor) {
  const el = document.getElementById(id);
  if (el && valor) el.value = valor;
}

/* ══════════════════════════════════════════
   TOAST NOTIFICATIONS
   Sistema de notificações não-bloqueante
══════════════════════════════════════════ */

/**
 * Exibe uma notificação toast na parte inferior da tela
 * @param {string} mensagem - texto a exibir
 * @param {'success'|'error'|'warn'|'info'} tipo - cor/ícone
 * @param {number} duracao - tempo em ms antes de sumir (default 3500)
 */
function showToast(mensagem, tipo = 'info', duracao = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Ícone conforme tipo
  const icones = {
    success: 'check-circle',
    error:   'x-circle',
    warn:    'alert-triangle',
    info:    'info'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerHTML = `
    <i data-lucide="${icones[tipo] || 'info'}"></i>
    <span>${mensagem}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons(); // renderiza o novo ícone

  // Remove após duração
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duracao);
}

/* ══════════════════════════════════════════
   FORMATAÇÃO DE DATAS
══════════════════════════════════════════ */

/**
 * Formata uma data para o formato extenso pt-BR
 * Ex: "2026-04-09" → "09 de abril de 2026"
 * @param {string} dataISO - formato YYYY-MM-DD
 * @returns {string}
 */
function formatarDataExtenso(dataISO) {
  if (!dataISO) return '';
  // Adiciona timezone para evitar problema de um dia a menos
  const [ano, mes, dia] = dataISO.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  return data.toLocaleDateString('pt-BR', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric'
  });
}

/**
 * Retorna data de hoje no formato YYYY-MM-DD
 * @returns {string}
 */
function hoje() {
  return new Date().toISOString().split('T')[0];
}

/* ══════════════════════════════════════════
   SANITIZAÇÃO DE NOMES DE ARQUIVO
══════════════════════════════════════════ */

/**
 * Remove caracteres inválidos para nomes de arquivo
 * e normaliza acentos
 * Ex: "Açaí & Cia. Ltda" → "Acai_e_Cia_Ltda"
 * @param {string} nome
 * @returns {string}
 */
function sanitizarNomeArquivo(nome) {
  if (!nome) return 'sem_nome';
  return nome
    .normalize('NFD')                         // decompõe acentos
    .replace(/[\u0300-\u036f]/g, '')          // remove diacríticos
    .replace(/[^a-zA-Z0-9\s_-]/g, '')        // remove caracteres especiais
    .trim()
    .replace(/\s+/g, '_')                     // espaços → underscore
    .replace(/_+/g, '_')                      // múltiplos underscores → um
    .substring(0, 80);                        // limita tamanho
}

/**
 * Gera nome padronizado para o arquivo de contrato
 * Ex: "Contrato_Empresa_Exemplo_12345678000190.docx"
 * @param {string} razaoSocial
 * @param {string} cnpj
 * @returns {string}
 */
function gerarNomeArquivo(razaoSocial, cnpj) {
  const nome  = sanitizarNomeArquivo(razaoSocial);
  const cnpjN = (cnpj || '').replace(/\D/g, '').substring(0, 14);
  return `Contrato_${nome}_${cnpjN}.docx`;
}

/* ══════════════════════════════════════════
   HELPERS GERAIS
══════════════════════════════════════════ */

/**
 * Converte string booleana "sim"/"nao" em boolean
 * @param {string} val
 * @returns {boolean}
 */
function simNaoBool(val) {
  return (val || '').toLowerCase() === 'sim';
}

/**
 * Retorna string vazia se valor for undefined/null
 * Evita que "undefined" apareça no contrato
 * @param {*} val
 * @param {string} fallback - valor padrão
 * @returns {string}
 */
function seguro(val, fallback = '') {
  if (val === null || val === undefined || val === '') return fallback;
  return String(val).trim();
}

/**
 * Coleta todos os dados do formulário individual
 * e retorna um objeto com todos os campos
 * @returns {Object}
 */
function coletarDadosFormulario() {
  const get = (id) => seguro(document.getElementById(id)?.value);

  const dataAssinatura = get('data_assinatura');

  return {
    // Contratante
    razao_social:           get('razao_social').toUpperCase(),
    nome_fantasia:          get('nome_fantasia'),
    cnpj:                   get('cnpj'),
    email:                  get('email'),
    telefone:               get('telefone'),
    // Endereço
    cep:                    get('cep'),
    logradouro:             get('logradouro'),
    numero:                 get('numero'),
    complemento:            get('complemento'),
    bairro:                 get('bairro'),
    cidade:                 get('cidade'),
    uf:                     get('uf').toUpperCase(),
    cidade_uf:              `${get('cidade')}/${get('uf').toUpperCase()}`,
    // Representante
    representante_nome:     get('representante_nome').toUpperCase(),
    representante_cpf:      get('representante_cpf'),
    representante_cargo:    get('representante_cargo') || 'Sócio Administrador',
    // Financeiro
    honorarios_mensais:     get('honorarios_mensais'),
    dia_vencimento:         get('dia_vencimento'),
    multa_atraso:           get('multa_atraso'),
    juros_atraso:           get('juros_atraso'),
    prazo_suspensao:        get('prazo_suspensao'),
    quantidade_mensalidades_mora: get('quantidade_mensalidades_mora'),
    // Reajuste
    percentual_reajuste_minimo: get('percentual_reajuste_minimo'),
    indice_reajuste:        get('indice_reajuste'),
    // 13ª Parcela
    dia_decimo_terceiro:    get('dia_decimo_terceiro'),
    proporcional_decimo_terceiro: get('proporcional_decimo_terceiro'),
    // Vigência e assinatura
    prazo_vigencia:         get('prazo_vigencia'),
    prazo_rescisao:         get('prazo_rescisao'),
    data_assinatura:        formatarDataExtenso(dataAssinatura),
    data_assinatura_iso:    dataAssinatura,
    cidade_assinatura:      get('cidade_assinatura'),
    uf_assinatura:          get('uf_assinatura').toUpperCase(),
    foro:                   get('foro'),
    // Perfil operacional
    regime_tributario:      get('regime_tributario'),
    atividade_principal:    get('atividade_principal'),
    incluir_dp:             get('incluir_dp'),
    quantidade_funcionarios: get('quantidade_funcionarios'),
    incluir_sped:           get('incluir_sped'),
    incluir_anexo_certificado: get('incluir_anexo_certificado'),
    observacoes:            get('observacoes'),
    // Campo calculado: endereço completo em linha
    endereco_completo:      montarEnderecoCompleto(),
  };
}

/**
 * Monta string de endereço completo para uso no contrato
 * @returns {string} Ex: "Rua das Flores, 123, Sala 01, Centro, João Pessoa/PB, CEP 58000-000"
 */
function montarEnderecoCompleto() {
  const get = (id) => seguro(document.getElementById(id)?.value);
  const partes = [
    get('logradouro'),
    get('numero'),
    get('complemento'),
    get('bairro'),
    `${get('cidade')}/${get('uf').toUpperCase()}`,
    get('cep') ? `CEP ${get('cep')}` : ''
  ].filter(Boolean);
  return partes.join(', ');
}

/**
 * Detecta e aplica máscaras aos campos do formulário automaticamente
 * Chamado uma vez no carregamento da página
 */
function inicializarMascaras() {
  const cnpjField = document.getElementById('cnpj');
  const cpfField  = document.getElementById('representante_cpf');

  if (cnpjField) {
    cnpjField.addEventListener('input', () => maskCNPJ(cnpjField));
  }

  if (cpfField) {
    cpfField.addEventListener('input', () => maskCPF(cpfField));
  }
}
