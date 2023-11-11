<template>
<div v-if="isPrivateChatOpen" id="chatContainer" class="chat-container-hidden">
    <div class="chat-header">Chat<span @click="closeChat" class="close-chat">&times;</span></div>
    <div class="chat-body"> <!-- Ajoutez cette ligne -->
      <ul class="pm-chat">
                <li v-for="privateMessage in privateMessageList" :key="privateMessage" class="pm-item">
                  <button class ="pm-btn" @click="getMsgs(privateMessage)">{{ privateMessage }}</button>
                </li>
              </ul>
              <div class="chat-content">
      <div v-for="message in privateMessages" :key="message" class="chat-message">
        <span class="message-date">{{ message.date }}</span>  : 
        <br>
        <span :class="{ 'my-message': message.userId1 === Number(userId), 'other-message': message.userId1 !== Number(userId) }">
        <template v-if="editingMessage !== message.date">
        {{ message.content }}
        <img src="~/assets/icons/edit-msg.svg" class="icon edit-icon" @click="startEditing(message.date)">
        <img src="~/assets/icons/cross.svg" class="icon delete-icon" @click="deleteMsg(activeUser,message.date)">
          </template>
        <template v-else>
        <input type="text" v-model="message.content" @keyup.enter="updateMsg(activeUser,message.date,message.content)">
        <img src="~/assets/icons/check.svg" class="icon check-icon" @click="finishEditing()">
    </template>
      </span>
      </div>
      </div>
    </div> <!-- Ajoutez cette ligne -->
    <div class="chat-input-container">
          <input type="text" placeholder="Type your message..." @keyup.enter="sendMsg(activeUser)" />
      </div>
</div>

</template>

<script>
    import { useCookies } from "vue3-cookies"; // cookies
export default {
    data() {
        return {
            isPrivateChatOpen: true,
            editingMessage: null,
        };
    },
    setup() {
      const { cookies } = useCookies();
      const state = reactive({
        userId: cookies.get("userId"),
        token: cookies.get("authToken"),
        cookies,
        privateMessages: [],
        oldPrivateMessageList : [],
        privateMessageList : [],
        privateMessageListId : [],
        activeUser : null,
        selectedFriend: null, // Ajoutez cette ligne
        });
        return state;
    },
    props: {
    friendFromRelation: String
    },
    methods: {
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
        async sendMsg(otherUser) {
        const baseUrl = `http://${window.location.hostname}`;
        const input = document.querySelector('input');
        const msg = input.value;
          if(msg) {
            const response = await fetch(`${baseUrl}:2000/privateMessage/newMessageToUser/${this.userId}/${otherUser}/${msg}`, {
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
      async getPMList() {
        const baseUrl = `http://${window.location.hostname}`;
        const response = await fetch(`${baseUrl}:2000/privateMessage/getAllUserWithPrivateMessage/${this.userId}`, {
          method : 'GET',
          headers : {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
        });
          this.privateMessageList = [];
          
          this.privateMessageListId = await response.json();
          for (let i = 0; i < this.privateMessageListId.length; i++)
          {
            var temp = await this.getUserById(this.privateMessageListId[i]);
            if (temp != this.privateMessageList[i])
              this.privateMessageList.push(temp);
          }
        // display the msgs in the chat container
      },

      async getMsgs(otherUser) {
        // this.privateMessages = []; // Ajoutez cette ligne
        const baseUrl = `http://${window.location.hostname}`;
        var idtofind = null;
          for (let i = 0; i < this.privateMessageList.length; i++)  
          if (this.privateMessageList[i] == otherUser)
            idtofind = this.privateMessageListId[i];
        const response = await fetch(`${baseUrl}:2000/privateMessage/getAllMessageFromUser/${this.userId}/${idtofind}`, {
          method : 'GET',
          headers : {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
        });
        this.privateMessages = await response.json();
        this.activeUser = idtofind;
        // display the msgs in the chat container
      },

      async updateMsg(otherUser, dateMsg, content) {
        const baseUrl = `http://${window.location.hostname}`;
        const response = await fetch(`${baseUrl}:2000/privateMessage/updateMessageToUser/${this.userId}/${otherUser}/${dateMsg}/${content}`, {
          method : 'PUT',
          headers : {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
        });
      },
      startEditing(date) {
        this.editingMessage = date;
      },
      finishEditing() {
          this.editingMessage = null;
      },
      async deleteMsg(otherUser, dateMsg) {
        const baseUrl = `http://${window.location.hostname}`;
        const response = await fetch(`${baseUrl}:2000/privateMessage/deleteMessageToUser/${this.userId}/${otherUser}/${dateMsg}`, {
          method : 'DELETE',
          headers : {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
        });
      },
      async refreshChats() {
      try {
        await this.getPMList();
      } catch (error) {
        console.error('Erreur lors de la mise à jour des chats :', error);
      }
    },
    startLoopChat() {
        this.refreshChats(); // Appel initial
        setInterval(this.refreshChats, 7500); // Exécutez la boucle toutes les 5 secondes
      },
    },
    mounted() {
      this.startLoopChat();  
      if (this.friendFromRelation && !this.privateMessageList.includes(this.friendFromRelation)) {
        this.privateMessageList.push(this.friendFromRelation);
        
    }
 // Exécutez la boucle toutes les 5 secondes
    },
};
</script>


<style>
@import '~/assets/css/chat.css';
</style>