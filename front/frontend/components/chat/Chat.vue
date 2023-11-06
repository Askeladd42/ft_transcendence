<template>
<div v-if="showChat" id="chatContainer" class="chat-container-hidden">
    <div class="chat-header">Chat<span @click="refresh_page" class="close-chat">&times;</span></div>
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
    data() {
        return {
        };
    },
    props: ['showChat'],
    methods: {
        refresh_page() {
            window.location.reload();
        },
    },
};
</script>

<style>
@import '~/assets/css/chat.css';
</style>