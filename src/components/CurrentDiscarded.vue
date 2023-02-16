

<script setup lang="ts">
import Mj from "@/server/entity/mj";
import MaJiangs from "@/components/MaJiangs.vue";

interface Props {
	currentMj: Mj[];
}

defineProps<Props>();
</script>

<template>
	<div class="w-full absolute top-[200px] flex justify-center items-center">
		<div class="w-[700px]">
			<div class="flex justify-center items-center">
				<MaJiangs :isDiscard="true" :mjs="currentMj" />
			</div>
		</div>
	</div>
</template>

<style scoped>
</style>