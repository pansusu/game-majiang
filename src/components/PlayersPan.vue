
<script setup lang="ts">
import OtherPlayer from "@/server/vo/otherPlayer";
import OtherPan from "@/components/OtherPan.vue";

interface Props {
	otherPlayer: OtherPlayer;
	direction: string;
}
defineProps<Props>();
</script>

<template>
	<div :class="`flex justify-center ${direction}`">
		<div class="w-[400px] h-6">
			<div class="w-full text-center font-bold text-xl mb-2 text-white">
				{{ otherPlayer.uname }}
				<span
					class="text-orange-400"
					v-if="otherPlayer?.status"
				>【{{ otherPlayer?.status }}】</span>
			</div>
			<div class="flex justify-center">
				<OtherPan :isDiscard="true" :mjs="otherPlayer.remaining_mj" />
			</div>
		</div>
	</div>
</template>


<style scoped>
.side {
	position: absolute;
	height: 100px;
	width: 1200px;
	background: rgba(255, 99, 71, 1);
	border: 1px solid rgba(0, 0, 0, 0.5);
	color: white;
	text-align: center;
	line-height: 4em;
}

.front {
	transform: translateZ(1em);
}

.top {
	@apply absolute top-0;
}

.left {
	transform: rotateZ(-67deg);
	position: absolute;
	left: -60px;
	top: calc(50% - 20px);
}

.right {
	transform: rotateZ(67deg);
	position: absolute;
	right: -60px;
	top: calc(50% - 20px);
}

.back {
	transform: translateZ(-1em);
}
</style>