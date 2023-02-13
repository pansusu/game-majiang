
<script setup lang="ts">
import Cons from "@/server/entity/constants";
import PlayerVo from "@/server/vo/playerVo";
import { inject, ref } from "vue";

const socket: any = inject("socket");
const players = ref<PlayerVo[]>([]);

// socket.emit(Cons.MSG.SHOW_ROOMS);
socket.on(Cons.MSG.SHOW_PLAYERS, (ps: PlayerVo[]) => {
	console.log(ps);
	players.value = ps;
});
</script>

<template>
	<div class="p-4 bg-red-50">
		<div>玩家列表</div>
		<div v-if="players.length>0" v-for="item in players">{{ item.uname }}</div>
		<div v-else>暂无玩家</div>
	</div>
</template>


<style scoped>
</style>