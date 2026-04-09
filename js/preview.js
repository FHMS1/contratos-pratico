/**
 * preview.js — Pré-visualização do Contrato
 * Êxito Contábil — Gerador de Contratos
 *
 * Gera uma representação HTML do contrato na aba "Pré-visualização"
 * usando os dados atuais do formulário.
 *
 * NOTA: Esta visualização é apenas uma representação aproximada
 * do conteúdo do contrato. O arquivo .docx final é a versão oficial,
 * gerada pelo docxtemplater a partir do modelo Word.
 */

/**
 * Coleta os dados do formulário, valida e exibe o preview
 * Chamado pelo botão "Visualizar" na aba Individual
 */
function previewContrato() {
  // Valida antes de mostrar
  const { valido, erros } = validarFormularioIndividual();
  if (!valido) {
    showToast(`Corrija ${erros.length} campo(s) antes de visualizar.`, 'error');
    return;
  }

  const dados = coletarDadosFormulario();
  const html  = gerarHTMLPreview(dados);

  const container = document.getElementById('preview-container');
  if (container) {
    container.innerHTML = html;
  }

  // Navega para a aba de preview
  switchTab('preview');
}

/**
 * Gera o HTML completo do preview do contrato
 * @param {Object} d - dados coletados do formulário
 * @returns {string} - HTML da pré-visualização
 */
function gerarHTMLPreview(d) {
  const enderecoContratante = [
    d.logradouro, d.numero, d.complemento, d.bairro, d.cidade_uf
  ].filter(Boolean).join(', ');

  return `
    <div class="preview-doc">

      <h1>CONTRATO<br><small style="font-size:0.55em; font-weight:400; font-family: var(--font-body); letter-spacing:0.15em; text-transform:uppercase; color: var(--text-secondary)">Prestação de Serviços Contábeis</small></h1>

      <!-- Partes -->
      <div class="preview-partes">
        <div>
          <strong>Contratante</strong>
          ${esc(d.razao_social)}, inscrita no CNPJ nº ${esc(d.cnpj)}, com sede à
          ${esc(enderecoContratante)}, CEP ${esc(d.cep)}, neste ato representada por
          ${esc(d.representante_nome)}, CPF nº ${esc(d.representante_cpf)},
          ${d.representante_cargo ? esc(d.representante_cargo) : ''}.
        </div>
        <div>
          <strong>Contratado</strong>
          EXITO ASSESSORIA CONTÁBIL E SERVIÇOS DE ESCRITÓRIO VIRTUAIS LTDA,
          inscrita no CNPJ nº 22.240.257/0001-53, com sede à Av. General Bento da Gama,
          nº 358, sala 00104, Torre, João Pessoa/PB, neste ato representada por
          FABIO HENRIQUE DE MOURA SILVA, CPF nº 078.254.274-32, CRCPB nº 011.005/O-3.
        </div>
      </div>

      <!-- Cláusula 1 -->
      <div class="clausula">
        <div class="clausula-titulo">Cláusula 1 — Objeto do Contrato</div>
        <p>1.1. O presente Contrato tem por objeto a prestação, pela CONTRATADA, dos serviços contábeis, fiscais e trabalhistas descritos no ANEXO 01, conforme enquadramento tributário (${esc(d.regime_tributario)}) e características da CONTRATANTE${d.atividade_principal ? ', cuja atividade principal é ' + esc(d.atividade_principal) : ''}.</p>
        <p>1.2. Serviços não incluídos (extras): não estão incluídos nos honorários mensais, salvo previsão expressa no ANEXO 01, os seguintes itens, entre outros: defesas/impugnações/recursos administrativos, diligências presenciais, perícias, auditorias, retificações fora do prazo por culpa da CONTRATANTE, regularizações de períodos anteriores à vigência, consultorias extensas, atendimento fora do horário/padrão e serviços perante cartórios/órgãos com urgência especial.</p>
      </div>

      <!-- Cláusula 7 -->
      <div class="clausula">
        <div class="clausula-titulo">Cláusula 7 — Honorários</div>
        <p>7.1. Pelos serviços do ANEXO 01, a CONTRATANTE pagará honorários mensais de <strong>${esc(d.honorarios_mensais)}</strong>.</p>
        <p>7.2. Vencimento: até o dia <strong>${esc(d.dia_vencimento)}</strong> de cada mês subsequente à competência.</p>
        <p>7.3. Em caso de atraso, incidirão multa de <strong>${esc(d.multa_atraso)}</strong>, juros de <strong>${esc(d.juros_atraso)}</strong> e correção monetária.</p>
        <p>7.4. Ocorrendo atraso superior a <strong>${esc(d.prazo_suspensao)} dias</strong>, a CONTRATADA poderá suspender a execução de rotinas.</p>
        <p>7.5. O atraso de <strong>${esc(d.quantidade_mensalidades_mora)} mensalidades</strong> consecutivas ou não caracteriza inadimplência relevante, autorizando rescisão imediata.</p>
      </div>

      <!-- Cláusula 9 -->
      <div class="clausula">
        <div class="clausula-titulo">Cláusula 9 — Reajuste Anual</div>
        <p>9.1. Os honorários serão reajustados anualmente pela variação acumulada do <strong>${esc(d.indice_reajuste)}</strong>, nos 12 meses anteriores ao reajuste.</p>
        <p>9.1.1. Piso mínimo: o reajuste anual não será inferior a <strong>${esc(d.percentual_reajuste_minimo)}</strong>.</p>
      </div>

      <!-- Cláusula 10 -->
      <div class="clausula">
        <div class="clausula-titulo">Cláusula 10 — 13ª Parcela</div>
        <p>10.1. Será cobrada uma 13ª parcela no dia <strong>${esc(d.dia_decimo_terceiro)} de dezembro</strong>, vinculada às rotinas de encerramento e obrigações anuais.</p>
        <p>10.2. ${d.proporcional_decimo_terceiro === 'sim'
          ? 'Quando o Contrato iniciar ou encerrar no meio do ano, a 13ª poderá ser cobrada proporcionalmente aos meses de vigência no ano-calendário.'
          : 'A 13ª parcela será cobrada integralmente, independente do período de vigência no ano.'
        }</p>
      </div>

      <!-- Cláusula 16 -->
      <div class="clausula">
        <div class="clausula-titulo">Cláusula 16 — Vigência e Rescisão</div>
        <p>16.1. O presente Contrato entra em vigor na data de sua assinatura e terá vigência inicial de <strong>${esc(d.prazo_vigencia)}</strong>.</p>
        <p>16.2. Encerrado o prazo inicial, o Contrato será automaticamente renovado por prazo indeterminado.</p>
        <p>16.3. Após a vigência inicial, o Contrato poderá ser rescindido por qualquer das partes, mediante notificação por escrito com antecedência mínima de <strong>${esc(d.prazo_rescisao)}</strong>.</p>
      </div>

      <!-- Cláusula 17 -->
      <div class="clausula">
        <div class="clausula-titulo">Cláusula 17 — Foro</div>
        <p>17.1. Fica eleito o foro da <strong>${esc(d.foro)}</strong>, com renúncia de qualquer outro.</p>
      </div>

      <!-- Assinatura -->
      <div class="clausula" style="margin-top: 40px;">
        <p style="text-align: center; margin-bottom: 32px;">
          ${esc(d.cidade_assinatura)}/${esc(d.uf_assinatura)}, ${esc(d.data_assinatura)}.
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center;">
          <div>
            <div style="border-top: 1px solid #333; padding-top: 8px; margin-top: 40px;">
              ${esc(d.razao_social)}<br>
              <small>${esc(d.representante_nome)}</small>
            </div>
          </div>
          <div>
            <div style="border-top: 1px solid #333; padding-top: 8px; margin-top: 40px;">
              EXITO ASSESSORIA CONTÁBIL E SERVIÇOS DE ESCRITÓRIO VIRTUAIS LTDA<br>
              <small>FABIO HENRIQUE DE MOURA SILVA</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Aviso -->
      <div style="margin-top: 32px; padding: 14px 18px; background: var(--warn-bg); border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--warn); border-left: 3px solid var(--warn);">
        ⚠️ Esta é uma <strong>pré-visualização simplificada</strong>. O documento final gerado (.docx) conterá todas as cláusulas, formatação e anexos do modelo original.
      </div>

    </div>
  `;
}

/**
 * Escapa HTML para evitar injeção de conteúdo no preview
 * @param {string} str
 * @returns {string}
 */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
