<template>
	<div class="h-full">
		<div
			class="bg-green-600 text-center py-2 font-bold text-lg text-green-200 shadow-md fixed top-0 w-full"
		>老罗麻将</div>
		<div class="pt-16 h-full">
			<router-view />
		</div>
	</div>
</template>

<script setup lang="ts">
import Cons from "@/server/entity/constants";
import Result from "@/server/entity/result";
import { useMessage } from "naive-ui";
import { inject, onMounted } from "vue";

const socket: any = inject("socket");
const message = useMessage();

socket?.on(Cons.MSG.MESSAGE, (c: Result): void => {
	if (c.code != 0) {
		message.error(c.msg || "访问错误");
	} else {
		message.success(c.msg || "success");
	}
});
</script>

<style scoped></style>
