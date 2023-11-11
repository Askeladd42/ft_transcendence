<template>
  <!-- ajouter des onglets pour pouvoir naviguer entre les listes d'amis, d'invitations, d'attente et de personnes bloquées -->
    <div id="friendListContainer" class="list-container" v-if="isFriendListOpen">
      <v-tabs v-model="tab">
        <v-tab class="relation-header" v-for="(tabItem, index) in tabs" :key="index" @click="changeIndex(index)" :class="{ 'active-tab': tab === index }">{{ tabItem.icon }}</v-tab>
        <v-tab-item>
          <!-- Contenu de l'onglet Amis -->
          <div v-show="currentIndex === 0">  
            <ul class="user-list-content">
              <li v-for="friend in friendList" :key="friend" class="user-item">
                <!-- <v-img :src="friend.img"></v-img> -->
                {{ friend }}
                <button @click="deleteFriend(friend)" class="remove-user-btn">✖</button> <!-- on remplacera par async deleteFriend -->
              </li>
            </ul>
            <div class="add-friend">
              <input type="text" v-model="friend" placeholder="Ajouter un ami" @keyup.enter="acceptOrSendFriendRequest">
              <button @click="acceptOrSendFriendRequest" class="add-friend-btn">+</button>
            </div>
          </div>
        </v-tab-item>
        <v-tab-item>
          <!-- Contenu de l'onglet Invitaton -->
          <div v-show="currentIndex === 1"> 
            <ul class="user-list-content">
              <li v-for="sending in sendingList" :key="sending" class="user-item">
                {{ sending }}
                <!-- <button @click="cancelInvite(invited.id)" class="remove-user-btn">✖</button> -->
              </li>
            </ul>
          </div>
        </v-tab-item>
          <!-- Contenu de l'onglet En attente -->
        <v-tab-item>
          <div v-show="currentIndex === 2"> 
            <div class="friend-list-header" v-if="isWaitingListOpen">En attente<span class="close-friend-list" @click="closeRelationList">&times;</span></div>
            <ul class="user-list-content">
              <li v-for="pending in pendingList" :key="pending" class="user-item">
                {{ pending }}
                <button @click="acceptFriend(pending)" class="accept-user-btn">✓</button>
                <!-- <button @click="refuseInvite(waited.id)" class="remove-user-btn">✖</button> -->
              </li>
            </ul>
          </div>
        </v-tab-item>
          <!-- Contenu de l'onglet Bloqués -->
        <v-tab-item>
          <div v-show="currentIndex === 3"> 
            <div class="friend-list-header" v-if="isBlockListOpen">Bloqués<span class="close-friend-list" @click="closeRelationList">&times;</span></div>
              <ul class="user-list-content">
              <li v-for="blocked in blockedList" :key="blocked" class="user-item">
                {{ blocked }}
                <button @click="deleteBlockedUser(blocked)" class="remove-user-btn">✖</button>
              </li> 
            </ul>
            <div class="add-block">
              <input type="text" v-model="blocked" placeholder="Bloquer un utilisateur" @keyup.enter="blockUser">
              <button @click="blockUser" class="add-friend-btn">+</button>
            </div>
          </div> 
        </v-tab-item>
      </v-tabs>
    </div>
  </template>
  
  <script>
  import { useCookies } from "vue3-cookies"; // cookies
  export default {
    data() {
      return {
        tab: null,
        tabs: [     //les îcones peuvent être remplacées par des images pour un meilleur rendu
          {name: 'Amis' , icon: '👥'},
          {name: 'Invitations', icon: '📨'},
          {name: 'En attente', icon: '⏳'},
          {name: 'Bloqués', icon: '🚫'}
        ],
        newFriend: '', // utilisé pour la liaison de données avec le champ d'entrée
        isRelationListOpen: true, // Variable de contrôle pour l'affichage de la liste d'amis
        isFriendListOpen: true, // Variable de contrôle pour l'affichage de la liste d'amis
        isInviteListOpen: false, // Variable de contrôle pour l'affichage de la liste d'amis
        isWaitingListOpen: false, // Variable de contrôle pour l'affichage de la liste d'amis
        isBlockListOpen: false // Variable de contrôle pour l'affichage de la liste d'amis
      };
    },
    setup() {
      const { cookies } = useCookies();
      const state = reactive({
        userId: cookies.get("userId"),
        token: cookies.get("authToken"),
        cookies,
        blockedList : [],
        blockedListId : [],
        friendList : [],
        friendListId : [],
        sendingList: [],
        sendingListId: [],
        pendingList: [],
        pendingListId: [],
        currentIndex: 0, // index de l'onglet actif
        });
        return state;
    },
    mounted () {
      this.startLoop();
    // this.getUser("B");
    // this.getFriendList();
    // this.deleteBlockedUser("B");
    },
    methods: {
      async getUserById (id){
        const baseUrl = `http://${window.location.hostname}`;
        const response = await fetch(`${baseUrl}:2000/api/user/id/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`,
            },
          });
          const data = await response.json();
          return data.nickname;
      },
      async getUser(user) {
        try {
          const baseUrl = `http://${window.location.hostname}`;
          const field = "nickname";
          const searchstring = user; // user's nickname
          const sort = "id";
          const asc = "asc";
          const response = await fetch(`${baseUrl}:2000/api/users/${field}/${searchstring}/${sort}/${asc}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`,
            },
          });
          const data = await response.json();
          // console.log(data);
          return data;
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        }
      },
      async getFriendList() {
        try {
          const baseUrl = `http://${window.location.hostname}`;
          const response = await fetch(`${baseUrl}:2000/relation/findMyFriend/${this.userId}`, {
            method : 'GET',
            headers : {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`,
            },
          });
          this.friendList = [];
          this.friendListId = await response.json();
          for (let i = 0; i < this.friendListId.length; i++)
          {
            var temp = await this.getUserById(this.friendListId[i]);
            this.friendList.push(temp);
            
          }
          console.log(this.friendListId);
          // console.log(this.friendlist);
        } catch (error) {
          console.error('Erreur lors de la récupération de la liste d\'amis:', error);
        }
      },

      async getSendingList() { // invitation envoyée
        try {
          const baseUrl = `http://${window.location.hostname}`;
          const response = await fetch(`${baseUrl}:2000/relation/findFriendEmmitedRequest/${this.userId}`, {
            method : 'GET',
            headers : {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`,
            },
          });
          this.sendingList = [];
          this.sendingListId = await response.json();
          for (let i = 0; i < this.sendingListId.length; i++)
          {
            var temp = await this.getUserById(this.sendingListId[i]);
            this.sendingList.push(temp);
            
          }
          // console.log(this.blockedlist);
        } catch (error) {
          console.error('Erreur lors de la récupération de la liste des gens bloques:', error);
        }
      },
      async getPendingList() { // invitations reçues
        try{
          const baseUrl = `http://${window.location.hostname}`;
          const response = await fetch(`${baseUrl}:2000/relation/findMyPendingRequest/${this.userId}`, {
            method : 'GET',
            headers : {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`,
            },
          });
          this.pendingList = [];
          this.pendingListId = await response.json();
          for (let i = 0; i < this.pendingListId.length; i++)
          {
            var temp = await this.getUserById(this.pendingListId[i]);
            this.pendingList.push(temp);
            
          }
          // console.log(this.blockedlist);
        } catch (error) {
          console.error('Erreur lors de la récupération de la liste des gens bloques:', error);
        }
      },
      
      async getBlockedList() {// fonctionne
        try {
          const baseUrl = `http://${window.location.hostname}`;
          const response = await fetch(`${baseUrl}:2000/relation/findMyBlocked/${this.userId}`, {
            method : 'GET',
            headers : {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`,
            },
          });
          this.blockedList = [];
          this.blockedListId = await response.json();
          for (let i = 0; i < this.blockedListId.length; i++)
          {
            var temp = await this.getUserById(this.blockedListId[i]);
            this.blockedList.push(temp);
            
          }
          // console.log(this.blockedlist);
        } catch (error) {
          console.error('Erreur lors de la récupération de la liste des gens bloques:', error);
        }
      },
      async blockUser(user) { // fonctionne
        try {
          const baseUrl = `http://${window.location.hostname}`;
          user = this.blocked;
          const search = await this.getUser(user);
          if (search) {
            // console.log(search.id);
            const response = await fetch(`${baseUrl}:2000/relation/blockSomeone/${this.userId}/${search[0].id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,

              },
            });
          }
        } catch (error) {
          console.error('Erreur lors du blocage de l\'utilisateur:', error);
        }
      },
      async deleteBlockedUser(user) {
        try {
          // const search = await this.getUser(user);
          var idtofind = null
          const baseUrl = `http://${window.location.hostname}`;
        for (let i = 0; i < this.blockedList.length; i++)  
          if (this.blockedList[i] == user)
            idtofind = this.blockedListId[i];
          const response = await fetch(`${baseUrl}:2000/relation/unBlockSomeone/${this.userId}/${idtofind}`,{
            method : 'DELETE',
            headers : {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`,
            },
          });
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'utilisateur bloqué:', error);
        }
      },
      async acceptOrSendFriendRequest(user) {
        try {
          const baseUrl = `http://${window.location.hostname}`;
          user = this.friend;
          const search = await this.getUser(user);
          if (search) {
          const response = await fetch(`${baseUrl}:2000/relation/emmitOrAcceptFriendRequest/${this.userId}/${search[0].id}`, {
            method : 'POST',
            headers : {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`,
            },
            });
          }
        } 
        catch (error) {
          console.error('Erreur lors de l\'ajout de l\'utilisateur en ami:', error);
        }
      
      },
      async acceptFriend(user) {
        try {
          // const search = await this.getUser(user);
          var idtofind = null;
          for (let i = 0; i < this.pendingList.length; i++)  
          if (this.pendingList[i] == user)
            idtofind = this.pendingListId[i];
          const baseUrl = `http://${window.location.hostname}`;
          if (user) {
          const response = await fetch(`${baseUrl}:2000/relation/emmitOrAcceptFriendRequest/${this.userId}/${idtofind}`,{
            method : 'POST',
            headers : {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`,
            },
          });
        }
      } catch (error) {
          console.error('Erreur lors de la suppression de l\'utilisateur en ami:', error);
        }
      },
      async deleteFriend(user) {
        try {
          // const search = await this.getUser(user);
          var idtofind = null;
          for (let i = 0; i < this.friendList.length; i++)  
          if (this.friendList[i] == user)
            idtofind = this.friendListId[i];
          const baseUrl = `http://${window.location.hostname}`;
          if (user) {
          const response = await fetch(`${baseUrl}:2000/relation/removeFriend/${this.userId}/${idtofind}`,{
            method : 'DELETE',
            headers : {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`,
            },
          });
        }
      } catch (error) {
          console.error('Erreur lors de la suppression de l\'utilisateur en ami:', error);
        }
      },
    
      async refreshLists() {
      try {
        await this.getFriendList();
        await this.getSendingList();
        await this.getPendingList();
        await this.getBlockedList();
      } catch (error) {
        console.error('Erreur lors de la mise à jour des listes :', error);
      }
    },

      startLoop() {
        this.refreshLists(); // Appel initial
        setInterval(this.refreshLists, 5000); // Exécutez la boucle toutes les 5 secondes
      },

      showList() {
         if (this.currentIndex === 0)
          this.getFriendList();
        else if (this.currentIndex === 1) 
          this.getSendingList();
        else if (this.currentIndex === 2) 
          this.getPendingList();
        else if (this.currentIndex === 3) 
          this.getBlockedList();
      },

      changeIndex(index) {
        this.currentIndex = index;
    },
      closeRelationList() {
      this.$emit('close');
      },
    },
  };
  </script>
  
  <style>
  @import '~/assets/css/friendlist.css';
  </style>
  