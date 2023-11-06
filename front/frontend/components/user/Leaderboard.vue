<!-- Leaderboard.vue -->
<template>
    <div v-if = "showLB" class="player-list">
      <span class="close-btn" @click="closeLeaderboard">&times;</span>
      <h2>Classement des joueurs</h2>
      <ul>
        <li v-for="player in players" :key="player.id" class="player-item">
          {{ player.name }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Leaderboard',
    data() {
      return {
        // Exemple de données, remplacez par les données réelles peut-être obtenues via une API ou un store Vuex
        players: [
          { id: 1, name: 'Joueur 1' },
          { id: 2, name: 'Joueur  2' },
          { id: 3, name: 'Joueur  3' },
          // Plus de parties...
        ],
        showLB: true,
      };
    },
    methods: {
      closeLeaderboard() {
        this.showLB = false;
        this.$emit('close-list');
      },
    //   createPlayer() {
    //     this.players.push({
    //     id: this.players.length + 1,
    //     name: `Joueur  ${this.players.length + 1}`
    //   });
    // },
    }
  };
  </script>
  <style>
  @import '~/assets/css/leaderboard.css';
  </style>