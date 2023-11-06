<!-- ChatRoom.vue -->
<template>
    <div v-if="isVisible" id="chatContainer" class="chat-container" @mousedown="dragStart" @mousemove="dragging" @mouseup="dragEnd">
      <div class="chat-header">
        {{ channel.name }}
        <span @click="close" class="close-chat">&times;</span>
      </div>
      <div class="chat-content">
        <!-- messages de chat iront ici -->
      </div>
      <div class="chat-input-container">
        <input type="text" placeholder="Type your message..." />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['channel', 'isVisible'],
    methods: {
      close() {
        this.$emit('close');
      },
    },
  };
  </script>
  
  <!-- Aucun style supplémentaire n'est nécessaire ici si vous utilisez le même CSS que pour votre autre chat -->
  