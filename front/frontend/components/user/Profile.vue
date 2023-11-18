<!-- Profile.vue -->
<template>
  <!--  Page de profil -->
  <div v-if="isProfileOpen" class="custom-modal-background">
    <div class="custom-modal">
      <div class="custom-modal-header">
        <h5>Profil</h5>
        <span @click="closeProfilePage" class="custom-modal-close">&times;</span>
      </div>
      <div class="custom-modal-body">
        <p class="user-nickname">{{ this.currentNickname }}</p>
        <p>Parties : 0</p>
        <p>Victoires : 0</p>
        <p>Défaites : 0</p>
        <img src="~/assets/user-circle.png" class="profile-img" />
        <button @click="closeProfilePage" class="profile-btn">Retour</button>
        <!-- Temporaire : bouton de modification de profil -->
        <button v-if="currentUser == userId" @click="closeProfilePage, showProfileModal = true"
          class="profile-btn">Modifier le profil</button>
      </div>
    </div>
  </div>
  <!-- Afficher le formulaire de modification de compte -->
  <div v-if="showProfileModal" class="custom-modal-background">
    <div class="custom-modal">
      <div class="custom-modal-header">
        <h5>Modifier les informations du profil</h5>
        <span @click="closeProfile" class="custom-modal-close">&times;</span>
      </div>
      <div class="custom-modal-body">
        <!-- Contenu des formulaires de modification -->
        <form @submit.prevent="submitProfile" id="profile">
          <div v-if="showEmailChange" class="form-group">
            <label for="email">Adresse e-mail :</label>
            <input type="email" class="form-control" id="email" name="email"
              placeholder="Entrez votre adresse e-mail actuelle" v-model="currentUserEmail">
          </div>
          <div v-if="showEmailChange" class="form-group">
            <label for="confirm-email">Confirmer adresse e-mail :</label>
            <input type="email" class="form-control" id="confirm-email" name="confirm-email"
              placeholder="Entrez à nouveau votre nouvelle adresse e-mail" v-model="currentUserEmail">
          </div>

          <!-- Formulaire de changement de pseudo -->
          <div v-if="showNicknameChange" class="form-group">
            <label for="nickname">Pseudo :</label>
            <input type="nickname" class="form-control" id="nickname" name="nickname" placeholder="Entrez votre pseudo"
              v-model="currentNickname">
          </div>

          <!-- Formulaire de changement de mdp -->
          <div v-if="showPasswordChange" class="form-group">
            <label for="password">Mot de passe :</label>
            <input type="password" class="form-control" id="password" name="password"
              placeholder="Entrez votre mot de passe">
          </div>

          <div v-if="showPasswordChange" class="form-group">
            <label for="confirm-password">Confirmez le mot de passe :</label>
            <input type="password" class="form-control" id="confirm-password" name="confirm-password"
              placeholder="Entrez à nouveau votre mot de passe">
          </div>

          <div v-if="showAvatarChange" class="form-group">
            <label for="avatar">Choose a profile picture:</label>
            <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" />
          </div>
          <div v-if="showEditButtons" class="edit-buttons">
            <button @click="setActiveChange('email')" class="edit-btn">Modifier Email</button>
            <button @click="setActiveChange('password')" class="edit-btn">Modifier Mot de passe</button>
            <button @click="setActiveChange('nickname')" class="edit-btn">Modifier Pseudo</button>
            <button @click="setActiveChange('avatar')" class="edit-btn">Modifier Avatar</button>
          </div>
          <div v-if="formErrors.length > 0">
            <ul>
              <li class="errors" v-for="error in formErrors" :key="error">{{ error }}</li>
            </ul>
          </div>
          <div v-if="showSubmit" class="custom-modal-footer">
            <button type="submit" class="btn btn-primary">Soumettre les modifications</button>
          </div>
        </form>
        <!-- Fin des formulaires de modif -->
      </div>
    </div>
  </div>
</template>
<script>
import * as bcrypt from 'bcryptjs';
import { useCookies } from "vue3-cookies";
import { validateEmail, validatePassword, validateNickname } from '../../script/validator';

export default {
  name: "Profile",
  data() {
    return {
      showEmailChange: false,
      showPasswordChange: false,
      showNicknameChange: false,
      showProfilePage: false,
      showProfileModal: false,
      showAvatarChange: false,
      showSubmit: false,
      showEditButtons: true,
      isProfileOpen: true,
      formErrors: [],
    };
  },
  setup() {
    const { cookies } = useCookies();
    const state = reactive({
      userId: cookies.get("userId"),
      token: cookies.get("authToken"),
      cookies,
      currentUserEmail: '',
      currentNickname: '',
      currentPassword: '',
      currentUser: null,
    });
    return state;
  },
  emits: ['closeProfile' , 'clearOtherUserId'],
  props: ['otherUserId'],
  mounted() {
    if (this.otherUserId) {
      this.getUserById(this.otherUserId);
    } else {
      this.getUserById(this.userId);
    }
  },
  methods: {
    closeProfilePage() {
      this.$emit('closeProfile');
      if (this.otherUserId)
        this.$emit('clearOtherUserId');
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
      //  console.log(`User for ID ${id}:`, data);
      this.currentUserEmail = data.email;
      this.currentNickname = data.nickname;
      this.currentPassword = data.password;
      this.currentUser = data.id;
      return data;
    },
    validateForm() {
      this.formErrors = []; // réinitialiser les erreurs

      const formData = new FormData(document.querySelector('#profile'));
      const email = formData.get('email');
      const password = formData.get('password');
      const nickname = formData.get('nickname');
      const confirmEmail = formData.get('confirm-email');
      const confirmPassword = formData.get('confirm-password');

      if (!validateEmail(email) && this.showEmailChange) {
        this.formErrors.push('L\'adresse e-mail n\'est pas valide.');
      } else if (email !== confirmEmail) {
        this.formErrors.push('Les adresses e-mail ne correspondent pas.');
      }
      else if (this.showEmailChange && email === this.currentUserEmail) {
        this.formErrors.push('L\'adresse e-mail n\'a pas été modifiée.');
      }

      if (!validatePassword(password) && this.showPasswordChange) {
        this.formErrors.push('Le mot de passe ne respecte pas les critères de sécurité requis.');
      } else if (password !== confirmPassword) {
        this.formErrors.push('Les mots de passe ne correspondent pas.');
      }
      else if (this.showPasswordChange && password === this.currentPassword) {
        this.formErrors.push('Le mot de passe n\'a pas été modifié.');
      }

      if (!validateNickname(nickname) && this.showNicknameChange) {
        this.formErrors.push('Le pseudo n\'est pas valide ou est déjà pris.');
      }
      else if (this.showNicknameChange && nickname.length > 12) {
        this.formErrors.push('Le pseudo ne doit pas dépasser 12 caractères.');
      }
      return this.formErrors.length === 0; // retourne vrai si aucune erreur
    },

    async submitProfile() {
      const token = this.cookies.get('authToken');
      const userId = +this.cookies.get('userId');
      const baseUrl = `http://${window.location.hostname}`;

      const formData = new FormData(document.querySelector('#profile'));
      if (!this.validateForm()) {
        // Si le formulaire n'est pas valide, on ne procède pas à l'envoi
        return;
      }

      try {
        if (this.showEmailChange) {
          const email = formData.get('email');
          const emailUpdateResponse = await fetch(`${baseUrl}:2000/api/chuser`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id: userId, email: email })
          });

          if (!emailUpdateResponse.ok) throw new Error('Erreur lors de la mise à jour de l’e-mail');
        }

        if (this.showPasswordChange) {
          const password = formData.get('password');

          // Génération du mot de passe haché
          const saltRounds = 10;
          const salt = bcrypt.genSaltSync(saltRounds);
          const hashedPassword = bcrypt.hashSync(password, salt);
          const passwordObject = {
            create: {
              salted_password: hashedPassword,
              salt: salt,
            },
          };
          // console.log(password);
          // console.log(passwordObject);
          const passwordUpdateResponse = await fetch(`${baseUrl}:2000/api/chuser`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id: userId, password: passwordObject })
          });

          if (!passwordUpdateResponse.ok) throw new Error('Erreur lors de la mise à jour du mot de passe');
        }

        if (this.showNicknameChange) {
          const nickname = formData.get('nickname');
          const nicknameUpdateResponse = await fetch(`${baseUrl}:2000/api/chuser`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id: userId, nickname: nickname }) // Update the payload to match CreateUserDTO expected on the server
          });

          if (!nicknameUpdateResponse.ok) {
            const errorData = await nicknameUpdateResponse.json();
            throw new Error(errorData.message || 'Erreur lors de la mise à jour du nom d’utilisateur');
          }
        }
        // champ pour mettre à jour sa photo d'avatar
        // if (this.showAvatarChange) {
        // const avatar = formData.get('avatar');

        // const avatarUpdateResponse = await fetch('http://localhost:2000/api/chavatar', {
        // method: 'PUT',
        // headers: {
        // 'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`,
        // },
        // body: JSON.stringify({ email: this.currentUserEmail, avatar: avatar })
        // });

        // if (!avatarUpdateResponse.ok) throw new Error('Erreur lors de la mise à jour de la photo d\'avatar');
        // }

        alert('Profil mis à jour avec succès');
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    },
    setActiveChange(changeType) {
      // Réinitialiser tous les affichages
      this.showEmailChange = false;
      this.showPasswordChange = false;
      this.showNicknameChange = false;
      this.showSubmit = true;
      this.showEditButtons = false;
      this.formErrors = [];
      // Activer l'affichage approprié
      if (changeType === 'email') {
        this.showEmailChange = true;
      } else if (changeType === 'password') {
        this.showPasswordChange = true;
      } else if (changeType === 'nickname') {
        this.showNicknameChange = true;
      } else if (changeType === 'avatar') {
        this.showAvatarChange = true;
      }
    },
    closeProfile() {
      this.showProfileModal = false;
      this.showEmailChange = false;
      this.showPasswordChange = false;
      this.showNicknameChange = false;
      this.showAvatarChange = false;
      this.showSubmit = false;
      this.showEditButtons = true;
      this.formErrors = [];
    },
  },

};
</script>
<style> @import '~/assets/css/profile.css';
</style>