<template>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron&display=swap" rel="stylesheet">
  <div v-if="pageReady">
    <div>
      <title>Cyberpong 2042</title>
      <div class="header">
        <img src="~/assets/icons/home.svg" alt="Home-Icon" class="icon-home" @click="refresh_page" />
        <div class="icon-container">
          <!-- Icône Profile (visible si l'utilisateur est connecté) -->
          <img v-if="isUserLoggedIn" src="~/assets/icons/user.svg" alt="Profile-Icon" class="icon-user"
            @click="isProfileOpen = !isProfileOpen" />
          <img v-if="isUserLoggedIn" src="~/assets/icons/friends.svg" alt="Register-Icon" class="icon-friends"
            @click="isFriendListOpen = !isFriendListOpen" />
          <img v-if="isUserLoggedIn" src="~/assets/icons/disconnect.svg" alt="Register-Icon" class="icon-door"
            @click="showLogoutConfirmation = true" />

          <!-- Icônes Login et Register (cachées si l'utilisateur est connecté) -->
          <img v-if="!isUserLoggedIn" src="~/assets/icons/login.svg" alt="Login-Icon" class="icon-login"
            @click="isLoginOpen = !isLoginOpen" />
          <img v-if="!isUserLoggedIn" src="~/assets/icons/lock.svg" alt="Register-Icon" class="icon-register"
            @click="isRegisterOpen = !isRegisterOpen" />
        </div>
      </div>
      <!-- Afficher le formulaire d'inscription -->
      <Register v-if="isRegisterOpen" @close="isRegisterOpen = false" />
      <!-- Afficher le formulaire de connexion -->
      <Login v-if="isLoginOpen" @close="isLoginOpen = false" />
      <!-- Afficher le profil -->
      <Profile v-if="isProfileOpen" :otherUserId="profileUserId" @closeProfile="isProfileOpen = false"
        @clearOtherUserId="clearOtherUserId" />
      <!-- Afficher la liste des channels -->
      <Channel v-if="showChannelList" @close-channel-list="handleCloseChannelList"
        @channel-joined="handleChannelJoined" />
      <!-- Afficher la liste des parties en cours pour le mode spectateur -->
      <Spectate v-if="showMatchList" @close-match-list="handleCloseMatchList" />
      <button v-if="!showGame && showMatchList" @click="handleCloseMatchList" class="return-btn">Retour</button>
      <!-- Afficher le chat -->
      <PrivateChat v-if="isPrivateChatOpen" @close="isPrivateChatOpen = false" :friendFromRelation="selectedFriend"
        :channel="selectedChannel" @showProfile="showProfile" />
      <!-- Affiche la deconnexion -->
      <Logout :showlogout="showLoggedOut" :showconfirmation="showLogoutConfirmation" @close-logout="" />
      <!-- Afficher la liste des parties -->
      <Leaderboard v-if="showLeaderboard_" @close-list="handleCloseList" />
      <!--Affiche la liste d'amis  -->
      <FriendList v-if="isFriendListOpen" @closeFriendList="isFriendListOpen = false" @openPrivateChat="openPrivateChat"
        @createDuel="handleDuel" @showProfile="showProfile" @inviteToChannel=""/>
      <!-- Afficher la fenêtre de duel -->
      <Duel v-if="showDuel" @cancelDuel="handleCloseDuel" :duelFriend="selectedFriend" />
      <Duel v-if="showAccept" @cancelDuel="handleCloseDuel" />
      <!-- Afficher le matchmaking -->
      <Matchmaking v-if="showMatchmaking" @cancelMatchmaking="handleCloseMatchmaking" />
    </div>
    <div class="body">
      <div class="center-container">
        <button
          v-if="!showGame && !showMenu && !showLeaderboard_ && !showChannelList && !showMatchmaking && !showDuel && !showAccept && !showMatchList"
          @click="startOrLogin" class="start-login-btn">
          {{ isUserLoggedIn ? 'Démarrer' : 'Connexion' }}
        </button>
        <div v-if="showMenu" class="menu-container">
          <button @click="createMatchmakingForUser(false)" class="menu-btn">Partie Rapide</button>
          <button @click="createMatchmakingForUser(true)" class="menu-btn">Partie Classée</button>
          <button @click="showOngoingGames" class="menu-btn">Mode Spectateur</button>
          <button @click="showOnlineChannel" class="menu-btn">Channel</button>
          <button @click="showLeaderboard" class="menu-btn">Classement</button>
          <button @click="showMenu = false" class="menu-btn">Options</button>
          <button @click="showMenu = false" class="menu-btn">Quitter</button>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="icon-container">
        <img v-if="isUserLoggedIn && !isPrivateChatOpen" src="~/assets/icons/chat.svg" alt="Chat-Icon" class="icon-chat"
          @click="isPrivateChatOpen = !isPrivateChatOpen" />
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
/* game */
import Matchmaking from './game/Matchmaking.vue';
import Duel from './game/Duel.vue';
import Spectate from './game/Spectate.vue';
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
      showGame: false,
      showLogoutConfirmation: false,
      showLoggedOut: false,
      showMenu: false,
      showLeaderboard_: false,
      showChannelList: false,
      showMatchmaking: false,
      showMatchList: false,
      pageReady: false,


      isLoginOpen: false, //login
      isRegisterOpen: false, //register
      isFriendListOpen: false, //relation list : friendlist, invitation list, waiting list, blocked list
      isUserLoggedIn: false,
      isPrivateChatOpen: false,
      isProfileOpen: false,
      selectedFriend: null,
      selectedChannel: null,

    };
  },
  setup() {
    const { cookies } = useCookies();
    const state = reactive({
      showDuel: false,
      showAccept: false,
      profileUserId: null,
      cookies,
    });
    return state;
  },
  components: {
    Leaderboard,
    Register,
    Login,
    Logout,
    PrivateChat,
    Profile,
    Channel,
    FriendList,
    Matchmaking,
    Duel,
    Spectate,
  },
  methods: {
    showProfile(otherUserId) {
      this.profileUserId = otherUserId;
      this.isProfileOpen = true;
      this.isFriendListOpen = false;
    },
    clearOtherUserId() {
    this.profileUserId = null;
  },
    handleDuel(friend) {
      this.showMenu = false;
      this.selectedFriend = friend;
      this.createDuel();
    },
    handleChannelJoined(channelId) {
      this.isPrivateChatOpen = true;
    },
    openPrivateChat(friend) {
      this.selectedFriend = friend;
      this.isPrivateChatOpen = true;
    },
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
    refresh_page() {
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
    handleCloseMatchList() {
      this.showMatchList = false;
      this.showMenu = true;
    },
    handleCloseMatchmaking() {
      this.showMatchmaking = false;
      this.showMenu = true;
    },
    handleCloseDuel() {
      this.showDuel = false;
      this.showMenu = true;
    },
    handleQuitGame() {
      this.showGame = false; // Cela va cacher le composant Game
      this.showMenu = true; // Et cela va afficher à nouveau le menu principal
    },
    showLeaderboard() {
      this.showLeaderboard_ = true; // Affiche le leaderboard
      this.showMenu = false; // Cache le menu
    },
    showOnlineChannel() {
      this.showChannelList = true; // Affiche la liste des channels publics
      this.showMenu = false; // Cache le menu
    },
    showOngoingGames() {
      this.showMatchList = true; // Affiche la liste des parties en cours
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
    async loopDuelMatchmaking() {
      const userId = this.cookies.get("userId");
      const token = this.cookies.get('authToken'); // get the token from the cookies
      const baseUrl = `http://${window.location.hostname}`;
      this.intervalId = setInterval(async () => {
        try {
          const response = await fetch(`${baseUrl}:2000/matchmaking/userId/${userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Error getting matchmaking');
          }
          const m = await response.json();
          if (m) {
            if (m.isDuel && m.isDuelAccepted == false) {
              this.showAccept = true;
              this.showMenu = false;
              // console.log("Duel trouvé");
              clearInterval(this.intervalId);
            }
          } else {
            console.log('ERROR');
          }
        } catch (error) {
          // console.log('Error in loopMatchmaking:', error);
          clearInterval(this.intervalId);
        }
      }, 1000);
    },
    async createDuel() {
      const userId = this.cookies.get("userId");
      const token = this.cookies.get('authToken'); // get le token dans les cookies
      const targetId = this.selectedFriend;
      const baseUrl = `http://${window.location.hostname}`;
      try {
        const response = await fetch(`${baseUrl}:2000/matchmaking/initiateDuel/${userId}/${targetId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Erreur lors de la création du duel');
        }
        this.showDuel = true;
        this.showMenu = false;
        const duel = await response.json();
        // this.$emit('duelCreated', duel);
        // console.log(duel);
        return duel;
      } catch (error) {
        // console.log(userId);
        // console.log(token);
        console.log('Erreur lors de la création du duel pour l’utilisateur :', error);
      }
    },
  },
  mounted() {
    this.checkLoginStatus();
    if (this.showMatchmaking)
      this.intervalId = setInterval(() => {
        this.loopDuelMatchmaking();
      }, 2000);
  },
};
</script>

<style>
@import '~/assets/css/global.css';
</style>