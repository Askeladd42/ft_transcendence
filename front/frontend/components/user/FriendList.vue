<template>
    <div id="friendListContainer" class="friend-list-container" v-if="isFriendListOpen">
      <div class="friend-list-header">Amis<span class="close-friend-list" @click="closeFriendList">&times;</span></div>
      <ul class="friend-list-content">
        <li v-for="friend in friends" :key="friend.id" class="friend-item">
          {{ friend.name }}
          <button @click="removeFriend(friend.id)" class="remove-friend-btn">✖</button>
        </li>
      </ul>
      <div class="add-friend">
        <input type="text" v-model="newFriend" placeholder="Ajouter un ami" @keyup.enter="addFriend">
        <button @click="addFriend" class="add-friend-btn">+</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        friends: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
          // ajoutez d'autres amis ici
        ],
        newFriend: '', // utilisé pour la liaison de données avec le champ d'entrée
        isFriendListOpen: true // Variable de contrôle pour l'affichage de la liste d'amis
      };
    },
    methods: {
      addFriend() {
        if (this.newFriend.trim()) {
          const newId = this.friends.length ? this.friends[this.friends.length - 1].id + 1 : 1;
          this.friends.push({ id: newId, name: this.newFriend });
          this.newFriend = ''; // Réinitialisez le champ d'entrée
        }
      },
      removeFriend(id) {
        this.friends = this.friends.filter(friend => friend.id !== id);
      },
      closeFriendList() {
      this.$emit('close');
    },
    }
  };
  </script>
  
  <style>
  @import '~/assets/css/friendlist.css';
  </style>
  