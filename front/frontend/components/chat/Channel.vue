<template>
  <div v-if="showChannels" class="channel-list">
    <span class="close-btn" @click="closeChannelList">&times;</span>
    <h2>Liste des Channels</h2>
    <ul>
      <li v-for="channel in channelList" :key="channel.id" class="channel-item">
        <button class="channel-btn" @click="joinChannel(channel)">{{ channel.name }}</button>
      </li>
    </ul>
    <button v-if="!showCreateChannelForm" @click="showCreateChannelForm = true" class="create-channel-btn">Créer un
      Channel</button>
    <div v-if="showCreateChannelForm" class="create-channel-form">
      <h2>Créer un nouveau Channel</h2>
      <label>
        Nom du Channel :
        <input v-model="newChannelName" type="name">
      </label>
      <br>
      <label>
        Mot de passe du Channel :
        <input v-model="newChannelPassword" type="password">
      </label>
      <br>
      <label>
        Privé :
        <input v-model="newChannelPrivacy" type="checkbox">
      </label>
      <br>
      <br>
      <button class="confirm-create"
        @click="createChannel(newChannelName, newChannelPrivacy, newChannelPassword)">Créer</button>
      <br>
      <button class="cancel-btn" @click="showCreateChannelForm = false">Annuler</button>
    </div>
  </div>
</template>
  
<script>
import { useCookies } from "vue3-cookies"; // cookies

export default {
  name: 'Channel',
  data() {
    return {
      showChannels: true,
      activeChannelId: null,
      isChannelRoomVisible: false,
      editingMessage: null,
      messageContent: '',
      showCreateChannelForm: false,
      newChannelName: '',
      newChannelPassword: '',
      newChannelPrivacy: false,
    };
  },
  setup() {
    const { cookies } = useCookies();
    const state = reactive({
      userId: cookies.get("userId"),
      token: cookies.get("authToken"),
      cookies,
      channelList: [],
      channelListId: [],
      myChannels: [],
      usersOfChannel: [],
      activeChannel: null,
    });
    return state;
  },
  mounted() {
    this.startLoopChannelList();
  },
  methods: {
    ///////////////////////// refresh functions /////////////////////////////
    async refreshChannels() {
      try {
        await this.getMyChannel();
        await this.getChannelList();
      } catch (error) {
        console.error('Erreur lors de la mise à jour des chats :', error);
      }
    },
    async startLoopChannelList() {
      this.refreshChannels
      setInterval(this.refreshChannels, 1000); // Exécutez la boucle toutes les 5 secondes
    },

    closeChannelList() {
      this.showChannels = false;
      this.$emit('close-channel-list');
    },
    ///////////////////////// Create functions /////////////////////////////

    async createChannel(channelName, channelPrivacy, channelPass) {
      const baseUrl = `http://${window.location.hostname}`;
      let response;
      if (channelPass != null && channelPass != '') {
        response = await fetch(`${baseUrl}:2000/channel/createChannel/${this.userId}/${channelName}/${channelPrivacy}/${channelPass}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          }
        });
      }
      else {
        response = await fetch(`${baseUrl}:2000/channel/createChannel/${this.userId}/${channelName}/${channelPrivacy}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          }
        });
      }
      //console.log(response.json());
    },

    ///////////////////////// Update functions ///////////////////////////// 
    async updateChannelName(channelId, newName) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/updateChannelName/${channelId}/${this.userId}/${newName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        }
      });
    },
    async updateChannelImage(channelId, newPathImage) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/updateChannelImage/${channelId}/${this.userId}/${newPathImage}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        }
      });
    },
    async updateChannelPrivacy(channelId, newPrivacy) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/updateChannelPrivacy/${channelId}/${this.userId}/${newPrivacy}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        }
      });
    },
    async updateChannelPassword(channelId, newPassword) {
      const baseUrl = `http://${window.location.hostname}`;
      if (newPassword != null) {
        const response = await fetch(`${baseUrl}:2000/channel/updateChannelPassword/${channelId}/${this.userId}/${newPassword}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          }
        });
      }
      else {
        const response = await fetch(`${baseUrl}:2000/channel/updateChannelPassword/${channelId}/${this.userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          }
        });
      }
    },

    async updateMessageFromChannel(channelId, dateMsg, content) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000//channel/updateMessageToChannel/${channelId}/${this.userId}/${dateMsg}/${content}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        }
      });
    },
    startEditing(date) {
      this.editingMessage = date;
    },
    finishEditing() {
      this.editingMessage = null;
    },

    ///////////////////////// Getter functions /////////////////////////////
    async getChannelList() {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/PublicChannels`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
      const newchannelListId = await response.json();
      const newchannelList = [];
      for (let i = 0; i < newchannelListId.length; i++) {
        var temp = newchannelListId[i];
        if (!newchannelList.some(channel => channel.name === temp.name))
          newchannelList.push(temp);
      }
      this.channelList = newchannelList;
      //console.log(this.channelList);
      //return this.channelList;
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
      this.myChannels = newMyChannelList;
    },

    ///////////////////////// Join functions /////////////////////////////
    async joinChannel(channelId) {
      const baseUrl = `http://${window.location.hostname}`;
      const password = "";
      this.$emit('channel-joined', channelId);
      if (this.myChannels.some(channel => channel.id === channelId.id)) {
        this.activeChannelId = channelId.id;
        this.isChannelRoomVisible = true;
        this.showChannels = false;
        // console.log("Channel déjà rejoint");
        // console.log(this.isChannelRoomVisible);
        return;
      }
      // let response;
      const response = await fetch(`${baseUrl}:2000/channel/joinChannel/${channelId.id}/${this.userId}/${password}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
      // else {
      //   response = await fetch(`${baseUrl}:2000/channel/joinChannel/${channelId.id}/${this.userId}`, {
      //     method : 'POST',
      //     headers : {
      //       'Content-Type': 'application/json',
      //       'Authorization': `Bearer ${this.token}`,
      //     },
      //   }); 
      // }  
      // console.log("password :",  password, "L'id du channel :",channelId.id,"L'id du user", this.userId);
      const data = await response.json();
      // console.log(data);
      if (data == true) {
        this.activeChannelId = channelId.id;
        this.showChannels = false;
        this.isChannelRoomVisible = true;
      }
    },

    //////////////////////// Invite function /////////////////////////////

    async inviteUserToChannel(channelId, userIdInvited) {
      const baseUrl = `http://${window.location.hostname}`;
      const response = await fetch(`${baseUrl}:2000/channel/inviteChannel/${channelId}/${this.userId}/${userIdInvited}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });
    },
  },
};
</script>
  
<style>
@import '~/assets/css/channel.css';
</style>
  