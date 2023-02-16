
<script setup lang="ts">
import Mj from "@/server/entity/mj";
import { ref } from "vue";

interface Props {
	mjs: Mj[];
	mjStyle?: object;
	isDiscard?: boolean;
}
const props = defineProps<Props>();

const style = ref({});
style.value = Object.assign(style.value, props.mjStyle);
const colors = ["text-red-500", "text-blue-500", "text-green-500"];
</script>

<template>
	<div class="w-full absolute top-20 flex justify-center items-center">
		<div class="w-[700px]">
			<div class="flex justify-center items-center">
				<div class="flex justify-center flex-wrap">
					<div v-for="mj in mjs" :class="`mj ${colors[mj.type]} ${mjStyle} isPeng`" :style="style">
						<div>{{ mj.num }}</div>
						<div>{{ mj.typeName }}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.mj {
	@apply p-4 bg-orange-50 text-center mr-2 font-bold text-2xl cursor-pointer rounded-md mb-2;
	box-shadow: -4px -4px 0px #a0bffc;
}
.isDiscard {
	transform: rotate3d(5, 1, -2, 54deg);
	box-shadow: 4px 3px 0px #a0bffc !important;
}
.isPeng {
	transform: skewX(0deg);
	box-shadow: 4px 3px 0px #a0bffc !important;
	line-height: 17px;
}
</style>