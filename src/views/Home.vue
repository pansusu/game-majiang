

<script lang="ts" setup>
import RoomVo from "../server/vo/roomVo";
import { inject, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Cons from "../server/entity/constants";
import Result from "../server/entity/result";
import { useMessage } from "naive-ui";

const socket: any = inject("socket");
const message = useMessage();
const router = useRouter();
const rooms = ref<RoomVo[]>();
const uname = sessionStorage.getItem("uname");

const newGame = () => {
	socket.emit(Cons.MSG.CREATE_ROOM, uname);
};

socket.on(Cons.MSG.CREATE_ROOM, () => {
	router.push("/game/room");
});

socket.emit(Cons.MSG.SHOW_ROOMS);
socket.on(Cons.MSG.SHOW_ROOMS, (data: RoomVo[]) => {
	console.log(data);
	rooms.value = data;
});

const joinGame = (roomNumber: string) => {
	if (!uname) {
		message.error("未登录无法加入");
		router.push("/game/login");
		return;
	}
	socket.emit(Cons.MSG.JOIN_ROOM, { uname, roomNumber });
};

socket.on(Cons.MSG.JOIN_ROOM, (data: Result) => {
	if (data.code === 0) {
		router.push("/game/room");
	} else {
		alert(data.msg);
	}
});

onMounted(() => {
	console.log(uname);
	if (!uname) {
		router.push("/game/login");
	} else {
		socket.emit(Cons.MSG.IS_LOGIN, uname);
	}
});
</script>

<template>
	<div class="w-full">
		<div class="p-4">当前登录人：{{ uname }}</div>
		<div class="h-1/4 overflow-y-auto border px-4 py-3">
			<div>
				<div class="flex justify-between border-b pb-3">
					<div>序号</div>
					<div>房间号</div>
					<div>人数</div>
					<div>状态</div>
					<div>操作</div>
				</div>
			</div>
			<div v-if="rooms && rooms.length > 0" v-for="(item, index) in rooms" class="mt-3">
				<div class="flex justify-between">
					<div>{{ index + 1 }}</div>
					<div>{{ item.roomNumber }}</div>
					<div>{{ item.players }}</div>
					<div>{{ item.status }}</div>
					<n-button @click="joinGame(item.roomNumber)">加入</n-button>
				</div>
			</div>
			<div v-else class="text-center mt-3 text-gray-500">暂无房间</div>
		</div>

		<div class="w-full flex flex-col justify-center items-center">
			<div class="w-full mt-7 px-10">
				<n-button @click="newGame">创建游戏</n-button>
			</div>
		</div>
	</div>
</template>
