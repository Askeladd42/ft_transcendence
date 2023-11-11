<!-- Home.vue -->
<template>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron&display=swap" rel="stylesheet">
  <div v-if = "pageReady">
  <div>
    <title>Cyberpong 2042</title>
    <div class="header">
    <img src="~/assets/icons/home.svg" alt="Home-Icon" class="icon-home" @click="refresh_page" />
    <div class="icon-container">
      <!-- Icône Profile (visible si l'utilisateur est connecté) -->
      <img v-if="isUserLoggedIn" src="~/assets/icons/user.svg" alt="Profile-Icon" class="icon-user" @click="showProfilePage = true" />
      <img v-if="isUserLoggedIn" src="~/assets/icons/friends.svg" alt="Register-Icon" class="icon-friends"  @click="isFriendListOpen = !isFriendListOpen" />
      <img v-if="isUserLoggedIn" src="~/assets/icons/disconnect.svg" alt="Register-Icon" class="icon-door" @click="showLogoutConfirmation = true" />
      
      <!-- Icônes Login et Register (cachées si l'utilisateur est connecté) -->
      <img v-if="!isUserLoggedIn" src="~/assets/icons/login.svg" alt="Login-Icon" class="icon-login" @click="isLoginOpen = !isLoginOpen"/>
      <img v-if="!isUserLoggedIn" src="~/assets/icons/lock.svg" alt="Register-Icon" class="icon-register" @click="isRegisterOpen = !isRegisterOpen" />
    </div>
</div>
    <!-- Afficher le formulaire d'inscription -->
    <Register v-if = "isRegisterOpen" @close="isRegisterOpen = false" />
    <!-- Afficher le formulaire de connexion -->
    <Login v-if= "isLoginOpen" @close="isLoginOpen = false"/>
    <!-- Afficher le profil -->
    <Profile :showprofile="showProfilePage" />
    <!-- Afficher la lsite des channels -->
    <Channel v-if="showChannelList" @close-channel-list="handleCloseChannelList" />
    <!-- Afficher le chat -->
    <PrivateChat v-if = "isPrivateChatOpen" @close ="isPrivateChatOpen = false" />
    <!-- Affiche la deconnexion -->
    <Logout :showlogout="showLoggedOut" :showconfirmation="showLogoutConfirmation" />
    <!-- Afficher la liste des parties -->
    <Leaderboard v-if="showLeaderboard_" @close-list="handleCloseList"/>
    <!--Affiche la liste d'amis  -->
    <FriendList v-if="isFriendListOpen" @close="isFriendListOpen = false" />
    <!-- Afficher le matchmaking -->
    <Matchmaking v-if="showMatchmaking" @cancelMatchmaking="handleCloseMatchmaking" />

</div>
<div class = "body">
      <div class="center-container">
        <button v-if="!showGame && !showMenu && !showLeaderboard_ && !showChannelList && !showMatchmaking" @click="startOrLogin" class="start-login-btn">
    {{ isUserLoggedIn ? 'Démarrer' : 'Connexion' }}
</button>
  <div v-if="showMenu" class="menu-container">
    <button @click="createMatchmakingForUser(false)" class="menu-btn">Partie Rapide</button>
    <button @click="createMatchmakingForUser(true)" class="menu-btn">Partie Classée</button>
    <button @click="showOnlineChannel" class="menu-btn">Channel</button>
    <button @click="showLeaderboard" class="menu-btn">Classement</button>
    <button @click="showMenu = false" class="menu-btn">Options</button>
    <button @click="showMenu = false" class="menu-btn">Quitter</button>
  </div>
</div>

    </div>
    <div class="footer">
      <div class="icon-container">
        <img v-if="isUserLoggedIn && !isPrivateChatOpen" src="~/assets/icons/chat.svg" alt="Chat-Icon" class="icon-chat" @click="isPrivateChatOpen= !isPrivateChatOpen" />
      </div>
    </div>
</div>
<div v-else class="loading-container">
  <title>Cyberpong 2042</title>
  <!-- <p class="loading-text">Chargement...</p> -->
</div>
</template>

<script>
/* auth */
import Login from './auth/Login.vue';
import Logout from './auth/Logout.vue';
import Register from './auth/Register.vue';
/* chat */
import PrivateChat from './chat/PrivateChat.vue';
import Channel from './chat/Channel.vue';

import Matchmaking from './game/Matchmaking.vue';

/* user */
import Profile from './user/Profile.vue';
import Leaderboard from './user/Leaderboard.vue';
import FriendList from './user/Relations.vue';
import { useCookies } from "vue3-cookies"; // cookies

export default {
  name: 'HomePage',
  data() {
    return {
      /*  show */
      showProfilePage: false,
      showProfile: false,
      showProfileIcon: false,
      showGame: false,
      showLogoutConfirmation: false,
      showLoggedOut: false,
      pageReady: false,
      showMenu: false,
      showLeaderboard_: false,
      showChannelList: false,
      showMatchmaking: false,

      isLoginOpen: false, //login
      isRegisterOpen : false, //register
      isFriendListOpen: false, //relation list : friendlist, invitation list, waiting list, blocked list
      isUserLoggedIn: false,
      isPrivateChatOpen: false,

    };
  },
  setup() {
    const { cookies } = useCookies();
    return { cookies };
  },
  mounted() {
    this.checkLoginStatus();
  },
  components : {
    Leaderboard,
    Register,
    Login,
    Logout,
    PrivateChat,
    Profile,
    Channel,
    FriendList,
    Matchmaking,
  },
  methods: {
    checkLoginStatus() {
      const authToken = this.cookies.get("authToken");
      setTimeout(() => { 
        this.isUserLoggedIn = !!authToken;
        this.pageReady = true; // Maintenant, la page est prête à être affichée.
      }, 1); // Simule un délai de traitement
    },
    toggleChat() {
    if (this.showChat)
      this.showChat = false;
    else
      this.showChat = true;
    },
    toggleFriendList() {
      this.$emit('toggle-friend-list');
      },
    refresh_page () {
            window.location.reload();
    },
    startOrLogin() {
    if (this.isUserLoggedIn) {
      this.showMenu = true;
    } else {
      this.isLoginOpen = true;
    }
    },
    startGame() {
      this.showMenu = false;
      this.showGame = true;
    },
    handleUserLoggedIn(isLoggedIn) {
      this.isUserLoggedIn = isLoggedIn;
    },
    handleCloseList() {
      this.showLeaderboard_ = false;
      this.showMenu = true;
    },
    handleCloseChannelList() {
      this.showChannelList = false;
      this.showMenu = true;
    },
    handleCloseMatchmaking() {
      this.showMatchmaking = false;
      this.showMenu = true;
    },
    handleQuitGame() {
      this.showGame = false; // Cela va cacher le composant Game
      this.showMenu = true; // Et cela va afficher à nouveau le menu principal
    },
    showLeaderboard() {
        this.showLeaderboard_ = true; // Affiche la liste des parties en ligne
        this.showMenu = false; // Cache le menu
      },
      showOnlineChannel() {
        this.showChannelList = true; // Affiche la liste des parties en ligne
        this.showMenu = false; // Cache le menu
      },
      async createMatchmakingForUser(isRanked) {
      const userId = this.cookies.get("userId"); 
      const token = this.cookies.get('authToken'); // get le token dans les cookies
      const baseUrl = `http://${window.location.hostname}`;
      try {
        const response = await fetch(`${baseUrl}:2000/matchmaking/create/${userId}/${isRanked}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Erreur lors de la création du matchmaking');
        }
        this.showMatchmaking = true;
        this.showMenu = false;
        // console.log('Matchmaking créé avec succès');
        return await response.json();
      } catch (error) {
        // console.log(userId);
        // console.log(token);
        console.log('Erreur lors de la création du matchmaking pour l’utilisateur :', error);
      }
    },
  },
};
</script>
<style>
@import '~/assets/css/global.css';
</style>