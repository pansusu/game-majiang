
<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { inject, onMounted, ref } from "vue";
import Cons from "../server/entity/constants";
import { useRouter } from "vue-router";
import { useMessage } from "naive-ui";

const socket: Socket | undefined = inject("socket");
const uname = ref("");
const password = ref("11");
const router = useRouter();
const message = useMessage();

const login = () => {
	// || sessionStorage.getItem("uname")
	let user = uname.value || sessionStorage.getItem("uname");
	let pwd = password.value || sessionStorage.getItem("password");

	if (!user || !pwd) {
		message.warning("please enter your username and password!");
		return;
	}

	if (user.length > 5) {
		message.warning("Name must not be more than 5 characters.");
		return;
	}

	sessionStorage.setItem("uname", user);
	sessionStorage.setItem("password", pwd);
	socket?.emit(Cons.MSG.LOGIN, user, pwd);
};

onMounted(() => {
	// login();
});

socket?.on(Cons.MSG.LOGIN, (data) => {
	console.log(data);
	const { code, msg } = data;
	if (code == 0) {
		router.push("/game/home");
	} else {
		alert(msg);
	}
});

socket?.on(Cons.MSG.RECONNECT, (data) => {
	const { code, msg } = data;
	if (code == 0) {
		router.push("/game/game-room");
	} else {
		alert(msg);
	}
});
</script>

<template>
	<div class="h-full flex flex-col justify-center items-center bg-green-50">
		<div class="flex flex-col items-center w-[400px] shadow-md px-10 pb-24 bg-white rounded-md">
			<!-- <img class="w-3/5 h-1/2" src="../assets/hdl.png" /> -->
			<div class="my-10 text-lg">登录</div>
			<n-input class="mb-10" v-model:value="uname" size="large" round placeholder="输入用户" />
			<n-input class="mb-10" v-model:value="password" size="large" round placeholder="输入密码" />
			<n-button
				type="primary"
				round
				size="large"
				class="w-[400px]"
				style="width: 100%;"
				@click="login"
			>登录</n-button>
		</div>
	</div>
</template>


<style scoped>
</style>