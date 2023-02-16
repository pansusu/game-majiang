

<script setup lang="ts">
import Mj from "@/server/entity/mj";
import { ref, watch } from "vue";
interface Props {
	mjs: Mj[] | undefined;
	clear: boolean;
}
const props = defineProps<Props>();
const readyDiscard = ref<number[]>([]);
const colors = ["text-red-500", "text-blue-500", "text-green-500"];
const emit = defineEmits(["handleDiscard"]);

const handleDiscard = (index: number) => {
	if (readyDiscard.value.includes(index)) {
		readyDiscard.value = readyDiscard.value.filter((item) => item != index);
		return;
	}
	readyDiscard.value.push(index);
	emit("handleDiscard", readyDiscard.value);
};

watch(
	() => props.clear,
	() => {
		if (props.clear) {
			console.log(props.clear);
			readyDiscard.value = [];
		}
	}
);
</script>

<template>
	<div class="flex justify-center w-fit">
		<div
			@click="handleDiscard(index)"
			:class="`group mj ${colors[item.type]} ${readyDiscard.includes(index) ? '-translate-y-6' : ''}`"
			v-for="item, index in mjs"
		>
			<div>{{ item.num }}</div>
			<div>{{ item.typeName }}</div>
			<div class="text-sm hidden group-hover:block absolute text-orange-700 bottom-1 shadow-md">出牌</div>
		</div>
	</div>
</template>

<style scoped>
.mj {
	@apply p-4 bg-orange-50 text-center mr-1 font-bold text-xl cursor-pointer rounded-md;
	box-shadow: -4px -4px 0px #64ca89;
}
</style>