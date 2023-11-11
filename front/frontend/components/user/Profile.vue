<!-- Profile.vue -->
<template>
  <!--  Page de profil -->
  <div v-if="showprofile" class="custom-modal-background">
   <div class="custom-modal">
     <div class="custom-modal-header">
       <h5>Profil</h5>
       <span @click="refresh_page" class="custom-modal-close">&times;</span>
     </div>
     <div class="custom-modal-body">
       <p>Vous êtes connecté en tant que Player</p>
       <p>Parties : 0</p>
       <p>Victoires : 0</p>
       <p>Défaites : 0</p>
       <img src="~/assets/user-circle.png" class="profile-img" />
       <button @click="refresh_page" class="profile-btn">Retour</button>
       <!-- Temporaire : bouton de modification de profil -->
       <button @click="showProfilePage = false, showProfileModal = true" class="profile-btn">Modifier le profil</button>
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
         <div v-if ="showEmailChange" class="form-group">
           <label for="email"> Adresse e-mail :</label>
           <input type="email" class="form-control" id="email" name ="email" placeholder="Entrez votre adresse e-mail actuelle">
         </div>
          <div v-if ="showEmailChange" class="form-group">
         <label for="confirm-email">Confirmer adresse e-mail :</label>
           <input type="email" class="form-control" id="confirm-email" name ="confirm-email" placeholder="Entrez à nouveau votre nouvelle adresse e-mail">
         </div>

         <!-- Formulaire de changement de pseudo -->
         <div v-if ="showNicknameChange" class="form-group">
           <label for="nickname">Pseudo :</label>
           <input type="nickname" class="form-control" id="nickname" name ="nickname" placeholder="Entrez votre pseudo">
         </div>

         <!-- Formulaire de changement de mdp -->
         <div v-if ="showPasswordChange" class="form-group">
           <label for="password">Mot de passe :</label>
           <input type="password" class="form-control" id="password" name ="password" placeholder="Entrez votre mot de passe">
         </div>

         <div v-if ="showPasswordChange" class="form-group">
           <label for="confirm-password">Confirmez le mot de passe :</label>
           <input type="password" class="form-control" id="confirm-password" name ="confirm-password" placeholder="Entrez à nouveau votre mot de passe">
         </div>
         
         <div v-if ="showAvatarChange" class="form-group">
         <label for="avatar">Choose a profile picture:</label>
         <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" />
         </div>
         <div v-if = "showEditButtons" class="edit-buttons">
         <button @click="setActiveChange('email')" class="edit-btn">Modifier Email</button>
        <button @click="setActiveChange('password')" class="edit-btn">Modifier Mot de passe</button>
        <button @click="setActiveChange('nickname')" class="edit-btn">Modifier Pseudo</button>
        <button @click="setActiveChange('avatar')" class="edit-btn">Modifier Avatar</button>
         </div>  
       <div v-if="showSubmit" class="custom-modal-footer">
               <button type="submit" class="btn btn-primary">Soumettre les modifications</button></div>
       </form>
 <!-- Fin des formulaires de modif -->
 </div>
 </div>
</div>
</template>
<script>
import * as bcrypt from 'bcryptjs';
import { useCookies } from "vue3-cookies";

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
         currentUserEmail: '',
         currentName: '',
         currentSurname: '',
         currentNickname: '',
         currentPassword: '',
     };
 },
 props: ['showprofile'],
 setup() {
 const { cookies } = useCookies();
 return { cookies };
 },
 methods: {

  async submitProfile() {
  const token = this.cookies.get('authToken');
  const userId = +this.cookies.get('userId');
  const baseUrl = `http://${window.location.hostname}`;
  
  const formData = new FormData(document.querySelector('#profile'));

  try {
    if (this.showEmailChange) {
      const email = formData.get('email');
      const confirmEmail = formData.get('confirm-email');
      
      if (email !== confirmEmail) {
        alert('Les adresses e-mail ne correspondent pas.');
        return;
      }

      const emailUpdateResponse = await fetch(`${baseUrl}:2000/api/chuser`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({id: userId, email: email })
      });

      if (!emailUpdateResponse.ok) throw new Error('Erreur lors de la mise à jour de l’e-mail');
    }

    if (this.showPasswordChange) {
      const password = formData.get('password');
      const confirmPassword = formData.get('confirm-password');

      if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas.');
        return;
      }
      // Génération du mot de passe haché
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const passwordUpdateResponse = await fetch(`${baseUrl}:2000/api/chuser`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: userId, password: password})
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

 refresh_page() {
         window.location.reload();
 },
 setActiveChange(changeType) {
   // Réinitialiser tous les affichages
   this.showEmailChange = false;
   this.showPasswordChange = false;
   this.showNicknameChange = false;
   this.showSubmit = true;
   this.showEditButtons = false;

   // Activer l'affichage approprié
   if (changeType === 'email') {
     this.showEmailChange = true;
   } else if (changeType === 'password') {
     this.showPasswordChange = true;
   } else if (changeType === 'nickname') {
     this.showNicknameChange = true;
   }else if (changeType === 'avatar') {
     this.showAvatarChange = true;
   }
 },
 closeProfile() {
   this.showProfileModal = false;
   this.showEmailChange= false;
   this.showPasswordChange= false;
   this.showNicknameChange= false;
   this.showAvatarChange= false;
   this.showSubmit= false;
   this.showEditButtons= true;
 },
 
 },
};
</script>
<style> @import '~/assets/css/profile.css';</style>