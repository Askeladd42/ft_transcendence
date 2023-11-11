<!-- Login.vue -->
<template> <!-- Formulaire de connexion -->
    <div v-if="isLoginOpen" class="custom-modal-background">
      <div class="custom-modal">
        <div class="custom-modal-header">
          <h5>Connexion</h5>
          <span @click="closeLogin" class="custom-modal-close">&times;</span>
        </div>
        <div class="custom-modal-body">
          <!-- Contenu du formulaire connexion -->
          <form @submit.prevent="login" id="login">
            <div class="form-group">
              <label for="email">Adresse e-mail </label>
              <input type="email" class="form-control" id="email" name="email" required placeholder="Entrez votre adresse e-mail">
            </div>
            <div class="form-group">
              <label for="password">Mot de passe </label>
              <input type="password" class="form-control" id="password" name="password" required placeholder="Entrez votre mot de passe">
            </div>
            <div class="custom-modal-footer">
          <button type="submit" class="btn btn-primary">Se connecter</button>
          <img src="~/assets/icons/42.svg" alt="Register-Icon" class="icon-register" @click="connectWith42" />
        </div>
          </form>
        </div>
      </div>
    </div>
      <!-- Fin du formulaire de connexion -->
      <div v-if="isLoginOpen && isLoggedSuccessfully" class="custom-modal-background">
    <div class="custom-modal">
        <div class="custom-modal-body">
            <p>Connexion  réussie !</p>
            <button @click="refresh_page" class="btn-confirm">OK</button>
        </div>
    </div>
    </div>
    <!-- Modal pour l'échec de la connexion -->
    <div v-if="isLoginOpen && isLoggedFailed" class="custom-modal-background">
    <div class="custom-modal">
        <div class="custom-modal-body">
            <p>Échec de la connexion. Veuillez réessayer.</p>
            <button @click="refresh_page" class="btn-confirm">Fermer</button>
        </div>
    </div>
    </div>
</template>
<script>
import { useCookies } from "vue3-cookies";
export default {
    name: "Login",
    data() {
        return {
            isLoggedSuccessfully: false,
            isLoggedFailed: false,
            isLoginOpen: true,
        };
    },
    setup() {
    const { cookies } = useCookies();
    return { cookies };
    },
    methods: {
        refresh_page () {
            window.location.reload();
        },
        async login() { //Fonction pour se connecter 
        const formData = new FormData(document.querySelector('#login'));
        const email = formData.get('email');
        const password = formData.get('password');
        const baseUrl = `http://${window.location.hostname}`;
        const response = await fetch(`${baseUrl}:2000/auth/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password// Envoyez le mot de passe
        })
        });
        // Traiter la réponse de l'API
        if (response.ok) {
            this.isLoggedSuccessfully = true;
            this.isLoggedFailed = false;
            const data = await response.json();
            const expirationDate = new Date();
            expirationDate.setHours(expirationDate.getHours() + 1); // Creation d'une date d'expiration pour le cookie
           
            // token
            const authToken = data.access_token;
            this.cookies.set("authToken", authToken, { expires: expirationDate }); // Stocker le token dans un cookie + ajout d'une date d'expiration
            //id
            if (!this.cookies.get("userId")) {
              const userId = data.id;
              this.cookies.set("userId", userId, { expires: expirationDate });
            }
            console.log(authToken);
            console.log(userId);
        }
        else {
            this.isUserLoggedIn = false;
            this.isLoggedSuccessfully = false;
            this.isLoggedFailed = true;
            const data = await response.json();
            console.log(data);
            this.error = data.message;
            // alert('Error: can\'t find the associated account');
            console.error('Error: can\'t find the associated account');
        }
        },
        connectWith42() {
        // Les informations pour l'authentification
        const clientID = 'YOUR_CLIENT_ID';
        const redirectURI = encodeURIComponent('http://localhost:2002/auth/callback'); // Assurez-vous que cette URI est enregistrée dans votre application sur l'intra 42
        const responseType = 'code';

        // Construire l'URL d'authentification
        const authURL = `https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=${responseType}&scope=public`;

        // Redirection de l'utilisateur vers l'URL d'authentification
        window.location.href = authURL;
      },
      closeLogin() {
      this.$emit('close');
      },
    },
}
</script>