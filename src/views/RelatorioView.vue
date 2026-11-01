<script setup>
import { computed } from 'vue'

const props = defineProps({
  relatorio: {
    type: Object,
    required: true,
  },
})

const resultado = computed(() => props.relatorio?.resultado || {})

const secoes = computed(() => [
  {
    titulo: 'Performance preditiva',
    dados: resultado.value.performance || {},
  },
  {
    titulo: 'Métricas de justiça algorítmica',
    dados: resultado.value.fairness || {},
  },
])

// Obtém a acurácia e a quantidade de registros de cada grupo.
const grupos = computed(() => {
  const dados = resultado.value.groups || {}

  return Object.entries(dados).map(([nome, valores]) => ({
    nome,
    acuracia: valores?.accuracy,
    quantidade: valores?.quantidade,
  }))
})

// Calcula a diferença absoluta entre a maior e a menor acurácia.
const diferencaAcuracia = computed(() => {
  const valores = grupos.value
    .map((grupo) => grupo.acuracia)
    .filter((valor) => typeof valor === 'number' && Number.isFinite(valor))

  if (valores.length < 2) {
    return null
  }

  return Math.max(...valores) - Math.min(...valores)
})

//nome das metricas
function nomeMetrica(chave) {
  const nomes = {
    accuracy: 'Acurácia geral',
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

//função para formatar valores
function formatarValor(valor) {
  if (valor === null || valor === undefined) {
    return 'Não disponível'
  }

  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor.toFixed(2) : 'Não disponível'
  }

  return String(valor)
}

//função para converte os resultados em percentuais
function formatarPercentual(valor) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    return 'Não disponível'
  }

  return `${(valor * 100).toFixed(2)}%`
}
</script>

<template>
  <div class="report-view">
    <!-- Resumo do relatório -->
    <section class="report-summary">
      <p class="report-label">Modelo avaliado</p>
      <h2>{{ relatorio.modelo || 'Modelo sem nome' }}</h2>

      <div class="record-count">
        <span>Registros avaliados</span>
        <strong>
          {{ resultado.quantidade_registros ?? 'Não informado' }}
        </strong>
      </div>

      <!--Seção das observações-->
      <div v-if="relatorio.observacoes" class="observations">
        <strong>Observações</strong>
        <p>{{ relatorio.observacoes }}</p>
      </div>
    </section>

    <!-- Secão para visualização das metricas -->
    <section v-for="secao in secoes" :key="secao.titulo" class="metric-section">
      <h3>{{ secao.titulo }}</h3>

      <div v-if="Object.keys(secao.dados).length" class="metric-grid">
        <article v-for="(valor, chave) in secao.dados" :key="chave" class="metric-card">
          <span class="metric-name">{{ nomeMetrica(chave) }}</span>
          <strong class="metric-value">
            {{ formatarValor(valor) }}
          </strong>
        </article>
      </div>

      <p v-else class="empty-message">Nenhuma métrica desta categoria foi calculada.</p>
    </section>

    <!-- Acurácia por atributo protegido -->
    <section class="metric-section">
      <h3>Acurácia por atributo protegido</h3>

      <p class="section-description">
        Compara o percentual de previsões corretas entre os grupos avaliados.
      </p>

      <div v-if="grupos.length" class="metric-grid">
        <article v-for="grupo in grupos" :key="grupo.nome" class="metric-card group-card">
          <span class="metric-name">Grupo: {{ grupo.nome }}</span>

          <strong class="metric-value">
            {{ formatarPercentual(grupo.acuracia) }}
          </strong>

          <span class="group-detail"> {{ grupo.quantidade ?? 'Não informado' }} registros </span>
        </article>
      </div>

      <p v-else class="empty-message">
        O backend não retornou a acurácia por grupo. Verifique se o objeto resultado.groups está
        sendo enviado pela API.
      </p>

      <div v-if="diferencaAcuracia !== null" class="difference-card">
        <span class="difference-label"> Diferença absoluta entre as acurácias </span>

        <strong class="difference-value">
          {{ formatarPercentual(diferencaAcuracia) }}
        </strong>

        <p>
          Diferença em pontos percentuais entre o grupo com maior acurácia e o grupo com menor
          acurácia.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.report-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: #263238;
}

.report-label {
  margin: 0 0 6px;
  color: #5f6b7a;
  font-size: 13px;
}

.report-summary h2 {
  margin: 0 0 18px;
  overflow-wrap: anywhere;
  font-size: 22px;
}

.record-count {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid #dce3eb;
}

.record-count strong {
  font-size: 20px;
}

.observations {
  margin-top: 16px;
  overflow-wrap: anywhere;
}

.observations p {
  margin-bottom: 0;
  line-height: 1.5;
}

.metric-section h3 {
  margin: 0 0 12px;
  font-size: 17px;
}

.section-description {
  margin: -2px 0 14px;
  color: #5f6b7a;
  font-size: 14px;
  line-height: 1.5;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 12px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  min-width: 0;
  padding: 16px;
  border: 1px solid #e0e5eb;
  border-radius: 8px;
  background: #fff;
}

.metric-name {
  color: #5f6b7a;
  font-size: 13px;
  line-height: 1.4;
}

.metric-value {
  overflow-wrap: anywhere;
  color: #1565c0;
  font-size: 22px;
}

.group-card {
  border-top: 3px solid #1565c0;
}

.group-detail {
  color: #697586;
  font-size: 12px;
}

.difference-card {
  margin-top: 14px;
  padding: 16px;
  border: 1px solid #dce3eb;
  border-radius: 8px;
  background: #f4f7fb;
}

.difference-label {
  display: block;
  color: #5f6b7a;
  font-size: 13px;
}

.difference-value {
  display: block;
  margin-top: 8px;
  color: #263238;
  font-size: 24px;
}

.difference-card p {
  margin: 8px 0 0;
  color: #5f6b7a;
  font-size: 13px;
  line-height: 1.5;
}

.empty-message {
  color: #697586;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
