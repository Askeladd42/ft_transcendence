<template>
<div v-if="isPrivateChatOpen" id="chatContainer" class="chat-container-hidden">
    <div class="chat-header">Chat<span @click="closeChat" class="close-chat">&times;</span></div>
    <ul class="friend-chat">
              <li v-for="friend in friendList" :key="friend" class="friend-item" @click="selectFriend(friend)">
                {{ friend }}
              </li>
            </ul>
    <div class="chat-content">
        <!-- messages de chat iront ici -->
    </div>
    <div class="chat-input-container">
        <input type="text" placeholder="Type your message..." @keyup.enter="sendMsg(friend)" />
    </div>
</div>

</template>

<script>
    import { useCookies } from "vue3-cookies"; // cookies
export default {
    data() {
        return {
            isPrivateChatOpen: true,
        };
    },
    setup() {
      const { cookies } = useCookies();
      const state = reactive({
        userId: cookies.get("userId"),
        token: cookies.get("authToken"),
        cookies,
        friendList : [],
        friendListId : [],
        selectedFriend: null, // Ajoutez cette ligne
        });
        return state;
    },
    methods: {
        selectFriend(friend) {
            this.selectedFriend = friend;
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
        async sendMsg(otheruser) {
        const baseUrl = `http://${window.location.hostname}`;
        const input = document.querySelector('input');
        const msg = input.value;
        const search = await this.getUser(otheruser);
        if(msg) {
            const response = await fetch(`${baseUrl}:2000/privateMessage/newMessageToUser/${this.userId}/${search[0].id}/${msg}`, {
                method : 'POST',
                headers : {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
          },
        });
        }
        },
        closeChat() {
        this.$emit('close');
      },
      startLoop() {  setInterval(console.log(this.selectedFriend), 1000);},
    },
    mounted() {
        this.getFriendList();
        this.startLoop();
 // Exécutez la boucle toutes les 5 secondes
    },
};
</script>


<style>
@import '~/assets/css/chat.css';
</style>