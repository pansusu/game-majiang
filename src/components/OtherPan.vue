
<script setup lang="ts">
import { ref } from "vue";

interface Props {
	mjs: number;
	mjStyle?: object;
	isDiscard?: boolean;
	isPeng?: boolean;
}
const props = defineProps<Props>();

const style = ref({});
style.value = Object.assign(style.value, props.mjStyle);
</script>

<template>
	<div class="flex justify-center w-fit">
		<div
			v-for="mj in mjs"
			:class="`mj $ ${mjStyle} ${isDiscard?'isDiscard':''} ${isPeng?'isPeng':''}`"
			:style="style"
		></div>
	</div>
</template>

<style scoped>
.mj {
	@apply bg-green-200 text-center mr-2 font-bold text-2xl cursor-pointer rounded-md;
	padding: 18px;
	box-shadow: -4px -4px 0px #a0bffc;
}
.isDiscard {
	/* transform: rotate3d(5, 1, -2, 54deg); */
	transform: rotate3d(0, 0, -60, 90deg);
	box-shadow: 4px 3px 0px #a0bffc !important;
	margin: 0;
}
.isPeng {
	transform: skewX(15deg);
	box-shadow: 4px 3px 0px #a0bffc !important;
}
</style>