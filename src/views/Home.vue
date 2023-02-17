<script lang="tsx" setup>
import RoomVo from "../server/vo/roomVo";
import { inject, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Cons from "../server/entity/constants";
import Result from "../server/entity/result";
import { useMessage,NSpace,NButton } from "naive-ui";

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

const deleteRoom = (roomNumber: string) => {
	if (!uname && !roomNumber) {
		return;
	}
	socket?.emit(Cons.MSG.DELETE_ROOM_BY_ROOM_NUM, { uname, roomNumber });
};

onMounted(() => {
	console.log(uname);
	if (!uname) {
		router.push("/game/login");
	} else {
		socket.emit(Cons.MSG.IS_LOGIN, uname);
	}
});

const columns = [
	{
		title: "房间号",
		key: "roomNumber",
	},
	{
		title: "人数",
		key: "players",
	},
	{
		title: "状态",
		key: "status",
	},
	{
		title: "操作",
		render: (row:RoomVo)=>{
			return (
					<NSpace>
						<NButton onClick={()=>{joinGame(row.roomNumber)}} >加入</NButton>
						<NButton  onClick={()=>{deleteRoom(row.roomNumber)}} >删除</NButton>
					</NSpace>
				);
		}
	}
];
</script>

<template>
	<div class="w-full px-5">
		<div
			class="my-3 py-2 px-4 bg-green-200 text-green-500 w-fit rounded-full font-bold"
		>当前登录人：{{ uname }}</div>

		<!-- <div class="flex"> -->
		<n-data-table :columns="columns" :data="rooms" :bordered="false" />
		<!-- <Players /> -->
		<!-- </div> -->
	</div>
	<div class="w-full flex justify-center items-center my-5 fixed bottom-10">
		<n-button round type="primary" style="width: 200px;" @click="newGame">创建房间</n-button>
	</div>
</template>
