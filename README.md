# Êxito Contábil — Gerador de Contratos
### Versão 1.0.0 — MVP

Ferramenta web para preenchimento automático de contratos de prestação de serviços contábeis.
Funciona 100% no navegador, sem necessidade de servidor ou instalação.

---

## ⚡ Como usar — Passo a Passo

### 1. Abrir no VS Code

```
File → Open Folder → selecione a pasta "exito-contratos"
```

### 2. Instalar a extensão Live Server

Na aba de extensões do VS Code (`Ctrl+Shift+X`), busque:
```
Live Server — Ritwick Dey
```
Instale e clique em **"Go Live"** no canto inferior direito.

O sistema abrirá em: `http://127.0.0.1:5500`

> ⚠️ **NÃO abra o index.html diretamente** pelo explorador de arquivos (protocolo `file://`).  
> Isso bloqueia o carregamento das bibliotecas CDN.  
> Sempre use Live Server ou outro servidor local.

---

## 📁 Estrutura do Projeto

```
exito-contratos/
  index.html                  ← Interface principal
  css/
    style.css                 ← Design system completo
  js/
    app.js                    ← Controlador principal, abas, configurações
    utils.js                  ← Máscaras, busca CEP, formatações, toasts
    validations.js            ← CNPJ, CPF, campos obrigatórios
    geracao-contrato.js       ← docxtemplater — geração do .docx
    importacao-lote.js        ← SheetJS — leitura da planilha, lote + ZIP
    preview.js                ← Pré-visualização HTML do contrato
  assets/                     ← Logo e imagens (opcional)
  README.md
```

---

## 📄 Preparar o Modelo de Contrato (.docx)

1. Abra seu contrato no **Microsoft Word**
2. Substitua os campos variáveis pelos **placeholders** abaixo
3. Salve como `.docx`
4. Na ferramenta, vá em **Configurações → Carregar Modelo**

### Placeholders disponíveis

| Placeholder | Campo |
|---|---|
| `{{razao_social}}` | Razão Social do cliente |
| `{{cnpj}}` | CNPJ formatado |
| `{{logradouro}}` | Logradouro |
| `{{numero}}` | Número |
| `{{complemento}}` | Complemento |
| `{{bairro}}` | Bairro |
| `{{cidade}}` | Cidade |
| `{{uf}}` | UF |
| `{{cep}}` | CEP |
| `{{cidade_uf}}` | Cidade/UF combinados (ex: João Pessoa/PB) |
| `{{endereco_completo}}` | Endereço completo em linha |
| `{{representante_nome}}` | Nome do representante legal |
| `{{representante_cpf}}` | CPF do representante |
| `{{representante_cargo}}` | Cargo do representante |
| `{{honorarios_mensais}}` | Valor dos honorários |
| `{{dia_vencimento}}` | Dia de vencimento |
| `{{multa_atraso}}` | Multa por atraso |
| `{{juros_atraso}}` | Juros por atraso |
| `{{prazo_suspensao}}` | Prazo para suspensão |
| `{{quantidade_mensalidades_mora}}` | Qtd. mensalidades para rescisão |
| `{{percentual_reajuste_minimo}}` | Piso de reajuste |
| `{{indice_reajuste}}` | Índice de reajuste (IPCA) |
| `{{dia_decimo_terceiro}}` | Dia da 13ª parcela |
| `{{prazo_vigencia}}` | Prazo de vigência |
| `{{prazo_rescisao}}` | Aviso prévio de rescisão |
| `{{data_assinatura}}` | Data por extenso |
| `{{cidade_assinatura}}` | Cidade da assinatura |
| `{{uf_assinatura}}` | UF da assinatura |
| `{{foro}}` | Foro contratual |
| `{{regime_tributario}}` | Regime tributário |
| `{{atividade_principal}}` | Atividade principal |
| `{{texto_dp_status}}` | Texto sobre inclusão do DP |
| `{{texto_sped_status}}` | Texto sobre inclusão do SPED |

### Blocos condicionais no Word

Para incluir/remover blocos inteiros conforme o perfil do cliente, use:

```
{#incluir_dp_bool}
   [Este bloco só aparece quando DP = sim]
{/incluir_dp_bool}

{#incluir_certificado_bool}
   [Texto do Anexo 03 — certificado digital]
{/incluir_certificado_bool}
```

---

## 📊 Planilha para Importação em Lote

1. Na aba **Modelo da Planilha**, clique em **"Baixar Planilha .XLSX"**
2. Preencha a partir da linha 2 (a linha 1 é o cabeçalho — não edite)
3. Cada linha = 1 contrato
4. Salve no formato `.xlsx` ou `.csv`
5. Na aba **Importação em Lote**, faça o upload

---

## ⚙️ Configurações Persistidas

As configurações salvas na aba **Configurações** ficam gravadas no navegador (localStorage).
Elas pré-preenchem automaticamente:
- Dia de vencimento
- Multa e juros por atraso
- Prazos de suspensão e rescisão
- Reajuste (índice e piso)
- 13ª parcela
- Cidade/UF/foro da assinatura

---

## 🚀 Subir no GitHub

```bash
# Dentro da pasta do projeto
git init
git add .
git commit -m "feat: MVP Gerador de Contratos Êxito v1.0.0"

# Crie o repositório no GitHub e então:
git remote add origin https://github.com/seu-usuario/exito-contratos.git
git push -u origin main
```

### GitHub Pages (opcional — deploy gratuito)

No repositório do GitHub: **Settings → Pages → Source: main branch → Save**

A ferramenta ficará disponível em:
`https://seu-usuario.github.io/exito-contratos`

---

## 📦 Bibliotecas Utilizadas

| Biblioteca | Versão | Função |
|---|---|---|
| docxtemplater | 3.42.1 | Substitui placeholders no .docx |
| PizZip | 3.1.4 | Lê/escreve o formato ZIP interno do .docx |
| SheetJS (xlsx) | 0.20.0 | Lê planilhas .xlsx e .csv |
| JSZip | 3.10.1 | Empacota contratos em .zip |
| FileSaver.js | 2.0.5 | Dispara download de Blobs |
| Lucide Icons | latest | Ícones SVG |

Todas carregadas via CDN — sem instalação necessária.

---

## 🔮 Melhorias Futuras Planejadas

- [ ] Banco de dados de clientes (IndexedDB local ou Supabase)
- [ ] Integração com assinatura eletrônica (D4Sign, DocuSign)
- [ ] Exportação PDF via headless browser
- [ ] Histórico de contratos gerados
- [ ] Múltiplos modelos de contrato por regime tributário
- [ ] Backend Node.js para geração PDF server-side

---

## 🛟 Suporte

Em caso de problemas:
1. Abra o **Console do navegador** (`F12 → Console`) para ver erros detalhados
2. Verifique se os placeholders do modelo Word estão no formato `{{campo}}`
3. Verifique se está usando Live Server (não abrindo o .html direto)

---

**Êxito Assessoria Contábil e Serviços de Escritório Virtuais LTDA**  
CRCPB nº 011.005/O-3 — Fabio Henrique de Moura Silva
