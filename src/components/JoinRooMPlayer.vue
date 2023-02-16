
<script setup lang="ts">
import type OtherPlayer from "@/server/vo/OtherPlayer";
import { HappyOutline } from "@vicons/ionicons5";

interface Props {
	roomMaster: string;
	players: OtherPlayer[] | undefined;
}
defineProps<Props>();
</script>

<template>
	<div class="flex items-center justify-center bg-gray-50 shadow py-7 mb-6">
		<n-space>
			<div class="text-center" v-for="p,index in players">
				<div class="text-blue-500">{{ p.uname == roomMaster?'房主':"玩家"+index }}</div>
				<div
					class="w-16 h-16 rounded-full bg-green-300 flex flex-col items-center justify-center shadow-md"
				>
					<n-icon color="#0e7a0d" size="40">
						<HappyOutline />
					</n-icon>
				</div>
				<div class="text-green-600 font-bold text-lg">{{ p.uname }}</div>
			</div>
		</n-space>
	</div>
</template>


<style scoped>
</style>