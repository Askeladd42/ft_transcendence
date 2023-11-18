<!-- Logout.vue -->
<template>
    <!-- Confirmation Modal for Logout -->
    <div v-if="showconfirmation" class="custom-modal-background">
        <div class="custom-modal">
            <div class="custom-modal-header">
                <h5>Confirmation</h5>
                <span @click="showconfirmation = false" class="custom-modal-close">&times;</span>
            </div>
            <div class="custom-modal-body">
                <p>Voulez-vous vraiment vous déconnecter?</p>
                <button @click="logout" class="btn-confirm">Oui</button>
                <button @click="showconfirmation = false" class="btn-confirm">Non</button>
            </div>
        </div>
    </div>
    <!-- Vous etes deconnectes -->
    <div v-if="showLoggedOutModal" class="custom-modal-background">
        <div class="custom-modal">
            <div class="custom-modal-header">
                <h5>Information</h5>
                <span @click="showLoggedOutModal = false" class="custom-modal-close">&times;</span>
            </div>
            <div class="custom-modal-body">
                <p>Vous êtes déconnecté</p>
                <button @click="refresh_page" class="btn-confirm">OK</button>
            </div>
        </div>
    </div>
</template>
<script>
import { useCookies } from "vue3-cookies";
export default {
    name: "Logout",
    data() {
        return {
            showLogoutConfirmationModal: false,
            showLoggedOutModal: false,
        };
    },
    emits: ['closeLogout'],
    props: ['showlogout', 'showconfirmation'],
    setup() {
        const { cookies } = useCookies();
        return { cookies };
    },
    methods: {

        refresh_page() {
            window.location.reload();
        },
        logout() {
            this.cookies.remove("authToken");
            this.cookies.remove("userId");
            this.isUserLoggedIn = false;
            this.showLogoutConfirmationModal = false;
            this.showLoggedOutModal = true;
        },
    },
}
</script>