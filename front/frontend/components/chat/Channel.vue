<template>
     <div v-if="showChannels" class="channel-list">
        <span class="close-btn" @click="closeChannelList">&times;</span>
        <h2>Liste des Channels</h2>
        <ul>
          <li v-for="channel in channels" :key="channel.id" class="channel-item" @click="openChatroom(channel)">
        {{ channel.name }}
      </li>
        </ul>
        <button @click="createChannel" class="create-channel-btn">Créer un Channel</button>
      </div>
      <ChatRoom :channel="activeChannel" :is-visible="isChatroomVisible" @close="isChatroomVisible=false"></ChatRoom>
  </template>
  
  <script>
  import ChatRoom from './ChatRoom.vue';
  export default {
    name: 'Channel',
    data() {
      return {
    channels: [
          { id: 1, name: 'Channel 1' },
          { id: 2, name: 'Channel 2' },
          { id: 3, name: 'Channel 3' },
          
          // Plus de channels...
        ],
        showChannels: true,
        activeChannel: null,
        isChatroomVisible: false,
      };
    },
      components: {
      ChatRoom,
    },
        methods: {
          closeChannelList() {
            this.showChannels = false;
            this.$emit('close-channel-list');
          },
          createChannel() {
        this.channels.push({
        id: this.channels.length + 1,
        name: `Channel ${this.channels.length + 1}`
      });
    },
    openChatroom(channel) {
      this.activeChannel = channel;
      this.isChatroomVisible = true;
    },
   }
  };
  </script>
  
  <style>
    @import '~/assets/css/channel.css';
  </style>
  