<!-- Register.vue -->
<template>
 <!-- Afficher le formulaire d'inscription -->
 <div v-if="isRegisterOpen" class="custom-modal-background">
      <div class="custom-modal">
        <div class="custom-modal-header">
          <h5>Inscription</h5>
          <span @click="closeRegister" class="custom-modal-close">&times;</span>
        </div>
        <div class="custom-modal-body">
          <!-- Contenu du formulaire d'inscription -->
  <form @submit.prevent="submitForm" id="register">
    <div class="form-group">
      <label for="email">Adresse e-mail :</label>
      <input type="email" class="form-control" id="email" name ="email" required placeholder="Entrez votre adresse e-mail">
    </div>

    <div class="form-group">
    <label for="confirm-register-email">Confirmer l'adresse e-mail :</label>
      <input type="email" class="form-control" id="confirm-register-email" name ="confirm-email" required placeholder="Entrez à nouveau votre adresse e-mail">
    </div>


    <div class="form-group">
      <label for="password">Mot de passe :</label>
      <input type="password" class="form-control" id="password" name ="password" required placeholder="Entrez votre mot de passe">
    </div>

    <div class="form-group">
      <label for="confirm-password">Confirmez le mot de passe :</label>
      <input type="password" class="form-control" id="confirm-register-password" name ="confirm-password" required placeholder="Entrez à nouveau votre mot de passe">
    </div>

    <div class="custom-modal-footer">
          <button type="submit" class="btn btn-primary">S'inscrire</button>
          <img src="~/assets/icons/42.svg" alt="Register-Icon" class="icon-register" @click="connectWith42" />
    </div>
  </form>
  <!-- Fin du formulaire d'inscription -->
    </div>
    </div>
  </div>
  <div v-if="isRegisterOpen && isRegisteredSuccessfully" class="custom-modal-background">
    <div class="custom-modal">
        <div class="custom-modal-body">
            <p>Inscription réussie !</p>
            <button @click="isRegisterOpen = false" class="btn-confirm">OK</button>
        </div>
    </div>
    </div>
    <!-- Modal pour l'échec de l'inscription -->
  <div v-if="isRegisterOpen && isRegistrationFailed" class="custom-modal-background">
    <div class="custom-modal">
        <div class="custom-modal-body">
    <p>Échec de l'inscription. Veuillez réessayer.</p>
    <button @click="isRegisterOpen = false" class="btn-confirm">Fermer</button>
  </div>
  </div>
  </div>
      
  </template>
<script>
import * as bcrypt from 'bcryptjs';

export default {
  name: 'Register',
  data() {
    return {
      isRegisteredSuccessfully: false,
      isRegistrationFailed: false,
      isRegisterOpen: true,
    };
  },
  methods: {
    refresh_page () {
            window.location.reload();
        },
    async submitForm() {                 // Fonction pour envoyer le formulaire d'inscription
     // Récupérer les données du formulaire
      const formData = new FormData(document.querySelector('#register'));
      const email = formData.get('email');
      const password = formData.get('password');
      const confirmEmail = formData.get('confirm-email');
      const confirmPassword = formData.get('confirm-password');
      // Validation du mot de passe
      if (password.length < 8) {
        alert('Le mot de passe doit comporter au moins 8 caractères');
        return;
      }

      // Vérifier la présence d'au moins une lettre majuscule
      if (!/[A-Z]/.test(password)) {
        alert('Le mot de passe doit contenir au moins une lettre majuscule');
        return;
      }

      // Vérifier la présence d'au moins une lettre minuscule
      if (!/[a-z]/.test(password)) {
        alert('Le mot de passe doit contenir au moins une lettre minuscule');
        return;
      }

      // Vérifier la présence d'au moins un chiffre
      if (!/\d/.test(password)) {
        alert('Le mot de passe doit contenir au moins un chiffre');
        return;
      }
      const saltRounds = 10; // Number of salt rounds (cost factor)
      const salt = bcrypt.genSaltSync(saltRounds); // Generate a salt
      const hashedPassword = bcrypt.hashSync(password, salt);
      

      // Vérifier que les champs correspondent
      if (email !== confirmEmail) {
        alert('Les adresses e-mail ne correspondent pas');
        console.error('Les adresses e-mail ne correspondent pas');
        return;
      }
       if (password !== confirmPassword) {
         alert('Les mots de passe ne correspondent pas');
        console.error('Les mots de passe ne correspondent pas');
         return;
       }
      // Créez l'objet `password`.
      const passwordObject = {
      create: {
        salted_password: hashedPassword,
        salt: salt,
      },
    };

      //Envoyer la requête POST à l'API
      const response = await fetch('http://localhost:2000/api/user', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password: passwordObject})
      });

     // Traiter la réponse de l'API
      if (response.ok) {
        this.isRegisteredSuccessfully = true;
        this.isRegistrationFailed = false;
        const data = await response.json();
        const authToken = data.access_token;
        // alert('Account created');
      }
      else {
        this.isRegisteredSuccessfully = false;
        this.isRegistrationFailed = true;
        const data = await response.json();
        this.error = data.message;
        //alert('Error: can\'t create the account');
        console.error(this.error);
      }
    },
    closeRegister() {
      this.$emit('close');
    },
    logout (){
                const response = confirm("Are you sure you want to do that?");

                if (response) {
                    alert("Vous êtes déconnecté");
                    this.cookies.remove("authToken");
                    this.isUserLoggedIn = false;
                } else {
                    alert("Cancel was pressed");
                }
    },
  },
};
</script>