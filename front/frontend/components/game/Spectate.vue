<template>
    <div v-if="searching" class="match-list">
        <h2>Liste des matchs en cours :</h2>
        <div v-if="matchList.length !== 0" v-for="match in matchList">
            <div v-if="!match.isOver">
                <button @click="accessMatch(match.id)" class="match-btn">
                    {{ match.isRanked ? 'Classé' : 'Normal' }} : {{ users[match.userId1] }} vs {{ users[match.userId2] }}
                    | 
                    {{ match.scoreUser1 }} : {{ match.scoreUser2 }}
                </button>
            </div>
        </div>
        <div v-else-if="matchList.length === 0">
            <p class="empty-match-list">Aucun match en cours</p>
        </div>    
    </div>
    <Game v-if="showGame" />
    <button v-if="showGame" @click="showGame = false" class="quit-game-btn">Quitter la partie</button>
</template>

<script>
import Game from './Game.vue';
import { useCookies } from "vue3-cookies";

export default {
    name: 'Spectate',
    data() {
        return {
            searching: true,
            showGame: false,
            users: {},
        };
    },
    setup() {
        const { cookies } = useCookies();
        const state = reactive({
            userId: cookies.get("userId"),
            token: cookies.get("authToken"),
            cookies,
            matchList: [],
        });
        return state;
    },
    emits: ['close-match-list', 'startGame', 'showGame', 'stopGame'],
    mounted() {
        if (!this.showGame)
            this.loopSearchMatch();
    },
    methods: {
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
            return data.nickname;
        },
        async fetchUser(id) {
            if (!this.users[id]) {
                this.users[id] = await this.getUserById(id);
            }
        },
        async loopSearchMatch() {
            const userId = this.cookies.get("userId");
            const token = this.cookies.get('authToken');
            const baseUrl = `http://${window.location.hostname}`;
            this.intervalId = setInterval(async () => {
                try {
                    const response = await fetch(`${baseUrl}:2000/game`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Error getting match list');
                    }
                    const m = await response.json();
                    if (m) {
                        for (let i = 0; i < m.length; i++) {
                            this.matchList.push(m[i]);
                            this.fetchUser(m[i].userId1);
                            this.fetchUser(m[i].userId2);
                            clearInterval(this.intervalId);
                        }
                    } else {
                        console.log('Aucun match en cours');
                    }
                } catch (error) {
                    clearInterval(this.intervalId);
                }
            }, 1000);
        },
        stopLoop() {
            clearInterval(this.intervalId);
        },
        async accessMatch(gameId) {
            const baseUrl = `http://${window.location.hostname}`;
            this.stopLoop();
            this.$emit('close-match-list');
            const response = await fetch(`${baseUrl}:2000/game/gameId/${gameId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Error getting the match');
            }
            const m = await response.json();
            if (m)
                this.$emit('startGame');    // à remplacer par un event startSpectating(gameId) pour le spectateur
            else
                console.log('Aucun match en cours');
        },
    },
    components: {
        Game,
    },
};
</script>

<style>
@import "~/assets/css/spectate.css";
</style>