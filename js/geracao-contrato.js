/**
 * geracao-contrato.js — Geração de Contratos DOCX
 * Êxito Contábil — Gerador de Contratos
 *
 * Responsável por:
 * - Carregar o modelo .docx com os placeholders {{campo}}
 * - Substituir placeholders pelos dados reais usando docxtemplater
 * - Disparar download individual ou retornar Blob para uso em lote
 *
 * COMO FUNCIONA:
 * 1. O usuário carrega um arquivo .docx com placeholders como {{razao_social}}
 * 2. docxtemplater lê o binário do arquivo via PizZip
 * 3. Os placeholders são substituídos pelos dados do formulário
 * 4. Um novo Blob .docx é gerado e enviado para download
 *
 * PLACEHOLDERS SUPORTADOS:
 * Ver lista em app.js → LISTA_PLACEHOLDERS
 */

// Armazena o ArrayBuffer do modelo carregado pelo usuário
// Persiste enquanto a página estiver aberta
let modeloDocxBuffer = null;
let modeloDocxNome   = 'modelo-contrato.docx';

/* ══════════════════════════════════════════
   CARREGAMENTO DO MODELO .DOCX
   Chamado quando o usuário faz upload na aba Configurações
══════════════════════════════════════════ */

/**
 * Carrega o arquivo .docx modelo selecionado pelo usuário
 * Salva em modeloDocxBuffer para uso posterior
 * @param {Event} event - evento de change do input file
 */
function carregarModeloDocx(event) {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  if (!arquivo.name.endsWith('.docx')) {
    showToast('O modelo precisa ser um arquivo .docx', 'error');
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    modeloDocxBuffer = e.target.result;
    modeloDocxNome   = arquivo.name;

    // Atualiza o indicador visual na aba Configurações
    const nomeEl   = document.getElementById('docx-nome-arquivo');
    const statusEl = document.getElementById('docx-status');
    if (nomeEl)   nomeEl.textContent   = arquivo.name;
    if (statusEl) statusEl.textContent = `✓ Modelo carregado — ${(arquivo.size / 1024).toFixed(1)} KB`;

    showToast(`Modelo "${arquivo.name}" carregado com sucesso!`, 'success');
  };

  reader.onerror = function() {
    showToast('Erro ao ler o arquivo. Tente novamente.', 'error');
  };

  // Lê como ArrayBuffer (formato necessário para o PizZip)
  reader.readAsArrayBuffer(arquivo);
}

/* ══════════════════════════════════════════
   GERAÇÃO DE CONTRATO INDIVIDUAL
   Chamada pelo botão "Gerar Contrato" na aba Individual
══════════════════════════════════════════ */

/**
 * Valida, coleta dados e gera o contrato individual para download
 * Ponto de entrada chamado pelo botão do formulário
 */
async function gerarContratoIndividual() {
  // 1. Valida o formulário
  const { valido, erros } = validarFormularioIndividual();
  if (!valido) {
    showToast(`${erros.length} campo(s) com erro. Verifique o formulário.`, 'error');
    return;
  }

  // 2. Verifica se o modelo foi carregado
  if (!modeloDocxBuffer) {
    showToast('Carregue o modelo .docx primeiro (aba Configurações)', 'warn', 5000);
    switchTab('config');
    return;
  }

  // 3. Coleta os dados do formulário
  const dados = coletarDadosFormulario();

  // 4. Atualiza status visual
  atualizarStatus('Gerando...', 'info');

  try {
    // 5. Gera o Blob do contrato
    const blob = await gerarDocxBlob(dados);

    // 6. Define nome do arquivo e dispara download
    const nomeArquivo = gerarNomeArquivo(dados.razao_social, dados.cnpj);
    saveAs(blob, nomeArquivo);

    showToast(`Contrato de ${dados.razao_social} gerado com sucesso!`, 'success');
    atualizarStatus('Pronto', 'success');

  } catch (err) {
    console.error('[gerarContratoIndividual] Erro:', err);
    showToast(
      `Erro ao gerar contrato: ${err.message || 'verifique os placeholders do modelo'}`,
      'error',
      6000
    );
    atualizarStatus('Erro', 'error');
  }
}

/* ══════════════════════════════════════════
   FUNÇÃO CORE — GERAÇÃO DO BLOB DOCX
   Usada tanto no modo individual quanto no lote
══════════════════════════════════════════ */

/**
 * Gera um Blob .docx a partir dos dados fornecidos
 * usando o modelo carregado e docxtemplater
 *
 * @param {Object} dados - campos para substituir no template
 * @returns {Promise<Blob>} - arquivo .docx gerado
 * @throws {Error} - se o template tiver problemas de placeholder
 */
async function gerarDocxBlob(dados) {
  if (!modeloDocxBuffer) {
    throw new Error('Modelo .docx não carregado');
  }

  // Prepara dados com valores de fallback para campos opcionais
  // Garante que nenhum placeholder fique como "undefined" no documento
  const dadosCompletos = prepararDadosParaTemplate(dados);

  // Inicializa PizZip com o ArrayBuffer do modelo
  // PizZip lê o formato ZIP interno do .docx
  const zip = new PizZip(modeloDocxBuffer);

  // Inicializa docxtemplater com o zip
  // linebreaks: true = preserva quebras de linha do Word
  const doc = new Docxtemplater(zip, {
    paragraphLoop:  true,  // melhor suporte a loops em parágrafos
    linebreaks:     true,  // mantém \n como quebras de parágrafo
    // Função de erro: captura placeholders não encontrados
    nullGetter: function(part) {
      // Retorna string vazia em vez de erro para campos opcionais ausentes
      if (!part.module) return '';
      return '';
    }
  });

  // Realiza a substituição dos placeholders
  doc.render(dadosCompletos);

  // Gera o novo arquivo .docx como Uint8Array
  const saida = doc.getZip().generate({
    type:        'blob',
    mimeType:    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE' // compressão padrão do Word
  });

  return saida;
}

/* ══════════════════════════════════════════
   PREPARAÇÃO DOS DADOS PARA O TEMPLATE
   Normaliza e adiciona campos calculados
══════════════════════════════════════════ */

/**
 * Recebe dados brutos e retorna objeto enriquecido
 * com campos calculados e valores padrão para opcionais
 *
 * @param {Object} dados
 * @returns {Object}
 */
function prepararDadosParaTemplate(dados) {
  const d = { ...dados };

  // Campos de texto booleano para uso em condicionais no template
  // No docxtemplater: {#incluir_dp_bool}...{/incluir_dp_bool} renderiza condicionalmente
  d.incluir_dp_bool             = simNaoBool(d.incluir_dp);
  d.incluir_sped_bool           = simNaoBool(d.incluir_sped);
  d.incluir_certificado_bool    = simNaoBool(d.incluir_anexo_certificado);
  d.proporcional_bool           = simNaoBool(d.proporcional_decimo_terceiro);

  // Textos condicionais simples (sem blocos no Word)
  d.texto_dp_status = d.incluir_dp_bool
    ? 'Inclui rotinas de Departamento Pessoal conforme ANEXO 01, item 5.'
    : 'Não inclui rotinas de Departamento Pessoal.';

  d.texto_sped_status = d.incluir_sped_bool
    ? 'Inclui SPED e escrituração digital conforme ANEXO 01, item 4.'
    : 'Não inclui SPED/escrituração digital no escopo padrão.';

  d.texto_proporcional_13 = d.proporcional_bool
    ? 'Quando o Contrato iniciar ou encerrar no meio do ano, a 13ª poderá ser cobrada proporcionalmente aos meses de vigência no ano-calendário.'
    : 'A 13ª parcela será cobrada integralmente, independente do período de vigência no ano.';

  // Garante que campos opcionais não apareçam como "undefined"
  d.complemento       = d.complemento       || '';
  d.nome_fantasia     = d.nome_fantasia      || '';
  d.representante_cargo = d.representante_cargo || 'Sócio Administrador';
  d.atividade_principal = d.atividade_principal || 'Conforme objeto social';
  d.quantidade_funcionarios = d.quantidade_funcionarios || '0';
  d.observacoes       = d.observacoes       || '';

  // Campos de assinatura — valores fixos da contratada Êxito
  // (nunca mudam, mas incluídos no template para completude)
  d.contratada_razao_social   = 'EXITO ASSESSORIA CONTÁBIL E SERVIÇOS DE ESCRITÓRIO VIRTUAIS LTDA';
  d.contratada_cnpj           = '22.240.257/0001-53';
  d.contratada_logradouro     = 'Av. General Bento da Gama';
  d.contratada_numero         = '358';
  d.contratada_complemento    = 'Sala 00104';
  d.contratada_bairro         = 'Torre';
  d.contratada_cidade_uf      = 'João Pessoa/PB';
  d.contratada_representante  = 'FABIO HENRIQUE DE MOURA SILVA';
  d.contratada_cpf            = '078.254.274-32';
  d.contratada_crc            = 'CRCPB nº 011.005/O-3';

  return d;
}

/* ══════════════════════════════════════════
   UTILITÁRIO DE STATUS
══════════════════════════════════════════ */

/**
 * Atualiza o badge de status na topbar
 * @param {string} texto
 * @param {'success'|'info'|'error'|'warn'} tipo
 */
function atualizarStatus(texto, tipo = 'success') {
  const badge = document.getElementById('status-badge');
  if (!badge) return;

  const icones = {
    success: 'circle-check',
    info:    'loader',
    error:   'circle-x',
    warn:    'alert-circle'
  };

  badge.className = `status-badge status-${tipo}`;
  badge.innerHTML = `<i data-lucide="${icones[tipo] || 'circle-check'}"></i><span>${texto}</span>`;
  lucide.createIcons();
}
