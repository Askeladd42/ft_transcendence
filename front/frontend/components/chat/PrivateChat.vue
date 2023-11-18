<template>
  <div v-if="isPrivateChatOpen" id="chatContainer" class="chat-container-hidden">
    <div class="chat-header">Chat<span @click="closeChat" class="close-chat">&times;</span></div>
    <div class="chat-body"> <!-- Ajoutez cette ligne -->
      <ul class="channel-list-chat">
        <button class="pm-btn" @click="changeChat('private')">PM</button>
        <li v-for="channel in myChannels" :key="channel.id" class="pm-item">
          <button class="pm-btn" @click="getUsersOfChannel(channel.id)">{{ channel.name }}</button>
        </li>
      </ul>
      <ul v-if="usersOfChannel.length > 0 && showChannelsUsers && activeChannel" class="pm-chat">
        <li v-for="user in usersOfChannel" :key="user.userId" class="pm-item">
          <button class="pm-btn"
            :class="{ 'self-user': user.userId === Number(userId), 'admin-user': user.status === 'ADMIN', 'owner-user': user.status === 'OWNER', 'banned-user': user.status === 'BANNED' }"
            @click.stop="showUserContextMenu($event, user)">
            {{ user.name }}
          </button>
          <div v-if="selectedUser == user" class="context-menu"
            :style="{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }" @click.stop>
            <div v-if="user.userId != Number(userId) && user.status != 'BANNED'" @click.stop="addToPrivateChat(user)">
              Chat
            </div>
            <div v-if="user.userId != Number(userId) && user.status != 'BANNED'" @click.stop="showProfile(user.userId)">
              Profile
            </div>
            <div
              v-if="(userStatus === 'OWNER' || userStatus === 'ADMIN') && user.userId != Number(userId) && (user.status === 'MEMBER')"
              @click.stop="muteFromChannel(activeChannel, user.userId)">Mute</div>
            <div
              v-if="(userStatus === 'OWNER' || userStatus === 'ADMIN') && user.userId != Number(userId) && (user.status === 'MUTED')"
              @click.stop="unMuteFromChannel(activeChannel, user.userId)">Unmute</div>
            <div v-if="(userStatus === 'OWNER') && user.userId != Number(userId) && (user.status === 'MEMBER')"
              @click.stop="promoteFromChannel(activeChannel, user.userId)">Promote</div>
            <div v-if="(userStatus === 'OWNER') && user.userId != Number(userId) && (user.status === 'ADMIN')"
              @click.stop="demoteFromChannel(activeChannel, user.userId)">Demote</div>
            <div
              v-if="(userStatus === 'OWNER' || userStatus === 'ADMIN') && user.userId != Number(userId) && (user.status != 'OWNER' && user.status != 'ADMIN' && user.status != 'BANNED')"
              @click.stop="kickFromChannel(activeChannel, user.userId)">Kick</div>
            <div
              v-if="(userStatus === 'OWNER' || userStatus === 'ADMIN') && user.userId != Number(userId) && (user.status != 'OWNER' && user.status != 'ADMIN' && user.status != 'BANNED')"
              @click.stop="banFromChannel(activeChannel, user.userId)">Bannir</div>
            <div
              v-if="(userStatus === 'OWNER' || userStatus === 'ADMIN') && user.userId != Number(userId) && (user.status != 'OWNER' && user.status != 'ADMIN' && user.status === 'BANNED')"
              @click.stop="unBanFromChannel(activeChannel, user.userId)">Débannir</div>
            <div v-if="(userStatus === 'OWNER') && user.userId != Number(userId) && (user.status === 'ADMIN')"
              @click.stop="giveOwnershipChannelToUser(activeChannel, user.userId)">Donner la propriété du channel</div>
            <div v-if="user.userId === Number(userId) && userStatus !== 'OWNER'" @click.stop="leaveChannel">Quitter</div>
            <div v-if="user.userId === Number(userId) && userStatus === 'OWNER'" @click.stop="deleteChannel">Supprimer le
              serveur</div>

          </div>
        </li>
      </ul>
      <ul v-if="showPrivateMessages && !showChannelsUsers" class="pm-chat">
        <li v-for="privateMessage in privateMessageList" :key="privateMessage" class="pm-item">
          <button class="pm-btn" @click="getMsgs(privateMessage)">{{ privateMessage }}</button>
        </li>
      </ul>
      <div v-if="showPrivateMessages && !showChannelsUsers" class="chat-content">
        <div v-for="message in privateMessages" :key="message" class="chat-message">
          <span class="message-date">{{ formatMessageDate(message.date) }}</span> :
          <br>
          <span
            :class="{ 'my-message': message.userId1 === Number(userId), 'other-message': message.userId1 !== Number(userId) }">
            <template v-if="editingMessage !== message.date">
              <span @click.stop="showContextMenu($event, message)">{{ message.content }}</span>
              <div v-if="selectedMessage === message.content" class="context-menu"
                :style="{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }" @click.stop>
                <div @click.stop="startEditing(message.date, message.content)">Modifier</div>
                <div @click.stop="deleteMsg(activeUser, message.date)">Supprimer</div>
              </div>
            </template>
            <template v-else>
              <input type="text" v-model="editingContent"
                @keyup.enter="updateMsg(activeUser, message.date, editingContent)">
              <button @click="finishEditing()"> ✓</button>
            </template>
          </span>
        </div>
      </div>

      <!-- channels -->
      <div v-else-if="!showPrivateMessages && showChannelsUsers && activeChannel" class="channel-content">
        <div v-for="message in allMessageFromChannel" :key="message" class="chat-message">
          <span class="message-date">{{ formatMessageDate(message.date) }}</span> :
          <br>
          <span
            :class="{ 'my-message': message.userId === Number(userId), 'other-message': message.userId !== Number(userId) }">
            <template v-if="editingMessage !== message.date">
              <span @click.stop="showContextMenu($event, message)">{{ message.content }}</span>
              <div v-if="selectedMessage === message.content" class="context-menu"
                :style="{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }" @click.stop>
                <div v-if="selectedMessage === message.content" @click.stop="startEditing(message.date, message.content)">
                  Modifier</div>
                <div
                  v-if="selectedMessage === message.content && !(userStatus === 'ADMIN' && messageOwnerStatus === 'OWNER')"
                  @click.stop="deleteMsgToChannel(message.channelId, message.userId, message.date)">Supprimer</div>
              </div>
            </template>
            <template v-else>
              <input type="text" v-model="editingContent"
                @keyup.enter="updateMsgToChannel(activeChannel, message.date, editingContent)">
              <button @click="finishEditing()"> ✓</button>
            </template>
          </span>
        </div>
      </div>
    </div>
    <div class="chat-input-container">
      <input id="messageContent" type="text" placeholder="Type your message..." v-model="messageContent"
        @keyup.enter="showPrivateMessages && !showChannelsUsers ? sendMsg(activeUser) : sendMsgToChannel(activeChannel)"
        :disabled="!activeUser && !activeChannel" />
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
      messageContent: '',
      showPrivateMessages: false,
      showChannelsUsers: false,
      selectedMessage: null,
      menuPosition: { x: 0, y: 0 },
      editingContent: '',
    };
  },
  setup() {
    const { cookies } = useCookies();
    const state = reactive({
      userId: cookies.get("userId"),
      token: cookies.get("authToken"),
      cookies,
      privateMessages: [],
      oldPrivateMessageList: [],
      privateMessageList: [],
      privateMessageListId: [],
      activeUser: null,
      activeChannel: null,
      selectedFriend: null,
      myChannels: [],
      usersOfChannel: [],  // liste des utilisateurs du channel
      allMessageFromChannel: [],
      userStatus: null,
      messageOwnerStatus: null,
      pmFromChannel: null,
    });
    return state;
  },
  props: {
    friendFromRelation: String,
    channel: String
  },
  methods: {
    async showProfile(friend) {
      this.$emit('showProfile', friend);
    },
    async changeChat(chat) {
      if (chat == "channel") {
        this.showChannelsUsers = true
        this.showPrivateMessages = false;
      }
      if (chat == "private") {
        this.showPrivateMessages = true;
        this.showChannelsUsers = false;
      }
    },
    addToPrivateChat(user) {
      if (!this.privateMessageList.includes(user.name)) {
        this.privateMessageList.push(user.name);
        this.privateMessageListId.push(user.userId);
        this.changeChat('private');
        this.pmFromChannel = user.name;
      }
      else {
        this.changeChat('private');
        this.pmFromChannel = user.name;
      }
    },
    showContextMenu(event, message) {
      if (message.userId1 === Number(this.userId) || message.userId === Number(this.userId) || this.userStatus === 'OWNER' || this.userStatus === 'ADMIN') {
        event.stopPropagation();
        this.selectedMessage = message.content;
        this.menuPosition.x = event.clientX;
        this.menuPosition.y = event.clientY;
      }
      if (this.usersOfChannel)
        this.messageOwnerStatus = this.usersOfChannel.find(user => user.userId === message.userId).status;
    },
    showUserContextMenu(event, user) {
      this.selectedUser = user;
      this.menuPosition.x = event.clientX;
      this.menuPosition.y = event.clientY;
    },
    closeDropdown() {
      this.selectedMessage = null;
      this.selectedUser = null;
    },
    formatMessageDate(date) {
      const now = Date.now();
      const messageDate = new Date(date).getTime();

      if (Number.isFinite(messageDate)) {
        const diffInSeconds = Math.floor((now - messageDate) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
          return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(-diffInDays, 'day');
        } else if (diffInHours > 0) {
          return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(-diffInHours, 'hour');
        } else if (diffInMinutes > 0) {
          return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(-diffInMinutes, 'minute');
        } else {
          return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(-diffInSeconds, 'second');
        }
      } else {
        console.error('Invalid date:', date);
        return date;
      }
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

    async getUserById(id) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/api/user/id/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
      const data = await response.json();
      // console.log(`User for ID ${id}:`, data); // Ajoutez cette ligne
      return data.nickname;
    },
    async sendMsg(otherUser) {
      const baseUrl = `http://${window.location.hostname}`;
      const input = document.querySelector('input');
      const msg = input.value;
      if (msg) {
        const response = await fetch(`${baseUrl}:2000/privateMessage/newMessageToUser/${this.userId}/${otherUser}/${msg}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
        });
        // console.log(response.json());
        this.messageContent = ''; // Effacez le contenu du message après l'envoi
      }
    },
    closeChat() {
      this.$emit('close');
    },
    async getPMList() {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/privateMessage/getAllUserWithPrivateMessage/${this.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const newPrivateMessageListId = await response.json();
      const newPrivateMessageList = [];

      if (this.friendFromRelation) {
        const search = await this.getUser(this.friendFromRelation);

        if (search && search.length > 0 && !newPrivateMessageListId.includes(search[0].id)) {
          newPrivateMessageListId.push(search[0].id);
        }
      }
      if (this.pmFromChannel) {
        const search = await this.getUser(this.pmFromChannel);

        if (search && search.length > 0 && !newPrivateMessageListId.includes(search[0].id)) {
          newPrivateMessageListId.push(search[0].id);
        }
      }

      for (let i = 0; i < newPrivateMessageListId.length; i++) {
        var temp = await this.getUserById(newPrivateMessageListId[i]);
        if (!newPrivateMessageList.includes(temp))
          newPrivateMessageList.push(temp);
      }

      this.privateMessageList = newPrivateMessageList;
      this.privateMessageListId = newPrivateMessageListId;
    },

    async getMsgs(otherUser) {
      if (!otherUser) {
        // console.log('Aucun utilisateur actif sélectionné');
        return;
      }
      const baseUrl = `http://${window.location.hostname}`;
      var idtofind = null;
      for (let i = 0; i < this.privateMessageList.length; i++)
        if (this.privateMessageList[i] == otherUser)
          idtofind = this.privateMessageListId[i];
      if (idtofind)
        this.activeUser = idtofind;
      const response = await fetch(`${baseUrl}:2000/privateMessage/getAllMessageFromUser/${this.userId}/${this.activeUser}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
      this.privateMessages = await response.json();
      // display the msgs in the chat container
    },

    async updateMsg(otherUser, dateMsg, content) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/privateMessage/updateMessageToUser/${this.userId}/${otherUser}/${dateMsg}/${content}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },
    startEditing(date, content) {
      this.editingMessage = date;
      this.editingContent = content; // Initialisez avec le contenu actuel
    },
    finishEditing() {
      this.editingMessage = null;
    },
    async deleteMsg(otherUser, dateMsg) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/privateMessage/deleteMessageToUser/${this.userId}/${otherUser}/${dateMsg}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },
    async refreshChats() {
      try {
        await this.getMsgs(this.activeUser);
        await this.getPMList();
        await this.getMyChannel();
        if (this.activeChannel && !this.showPrivateMessages) {
          await this.getAllMessageFromChannel(this.activeChannel);
          await this.getUsersOfChannel(this.activeChannel);
        }
      } catch (error) {
        // console.error('Erreur lors de la mise à jour des chats :', error);
      }
    },
    startLoopChat() {
      this.refreshChats(); // Appel initial
      setInterval(this.refreshChats, 100); // Exécutez la boucle toutes les 5 secondes
    },

    ///////////////////////// CHANNEL /////////////////////////////
    //getters
    async getAllMessageFromChannel(channelId) {
      if (!channelId) {
        // console.log('Aucun utilisateur actif sélectionné');
        this.activeChannel = null;
        return;
      }
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/getAllMessageFromChannel/${channelId}/${this.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
      // const newMessages = await response.json();
      // for (let newMessage of newMessages) {
      //   if (!this.allMessageFromChannel.some(message => message.date === newMessage.date)) {
      //     this.allMessageFromChannel.push(newMessage);
      //   }
      // }
      this.allMessageFromChannel = await response.json();
      this.activeChannel = channelId;
      this.changeChat('channel');
      //return this.allMessageFromChannel;
    },
    async getMyChannel() {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/myChannel/${this.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
      const newMyChannelListId = await response.json();
      const newMyChannelList = [];
      for (let i = 0; i < newMyChannelListId.length; i++) {
        var temp = newMyChannelListId[i];
        if (!newMyChannelList.some(channel => channel.name === temp.name))
          newMyChannelList.push(temp);
      }
      // Vérifiez si activeChannel est toujours dans la liste des canaux
      if (this.activeChannel && !this.myChannels.some(channel => channel.id === this.activeChannel)) {
        this.activeChannel = null;
      }
      this.myChannels = newMyChannelList;
      console.log(newMyChannelListId);
    },
    async getUsersOfChannel(channelId) {

      const baseUrl = `http://${window.location.hostname}`;
      this.activeChannel = channelId;
      const response = await fetch(`${baseUrl}:2000/channel/getUsersOfChannel/${channelId}/${this.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
      const users = await response.json();
      const userIds = users.map(user => user.userId);

      // Supprimer les utilisateurs qui ne sont plus dans la liste
      this.usersOfChannel = this.usersOfChannel.filter(user => userIds.includes(user.userId));

      for (let user of users) {
        const userName = await this.getUserById(user.userId);
        const existingUser = this.usersOfChannel.find(u => u.userId === user.userId);
        if (existingUser) {
          existingUser.name = userName;
          existingUser.status = user.status;
        } else {
          this.usersOfChannel.push({ userId: user.userId, name: userName, status: user.status });
        }
      }
      for (let user of users) {
        if (user.userId === Number(this.userId)) {
          this.userStatus = user.status;
          break;
        }
      }
      // Trier les utilisateurs par statut
      const statusOrder = ['OWNER', 'ADMIN', 'MEMBER', 'BANNED'];
      this.usersOfChannel.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
      this.changeChat('channel');
    },
    async sendMsgToChannel(activeChannel) {
      const baseUrl = `http://${window.location.hostname}`;
      const input = document.querySelector('input');
      const msg = input.value;
      if (msg) {
        const response = await fetch(`${baseUrl}:2000/channel/newMessageToChannel/${activeChannel}/${this.userId}/${msg}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
        });
        // console.log(response.json());
        this.messageContent = ''; // Effacez le contenu du message après l'envoi
      }
    },
    async updateMsgToChannel(activeChannel, dateMsg, content) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/privateMessage/updateMessageToChannel/${activeChannel}/${this.userId}/${dateMsg}/${content}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },
    async deleteMsgToChannel(activeChannel, idmsg, dateMsg) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/deleteMessageFromChannel/${activeChannel}/${this.userId}/${idmsg}/${dateMsg}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },
    //////////////////// kick/mute/unmute functions /////////////////////////////
    async kickFromChannel(channelId, userIdToKick) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/KickFromChannel/${channelId}/${this.userId}/${userIdToKick}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },
    async muteFromChannel(channelId, userIdToMute) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/muteFromChannel/${channelId}/${this.userId}/${userIdToMute}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },
    async unMuteFromChannel(channelId, userIdToUnMute) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/unmuteFromChannel/${channelId}/${this.userId}/${userIdToUnMute}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },
    //////////////////// demote/promote functions /////////////////////////////
    async demoteFromChannel(channelId, userIdToDemote) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/demoteFromChannel/${channelId}/${this.userId}/${userIdToDemote}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },
    async promoteFromChannel(channelId, userIdToPromote) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/promoteFromChannel/${channelId}/${this.userId}/${userIdToPromote}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },

    //////////////////// Ban/unban functions /////////////////////////////

    async banFromChannel(channelId, userIdToBan) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/banFromChannel/${channelId}/${this.userId}/${userIdToBan}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },

    async unBanFromChannel(channelId, userIdToUnBan) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/unBanFromChannel/${channelId}/${this.userId}/${userIdToUnBan}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },

    async leaveChannel() {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/leaveChannel/${this.activeChannel}/${this.userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
      this.activeChannel = null;
      this.showChannelsUsers = false
    },
    async deleteChannel() {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/deleteChannel/${this.activeChannel}/${this.userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
      this.activeChannel = null;
      this.showChannelsUsers = false
    },
    async giveOwnershipChannelToUser(channelId, userIdToPromote) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/giveOwnershipChannelTo/${channelId}/${this.userId}/${userIdToPromote}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },
  },
  mounted() {
    this.startLoopChat();   // Exécutez la boucle toutes les 1 seconde
    document.addEventListener('click', this.closeDropdown);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeDropdown);
  },
};
</script>


<style>
@import '~/assets/css/chat.css';
</style>