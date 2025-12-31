<script setup lang="ts">
import MessageBuilder from './components/MessageBuilder.vue'
</script>

<template>
  <div class="app-container">
    <header>
      <h1>艾尔登法环 谏言模拟器</h1>
      <div class="divider"></div>
    </header>

    <main>
      <MessageBuilder />
    </main>

    <footer>
      <p>May grace guide thee.</p>
    </footer>
  </div>
</template>

<style>
/* Global Reset & Base Styles */
:root {
  --er-gold: #d4c4a8;
  --er-gold-dim: #8c7b60;
  --er-bg: #0a0a0a;
  --er-panel-bg: rgba(20, 20, 20, 0.9);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--er-bg);
  color: var(--er-gold);
  font-family: 'Times New Roman', 'Songti SC', serif;
  line-height: 1.6;
  min-height: 100vh;
  background-image: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%);
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: normal;
  letter-spacing: 0.1em;
  text-shadow: 0 0 10px rgba(212, 196, 168, 0.3);
  margin-bottom: 1rem;
}

.divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--er-gold-dim), transparent);
  width: 60%;
  margin: 0 auto;
}

main {
  flex: 1;
}

footer {
  text-align: center;
  margin-top: 4rem;
  color: #555;
  font-style: italic;
  font-size: 0.9rem;
}
</style>
