<script setup>
import HeaderHome from '@/views/Header.vue'
import { computed, ref } from 'vue'
import RelatorioModal from '@/components/RelatorioModal.vue'

// Endereço do backend. Pode ser configurado por variável de ambiente.
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/'

// Dados do formulário
const modelo = ref('')
const observacoes = ref('')
const dadosTeste = ref(null)
const atributoProtegido = ref(null)

const metricasJustica = ref([])
const metricasPerformance = ref([])

// Estado da requisição
const carregando = ref(false)
const erroApi = ref('')
const relatorio = ref(null)

const mostrarRelatorio = ref(false)

// Métricas de performance
const metricasPerformanceDisponiveis = [
  {
    id: 'accuracy',
    nome: 'Acurácia',
    descricao: 'Mede a proporção de previsões corretas em relação ao total de previsões.',
  },
  {
    id: 'micro-f1',
    nome: 'Micro F1',
    descricao: 'Calcula o F1 considerando globalmente as previsões de todas as classes.',
  },
  {
    id: 'macro-f1',
    nome: 'Macro F1',
    descricao: 'Calcula o F1 de cada classe e dá o mesmo peso a todas as classes.',
  },
]

// Métricas de justiça algorítmica
const metricasJusticaDisponiveis = [
  {
    id: 'dpd',
    nome: 'DPD',
    descricao: 'Mede a diferença entre as taxas de previsão positiva dos grupos.',
  },
  {
    id: 'eod',
    nome: 'EOD',
    descricao:
      'Mede a maior diferença entre as taxas de verdadeiros positivos e falsos positivos dos grupos.',
  },
  {
    id: 'eopd',
    nome: 'EOpD',
    descricao: 'Mede a diferença entre as taxas de verdadeiros positivos dos grupos.',
  },
]

// Validação dos campos obrigatórios
const formularioValido = computed(() => {
  return (
    modelo.value.trim() !== '' &&
    dadosTeste.value !== null &&
    atributoProtegido.value !== null &&
    metricasJustica.value.length > 0
  )
})

// Seleção dos arquivos
function selecionarDadosTeste(event) {
  dadosTeste.value = event.target.files?.[0] || null
  erroApi.value = ''
  relatorio.value = null
}

function selecionarAtributoProtegido(event) {
  atributoProtegido.value = event.target.files?.[0] || null
  erroApi.value = ''
  relatorio.value = null
}

// Limpa resultados antigos quando o usuário altera o formulário
function limparRelatorio() {
  relatorio.value = null
  erroApi.value = ''
}

// Envia os dados para o backend
async function gerarRelatorio() {
  if (!formularioValido.value || carregando.value) {
    return
  }

  carregando.value = true
  erroApi.value = ''
  mostrarRelatorio.value = false

  try {
    const formulario = new FormData()

    formulario.append('modelo', modelo.value.trim())
    formulario.append('observacoes', observacoes.value)
    formulario.append('dados_teste', dadosTeste.value)
    formulario.append('atributo_protegido', atributoProtegido.value)

    formulario.append('metricas_performance', metricasPerformance.value.join(','))

    formulario.append('metricas_justica', metricasJustica.value.join(','))

    const API_URL = import.meta.env.VITE_API_URL

    async function gerarRelatorio(formData) {
      const resposta = await fetch(`${API_URL}/avaliar`, {
        method: 'POST',
        body: formData,
      })

      if (!resposta.ok) {
        throw new Error(`Erro HTTP: ${resposta.status}`)
      }

      return await resposta.json()
    }

    const texto = await resposta.text()
    let dados

    try {
      dados = JSON.parse(texto)
    } catch {
      throw new Error(`Resposta inválida do servidor (HTTP ${resposta.status}).`)
    }

    if (!resposta.ok) {
      throw new Error(
        typeof dados.detail === 'string' ? dados.detail : `Erro HTTP ${resposta.status}.`,
      )
    }

    if (!dados.resultado) {
      throw new Error('O servidor respondeu, mas não retornou os resultados da avaliação.')
    }

    relatorio.value = dados
    mostrarRelatorio.value = true
  } catch (erro) {
    console.error('Erro ao gerar relatório:', erro)

    erroApi.value =
      erro instanceof TypeError
        ? 'Não foi possível conectar ao backend. Verifique se o FastAPI está em execução.'
        : erro.message || 'Não foi possível gerar o relatório.'
  } finally {
    carregando.value = false
  }
}

// Formatação para apresentar os resultados
function formatarValor(valor) {
  if (valor === null || valor === undefined) {
    return 'Não disponível'
  }

  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor.toFixed(4) : 'Não disponível'
  }

  return String(valor)
}

function nomeMetrica(chave) {
  const nomes = {
    accuracy: 'Acurácia',
    'micro-f1': 'Micro F1',
    micro_f1: 'Micro F1',
    'macro-f1': 'Macro F1',
    macro_f1: 'Macro F1',
    dpd: 'DPD',
    spd: 'SPD',
    eod: 'EOD',
    eopd: 'EOpD',
  }

  return nomes[chave] || chave
}
</script>
<template>
  <div class="page">
    <!-- Cabeçalho
 -->

    <header class="page-header">
      <HeaderHome />
    </header>
    <RelatorioModal
      v-if="mostrarRelatorio && relatorio"
      :relatorio="relatorio"
      @fechar="mostrarRelatorio = false"
    />

    <main class="container">
      <!-- Introdução -->

      <section class="intro">
        <h1>Justiça Algorítmica</h1>

        <p>
          Esta ferramenta tem como objetivo avaliar modelos de inteligência artificial quanto à
          existência de possíveis diferenças de tratamento entre grupos de pessoas.
        </p>

        <p class="required-info">
          Os campos marcados com
          <strong>*</strong>
          são obrigatórios.
        </p>
      </section>

      <!-- Modelo -->

      <div class="form-group">
        <label for="modelo">
          Modelo
          <span class="required">*</span>
        </label>
        <span class="metric-help" tabindex="0">
          ?

          <span class="metric-tooltip">
            {{ 'Informação textual para identificar o modelo que está sendo testado.' }}
          </span>
        </span>
        <div class="input-tooltip">
          <input
            v-model="modelo"
            id="modelo"
            name="modelo"
            type="text"
            class="form-control"
            placeholder="Digite o nome do modelo"
          />
        </div>
      </div>

      <!-- Dados de teste -->

      <div class="form-group">
        <label for="csvFile">
          Dados de teste
          <span class="required">*</span>
        </label>
        <span class="metric-help" tabindex="0">
          ?

          <span class="metric-tooltip">
            {{
              'CSV com duas colunas: uma contendo o rótulo real e outra contendo o rótulo predito pelo modelo.'
            }}
          </span>
        </span>
        <div class="input-tooltip">
          <input
            id="csvFile"
            name="csvFile"
            type="file"
            accept=".csv,text/csv"
            class="form-control"
            @change="selecionarDadosTeste"
          />
        </div>
      </div>

      <!-- Atributo protegido -->

      <div class="form-group">
        <label for="atributoProtegido">
          Atributo protegido
          <span class="required">*</span>
        </label>
        <span class="metric-help" tabindex="0">
          ?

          <span class="metric-tooltip">
            {{
              'CSV contendo uma única coluna com o atributo protegido utilizado para comparar os diferentes grupos durante a avaliação.'
            }}
          </span>
        </span>
        <div class="input-tooltip">
          <input
            id="atributoProtegido"
            name="atributoProtegido"
            type="file"
            accept=".csv,text/csv"
            class="form-control"
            @change="selecionarAtributoProtegido"
          />
        </div>
      </div>

      <!-- MÉTRICAS DE PERFORMANCE PREDITIVA -->

      <div class="form-group metricas-group">
        <label class="metricas-label"> Performance preditiva </label>

        <div class="metricas-content">
          <div class="metricas-ajuda">Selecione as métricas de desempenho que deseja calcular.</div>

          <div class="checkbox-group">
            <label
              v-for="metrica in metricasPerformanceDisponiveis"
              :key="metrica.id"
              class="metric-option"
            >
              <input
                v-model="metricasPerformance"
                type="checkbox"
                name="metricasPerformance"
                :value="metrica.id"
              />

              <span class="metric-name">
                {{ metrica.nome }}
              </span>

              <span class="metric-help" tabindex="0">
                ?

                <span class="metric-tooltip">
                  {{ metrica.descricao }}
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- MÉTRICAS DE JUSTIÇA ALGORÍTMICA -->

      <div class="form-group metricas-group">
        <label class="metricas-label">
          Métricas
          <span class="required">*</span>
        </label>

        <div class="metricas-content">
          <div class="metricas-ajuda">Selecione pelo menos uma métrica de justiça algorítmica.</div>

          <div class="checkbox-group">
            <label
              v-for="metrica in metricasJusticaDisponiveis"
              :key="metrica.id"
              class="metric-option"
            >
              <input
                v-model="metricasJustica"
                type="checkbox"
                name="metricasJustica"
                :value="metrica.id"
              />

              <span class="metric-name">
                {{ metrica.nome }}
              </span>

              <span class="metric-help" tabindex="0">
                ?

                <span class="metric-tooltip">
                  {{ metrica.descricao }}
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Observações -->

      <div class="form-group observacoes">
        <label for="observacoes"> Observações </label>

        <textarea
          v-model="observacoes"
          id="observacoes"
          name="observacoes"
          rows="4"
          placeholder="Digite alguma observação..."
        ></textarea>
      </div>

      <!--Mensagem de validação -->

      <div v-if="!formularioValido" class="form-message">
        Preencha todos os campos obrigatórios e selecione pelo menos uma métrica de justiça
        algorítmica.
      </div>

      <div v-else class="form-message success">
        Todos os campos obrigatórios foram preenchidos. O relatório está pronto para ser gerado.
      </div>

      <!-- Botão -->

      <div class="actions">
        <button
          type="button"
          :disabled="!formularioValido || carregando"
          :class="{ ready: formularioValido && !carregando }"
          @click="gerarRelatorio"
        >
          {{ carregando ? 'Gerando relatório...' : 'Gerar relatório' }}
        </button>
      </div>

      <p v-if="erroApi" class="error-message" role="alert">
        {{ erroApi }}
      </p>
    </main>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
}

.page-header {
  width: 100%;
}

.container {
  width: 100%;
  max-width: 650px;

  margin: 60px auto;
  padding: 0 20px;

  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  gap: 20px;
}

/* ==========================================
   Introdução
========================================== */

.intro {
  text-align: center;
  margin-bottom: 25px;
}

.intro h1 {
  margin-bottom: 15px;
  font-size: 26px;
}

.intro p {
  margin: 0;
  line-height: 1.6;
}

.required-info {
  margin-top: 10px !important;

  font-size: 13px;
  color: #666;
}

.required {
  color: #d32f2f;
  font-weight: bold;
}

/* ==========================================
   Grupos de formulário
========================================== */

.form-group {
  display: flex;
  align-items: center;

  gap: 15px;

  width: 100%;
}

.form-group > label {
  width: 165px;

  flex-shrink: 0;

  font-weight: 600;
}

/* ==========================================
   Inputs
========================================== */

.input-tooltip {
  position: relative;

  flex: 1;
  min-width: 0;
}

.form-control {
  width: 100%;
  min-width: 0;

  padding: 10px;

  border: 1px solid #ccc;
  border-radius: 6px;

  box-sizing: border-box;

  font-family: inherit;
  font-size: 14px;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-control:focus {
  outline: none;

  border-color: #555;

  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

.input-tooltip input[type='file'] {
  cursor: pointer;
}

/* ==========================================
   Métricas
========================================== */

.metricas-group {
  align-items: flex-start;
}

.metricas-label {
  width: 165px;

  flex-shrink: 0;

  padding-top: 2px;
}

.metricas-content {
  flex: 1;
  min-width: 0;
}

.metricas-ajuda {
  margin-bottom: 10px;

  font-size: 13px;
  color: #666;
}

.checkbox-group {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 18px;

  flex-wrap: wrap;
}

.metric-option {
  position: relative;

  display: flex;
  align-items: center;

  gap: 6px;

  cursor: pointer;

  white-space: nowrap;
}

.metric-option input[type='checkbox'] {
  width: 15px;
  height: 15px;

  margin: 0;

  cursor: pointer;
}

.metric-name {
  font-size: 14px;
}

/* ==========================================
   Tooltip das métricas
========================================== */

.metric-help {
  position: relative;

  display: inline-flex;

  justify-content: center;
  align-items: center;

  width: 18px;
  height: 18px;

  margin-left: 2px;

  border-radius: 50%;

  background: #666;
  color: #fff;

  font-size: 11px;
  font-weight: bold;

  cursor: help;
}

.metric-tooltip {
  position: absolute;

  left: 50%;
  bottom: calc(100% + 10px);

  transform: translateX(-50%);

  width: 280px;

  padding: 10px 12px;

  background: #333;
  color: #fff;

  border-radius: 6px;

  font-size: 12px;
  font-weight: normal;

  line-height: 1.5;

  white-space: normal;
  text-align: left;

  visibility: hidden;
  opacity: 0;

  pointer-events: none;

  z-index: 1000;

  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
}

.metric-tooltip::after {
  content: '';

  position: absolute;

  left: 50%;
  top: 100%;

  transform: translateX(-50%);

  border-width: 6px;
  border-style: solid;

  border-color: #333 transparent transparent transparent;
}

.metric-help:hover .metric-tooltip,
.metric-help:focus .metric-tooltip {
  visibility: visible;
  opacity: 1;
}

/* ==========================================
   Observações
========================================== */

.observacoes {
  align-items: flex-start;
}

.observacoes textarea {
  flex: 1;

  min-height: 100px;

  padding: 10px;

  border: 1px solid #ccc;
  border-radius: 6px;

  resize: vertical;

  font-family: inherit;
  font-size: 14px;

  box-sizing: border-box;
}

.observacoes textarea:focus {
  outline: none;

  border-color: #666;
}

/* ==========================================
   Mensagem de validação
========================================== */

.form-message {
  padding: 12px 15px;

  border-radius: 6px;

  background: #f5f5f5;
  color: #666;

  font-size: 13px;

  line-height: 1.5;

  text-align: center;
}

.form-message.success {
  background: #e8f5e9;
  color: #2e7d32;

  font-weight: 600;
}

/* ==========================================
   Botão
========================================== */

.actions {
  display: flex;
  justify-content: center;

  margin-top: 5px;
}

.actions button {
  min-width: 190px;

  padding: 12px 28px;

  border: none;
  border-radius: 7px;

  background: #d6d6d6;
  color: #777;

  cursor: not-allowed;

  font-size: 15px;
  font-weight: 600;

  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    transform 0.2s ease,
    box-shadow 0.25s ease;
}

.actions button.ready {
  background: #1976d2;
  color: #fff;

  cursor: pointer;

  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
}

.actions button.ready:hover {
  background: #125ca8;

  transform: translateY(-2px);

  box-shadow: 0 6px 15px rgba(25, 118, 210, 0.4);
}

.actions button.ready:active {
  transform: translateY(0);

  box-shadow: 0 3px 7px rgba(25, 118, 210, 0.3);
}

.actions button:disabled {
  opacity: 0.75;
}

/* ==========================================
   Responsividade
========================================== */

@media (max-width: 600px) {
  .container {
    margin: 25px auto;
    padding: 0 15px;
  }

  .form-group {
    flex-direction: column;
    align-items: stretch;
  }

  .form-group > label,
  .metricas-label {
    width: auto;
  }

  .metricas-group {
    align-items: stretch;
  }

  .checkbox-group {
    gap: 12px;
  }

  .metric-tooltip {
    left: 0;

    transform: none;
  }

  .metric-tooltip::after {
    left: 10px;

    transform: none;
  }

  .tooltip {
    width: 250px;
  }
}
.error-message {
  max-width: 650px;
  margin: 16px auto;
  padding: 12px 16px;
  border: 1px solid #ef9a9a;
  border-radius: 8px;
  background: #ffebee;
  color: #b71c1c;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
</style>
