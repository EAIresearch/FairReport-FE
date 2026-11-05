<script setup>
// onMounted:
// Executa uma função quando o componente é inserido na tela.
//
// onUnmounted:
// Executa uma função quando o componente é removido da tela.
import { onMounted, onUnmounted } from 'vue'
import RelatorioView from '@/views/RelatorioView.vue'

defineProps({
  relatorio: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['fechar'])

function fecharComEsc(event) {
  if (event.key === 'Escape') {
    emit('fechar')
  }
}

onMounted(() => {
  window.addEventListener('keydown', fecharComEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', fecharComEsc)
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('fechar')">
      <section class="modal-window" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header class="modal-header">
          <div>
            <p class="eyebrow">FairReport</p>
            <h1 id="modal-title">Relatório de avaliação</h1>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Fechar relatório"
            title="Fechar"
            @click="emit('fechar')"
          >
            &times;
          </button>
        </header>

        <div class="modal-body">
          <RelatorioView :relatorio="relatorio" />
        </div>

        <footer class="modal-footer">
          <button type="button" class="button-close" @click="emit('fechar')">
            Fechar relatório
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  background: rgb(15 23 42 / 65%);
}

.modal-window {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 820px;
  max-height: 90vh;
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 20px 60px rgb(0 0 0 / 25%);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.eyebrow {
  margin: 0 0 5px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.modal-header h1 {
  margin: 0;
  font-size: 22px;
}

.close-button {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: #f1f5f9;
  color: #334155;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
}

.close-button:hover {
  background: #e2e8f0;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.button-close {
  padding: 11px 20px;
  border: 0;
  border-radius: 7px;
  background: #1565c0;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.button-close:hover {
  background: #0d47a1;
}

@media (max-width: 600px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-window {
    max-height: 95vh;
  }

  .modal-header,
  .modal-body {
    padding: 16px;
  }

  .modal-header h1 {
    font-size: 18px;
  }

  .modal-footer {
    padding: 12px 16px;
  }
}
</style>
