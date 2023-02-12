
<script setup lang="ts">
import Mj from "@/server/entity/mj";
import { ref } from "vue";

interface Props {
	mjs: Mj[];
	mjStyle?: object;
	isDiscard?: boolean;
	isPeng?: boolean;
}
const props = defineProps<Props>();

const style = ref({});
style.value = Object.assign(style.value, props.mjStyle);
const colors = ["text-red-500", "text-blue-500", "text-green-500"];
</script>

<template>
	<div class="flex justify-center w-fit">
		<div
			v-for="mj in mjs"
			:class="`mj ${colors[mj.type]} ${mjStyle} ${isDiscard?'isDiscard':''} ${isPeng?'isPeng':''}`"
			:style="style"
		>
			<div>{{ mj.num }}</div>
			<div>{{ mj.typeName }}</div>
		</div>
	</div>
</template>

<style scoped>
.mj {
	@apply p-4 bg-orange-50 text-center mr-2 font-bold text-2xl cursor-pointer rounded-md;
	box-shadow: -4px -4px 0px #a0bffc;
}
.isDiscard {
	transform: rotate3d(5, 1, -2, 54deg);
	box-shadow: 4px 3px 0px #a0bffc !important;
}
.isPeng {
	transform: skewX(15deg);
	box-shadow: 4px 3px 0px #a0bffc !important;
	line-height: 17px;
}
</style>