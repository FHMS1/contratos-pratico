/**
 * validations.js — Validações de Formulário
 * Êxito Contábil — Gerador de Contratos
 *
 * Contém:
 * - Validação de CNPJ (algoritmo oficial Receita Federal)
 * - Validação de CPF (algoritmo oficial)
 * - Validação de CEP
 * - Validação de e-mail
 * - Validação de campos obrigatórios
 * - Validação de valores monetários e datas
 * - Função principal que valida todo o formulário
 */

/* ══════════════════════════════════════════
   VALIDAÇÃO DE CNPJ
   Algoritmo oficial da Receita Federal
══════════════════════════════════════════ */

/**
 * Valida CNPJ com o algoritmo de dígitos verificadores
 * @param {string} cnpj - pode conter pontos, barras e traços
 * @returns {boolean}
 */
function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]/g, ''); // remove máscara

  if (cnpj.length !== 14) return false;

  // CNPJs inválidos conhecidos (todos iguais)
  const invalidos = ['00000000000000','11111111111111','22222222222222',
    '33333333333333','44444444444444','55555555555555','66666666666666',
    '77777777777777','88888888888888','99999999999999'];
  if (invalidos.includes(cnpj)) return false;

  // Cálculo do 1º dígito verificador
  let soma = 0;
  let pos  = 5;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpj[i]) * pos--;
    if (pos < 2) pos = 9;
  }
  let dig1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (dig1 !== parseInt(cnpj[12])) return false;

  // Cálculo do 2º dígito verificador
  soma = 0;
  pos  = 6;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpj[i]) * pos--;
    if (pos < 2) pos = 9;
  }
  let dig2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return dig2 === parseInt(cnpj[13]);
}

/* ══════════════════════════════════════════
   VALIDAÇÃO DE CPF
   Algoritmo oficial da Receita Federal
══════════════════════════════════════════ */

/**
 * Valida CPF com o algoritmo de dígitos verificadores
 * @param {string} cpf - pode conter pontos e traços
 * @returns {boolean}
 */
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) return false;

  const invalidos = ['00000000000','11111111111','22222222222',
    '33333333333','44444444444','55555555555','66666666666',
    '77777777777','88888888888','99999999999'];
  if (invalidos.includes(cpf)) return false;

  // 1º dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let dig1 = (soma * 10) % 11;
  if (dig1 === 10 || dig1 === 11) dig1 = 0;
  if (dig1 !== parseInt(cpf[9])) return false;

  // 2º dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  let dig2 = (soma * 10) % 11;
  if (dig2 === 10 || dig2 === 11) dig2 = 0;
  return dig2 === parseInt(cpf[10]);
}

/* ══════════════════════════════════════════
   OUTRAS VALIDAÇÕES BÁSICAS
══════════════════════════════════════════ */

/**
 * Valida CEP (apenas formato, 8 dígitos)
 * @param {string} cep
 * @returns {boolean}
 */
function validarCEP(cep) {
  return /^\d{5}-?\d{3}$/.test(cep.trim());
}

/**
 * Valida formato de e-mail
 * @param {string} email
 * @returns {boolean}
 */
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Valida UF: exatamente 2 letras maiúsculas
 * @param {string} uf
 * @returns {boolean}
 */
function validarUF(uf) {
  const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
    'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
  return ufs.includes(uf.toUpperCase().trim());
}

/**
 * Valida dia do mês (1-31)
 * @param {string|number} dia
 * @returns {boolean}
 */
function validarDia(dia) {
  const n = parseInt(dia);
  return !isNaN(n) && n >= 1 && n <= 31;
}

/**
 * Valida se valor monetário não está vazio
 * @param {string} valor - ex: "R$ 850,00"
 * @returns {boolean}
 */
function validarValorMonetario(valor) {
  const numeros = valor.replace(/[^\d]/g, '');
  return numeros.length > 0 && parseInt(numeros) > 0;
}

/**
 * Valida data no formato YYYY-MM-DD
 * @param {string} data
 * @returns {boolean}
 */
function validarData(data) {
  if (!data) return false;
  const d = new Date(data + 'T00:00:00');
  return !isNaN(d.getTime());
}

/* ══════════════════════════════════════════
   SISTEMA DE ERROS DE CAMPO
   Exibe/oculta mensagens de erro inline
══════════════════════════════════════════ */

/**
 * Marca um campo como inválido com mensagem
 * @param {string} id - ID do input
 * @param {string} mensagem
 */
function marcarErro(id, mensagem) {
  const input = document.getElementById(id);
  const erro  = document.getElementById(`err-${id}`);
  if (input) input.classList.add('error');
  if (erro)  erro.textContent = mensagem;
}

/**
 * Remove marca de erro de um campo
 * @param {string} id - ID do input
 */
function limparErro(id) {
  const input = document.getElementById(id);
  const erro  = document.getElementById(`err-${id}`);
  if (input) input.classList.remove('error');
  if (erro)  erro.textContent = '';
}

/**
 * Remove todos os erros do formulário
 */
function limparTodosErros() {
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

/* ══════════════════════════════════════════
   VALIDAÇÃO PRINCIPAL DO FORMULÁRIO
   Chamada antes de gerar qualquer contrato
══════════════════════════════════════════ */

/**
 * Valida todos os campos obrigatórios do formulário individual
 * @returns {{ valido: boolean, erros: string[] }}
 */
function validarFormularioIndividual() {
  limparTodosErros();

  const erros   = [];
  const get     = (id) => (document.getElementById(id)?.value || '').trim();

  // ── Dados da Contratante ──────────────────
  if (!get('razao_social')) {
    marcarErro('razao_social', 'Razão social é obrigatória');
    erros.push('Razão social não preenchida');
  }

  const cnpj = get('cnpj');
  if (!cnpj) {
    marcarErro('cnpj', 'CNPJ é obrigatório');
    erros.push('CNPJ não preenchido');
  } else if (!validarCNPJ(cnpj)) {
    marcarErro('cnpj', 'CNPJ inválido — verifique os dígitos');
    erros.push('CNPJ inválido');
  }

  const email = get('email');
  if (!email) {
    marcarErro('email', 'E-mail é obrigatório');
    erros.push('E-mail não preenchido');
  } else if (!validarEmail(email)) {
    marcarErro('email', 'Formato de e-mail inválido');
    erros.push('E-mail inválido');
  }

  // ── Endereço ──────────────────────────────
  if (!get('cep')) {
    marcarErro('cep', 'CEP é obrigatório');
    erros.push('CEP não preenchido');
  } else if (!validarCEP(get('cep'))) {
    marcarErro('cep', 'CEP inválido');
    erros.push('CEP inválido');
  }

  if (!get('logradouro')) {
    marcarErro('logradouro', 'Logradouro é obrigatório');
    erros.push('Logradouro não preenchido');
  }

  if (!get('numero')) {
    marcarErro('numero', 'Número é obrigatório');
    erros.push('Número não preenchido');
  }

  if (!get('bairro')) {
    marcarErro('bairro', 'Bairro é obrigatório');
    erros.push('Bairro não preenchido');
  }

  if (!get('cidade')) {
    marcarErro('cidade', 'Cidade é obrigatória');
    erros.push('Cidade não preenchida');
  }

  const uf = get('uf');
  if (!uf) {
    marcarErro('uf', 'UF é obrigatória');
    erros.push('UF não preenchida');
  } else if (!validarUF(uf)) {
    marcarErro('uf', 'UF inválida — use 2 letras');
    erros.push('UF inválida');
  }

  // ── Representante ─────────────────────────
  if (!get('representante_nome')) {
    marcarErro('representante_nome', 'Nome do representante é obrigatório');
    erros.push('Nome do representante não preenchido');
  }

  const cpf = get('representante_cpf');
  if (!cpf) {
    marcarErro('representante_cpf', 'CPF é obrigatório');
    erros.push('CPF do representante não preenchido');
  } else if (!validarCPF(cpf)) {
    marcarErro('representante_cpf', 'CPF inválido — verifique os dígitos');
    erros.push('CPF inválido');
  }

  // ── Financeiro ────────────────────────────
  const honorarios = get('honorarios_mensais');
  if (!honorarios) {
    marcarErro('honorarios_mensais', 'Valor dos honorários é obrigatório');
    erros.push('Honorários não preenchidos');
  } else if (!validarValorMonetario(honorarios)) {
    marcarErro('honorarios_mensais', 'Valor deve ser maior que zero');
    erros.push('Valor de honorários inválido');
  }

  const diaVenc = get('dia_vencimento');
  if (!diaVenc) {
    marcarErro('dia_vencimento', 'Dia de vencimento é obrigatório');
    erros.push('Dia de vencimento não preenchido');
  } else if (!validarDia(diaVenc)) {
    marcarErro('dia_vencimento', 'Informe um dia entre 1 e 31');
    erros.push('Dia de vencimento inválido');
  }

  // ── Data de assinatura ────────────────────
  const dataAssinatura = get('data_assinatura');
  if (!dataAssinatura) {
    marcarErro('data_assinatura', 'Data da assinatura é obrigatória');
    erros.push('Data de assinatura não preenchida');
  } else if (!validarData(dataAssinatura)) {
    marcarErro('data_assinatura', 'Data inválida');
    erros.push('Data de assinatura inválida');
  }

  // ── Regime tributário ─────────────────────
  if (!get('regime_tributario')) {
    marcarErro('regime_tributario', 'Regime tributário é obrigatório');
    erros.push('Regime tributário não selecionado');
  }

  // Scroll para o primeiro erro
  if (erros.length > 0) {
    const primeiroErro = document.querySelector('.error');
    if (primeiroErro) {
      primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

/* ══════════════════════════════════════════
   VALIDAÇÃO DE LINHA DA PLANILHA (LOTE)
   Usada no importacao-lote.js
══════════════════════════════════════════ */

/**
 * Valida uma linha (objeto) da planilha importada
 * @param {Object} linha - dados de uma linha da planilha
 * @param {number} numLinha - número da linha para mensagem de erro
 * @returns {{ valido: boolean, erros: string[], avisos: string[] }}
 */
function validarLinhaLote(linha, numLinha) {
  const erros  = [];
  const avisos = [];

  const req = (campo, label) => {
    if (!linha[campo] || String(linha[campo]).trim() === '') {
      erros.push(`Linha ${numLinha}: "${label}" é obrigatório`);
      return false;
    }
    return true;
  };

  // Campos obrigatórios básicos
  req('razao_social',       'Razão Social');
  req('cnpj',               'CNPJ');
  req('representante_nome', 'Nome do Representante');
  req('representante_cpf',  'CPF do Representante');
  req('logradouro',         'Logradouro');
  req('numero',             'Número');
  req('bairro',             'Bairro');
  req('cidade',             'Cidade');
  req('uf',                 'UF');
  req('cep',                'CEP');
  req('honorarios_mensais', 'Honorários Mensais');
  req('data_assinatura',    'Data de Assinatura');
  req('regime_tributario',  'Regime Tributário');

  // Validações de formato
  if (linha.cnpj && !validarCNPJ(String(linha.cnpj))) {
    erros.push(`Linha ${numLinha}: CNPJ "${linha.cnpj}" inválido`);
  }

  if (linha.representante_cpf && !validarCPF(String(linha.representante_cpf))) {
    erros.push(`Linha ${numLinha}: CPF "${linha.representante_cpf}" inválido`);
  }

  if (linha.email && linha.email.trim() !== '' && !validarEmail(String(linha.email))) {
    avisos.push(`Linha ${numLinha}: E-mail "${linha.email}" pode estar incorreto`);
  }

  if (linha.uf && !validarUF(String(linha.uf))) {
    erros.push(`Linha ${numLinha}: UF "${linha.uf}" inválida`);
  }

  if (linha.dia_vencimento && !validarDia(linha.dia_vencimento)) {
    erros.push(`Linha ${numLinha}: Dia de vencimento "${linha.dia_vencimento}" inválido`);
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos
  };
}
