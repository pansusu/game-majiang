
<script setup lang="ts">
import Player from "@/server/entity/player";
import RoomVo from "@/server/vo/roomVo";
import { inject, ref } from "vue";
import { useRouter } from "vue-router";
import type { Socket } from "socket.io-client";
import Cons from "@/server/entity/constants";
import Result from "@/server/entity/result";
import Pan from "@/server/entity/pan";
import Mj from "@/server/entity/mj";
import { sort_pan } from "@/infra/utils/panUtils";
import { useMessage } from "naive-ui";
import OtherPlayer from "@/server/vo/otherPlayer";
import player from "@/server/entity/player";
import PlayerVo from "@/server/vo/playerVo";
import MaJiangs from "@/components/MaJiangs.vue";
import MyPan from "@/components/MyPan.vue";
import OtherPan from "@/components/OtherPan.vue";
import { HappyOutline } from "@vicons/ionicons5";

const colors = ["text-red-500", "text-blue-500", "text-green-500"];

// --watch './**/*.ts'
const room = ref<RoomVo>();
const me = ref<PlayerVo>();
const pan = ref<Pan>();
const myMj = ref<Mj[]>();
const router = useRouter();
const message = useMessage();
const roomMaster = ref("");

const socket: Socket | undefined = inject("socket");
const uname = sessionStorage.getItem("uname") || "";
const password = sessionStorage.getItem("password") || "";
const readyDiscard = ref<string[]>([]);
const isClear_readyDiscard = ref(false);
const count = ref(0);

const left_player = ref<OtherPlayer>();
const right_player = ref<OtherPlayer>();
const top_player = ref<OtherPlayer>();

socket?.emit(Cons.MSG.ROOM_INFO, uname, password);

socket?.on(Cons.MSG.NO_LOGIN, (data: Result) => {
	const { code, msg } = data;
	if (code !== 0) {
		router.push("/");
	}
});
// 获取房间信息
socket?.on(Cons.MSG.ROOM_INFO, (data: RoomVo) => {
	room.value = data;
	console.log("roomVue:", room.value);
	const players = room.value.playersAll;
	const myPosition = players.findIndex((p) => p.uname == uname);
	roomMaster.value = data?.playersAll?.[0].uname;

	right_player.value = players[(myPosition + 1) % 4];
	top_player.value = players[(myPosition + 2) % 4];
	left_player.value = players[(myPosition + 3) % 4];
});
// 获取当前用户信息
socket?.on(Cons.MSG.USER_INFO, (data: PlayerVo) => {
	console.log("userInfo:", data);
	me.value = data;
	pan.value = data.pan;
	myMj.value = sort_pan(data.pan?.myMj);
});
// 发牌倒计时
socket?.on(Cons.MSG.ROOM_INFO_COUNT_DOWN, (c: number) => {
	count.value = c;
});

/**
 * 启动游戏
 */
const handleGameStart = () => {
	if (room.value.playersAll.length < 2) {
		message.warning("至少要两个人才能开始游戏！");
		return;
	}
	if (roomMaster.value != uname) {
		message.warning("请提醒房主开始！");
		return;
	}
	socket?.emit(Cons.MSG.GAME_START, uname);
};

/**
 * 打牌
 */
const sendDiscard = () => {
	if (!canDiscard()) {
		handleClearReadyDiscard();
		return;
	}

	const mjs = readyDiscard.value.map((item) => {
		return myMj.value[item] as Mj;
	});
	if (
		mjs.length >= 2 &&
		!mjs.every((item, i, arr) => item.name == arr[0].name)
	) {
		message.error("没有这个打法");
		return;
	}
	socket?.emit(Cons.MSG.MJ_DISCARD, { uname, mjs });
	handleClearReadyDiscard();
};

const handleClearReadyDiscard = () => {
	isClear_readyDiscard.value = true;
	readyDiscard.value = [];
};

const canDiscard = (): boolean => {
	if (readyDiscard.value.length <= 0) {
		message.warning("请先选择牌");
		return false;
	}

	// 是否轮到自己
	if (room.value.currentPlayer == uname && readyDiscard.value.length > 1) {
		message.warning("没有这种打法!");
		return false;
	}

	// 倒计时中，不能打牌
	if (count.value > 0) {
		return false;
	}

	if (room.value.currentPlayer != uname && !isPengAndGang()) {
		message.warning("不允许此操作！");
		return false;
	}

	return true;
};

// 别人打的牌是否在自己的牌中有两个以上
const isPengAndGang = (): boolean => {
	// 其他人只打了一张牌
	if (room.value?.currentMj?.length == 1) {
		const len = myMj.value.filter(
			(item) => item.name == room.value.currentMj[0].name
		).length;
		console.log("len: " + len);
		return len >= 2;
	} else {
		return false;
	}
};

const handleDiscard = (rd: string[]) => {
	isClear_readyDiscard.value = false;
	readyDiscard.value = rd;
};

const stopGame = () => {
	if (roomMaster.value != uname) {
		message.warning("只有房主才能终止游戏！");
		return;
	}
	socket?.emit(Cons.MSG.DELETE_ROOM, uname);
};
</script>
<template>
	<div class="p-4">
		<div class="flex justify-between text-lg mb-10">
			<div>房间号：{{ room?.roomNumber }}</div>
			<div class="font-bold">{{ uname }}【{{ uname == roomMaster?'房主':"玩家"}}】</div>
			<div class="font-bold">剩余牌：{{ myMj?.length }}</div>
		</div>

		<div v-show="pan" class="flex items-center justify-center mb-6 relative">
			<div class="bg-green-700 min-w-[1300px] tx-clip h-[500px]"></div>

			<div class="w-[1600px] absolute h-[500px]">
				<div v-if="top_player" class="top w-full flex justify-center">
					<div class="w-[400px] h-6">
						<div class="flex justify-center">
							<OtherPan :isDiscard="true" :mjs="top_player.remaining_mj" />
						</div>
						<div class="w-full text-center font-bold text-xl mb-4 text-white">{{ top_player?.status }}</div>
					</div>
				</div>

				<div v-if="room?.currentMj" class="w-[400px] medium">
					<MaJiangs :isDiscard="true" :mjs="room.currentMj" />
				</div>

				<div v-if="left_player" class="w-[450px] h-6 left">
					<div class="flex justify-center">
						<OtherPan :isDiscard="true" :mjs="left_player.remaining_mj" />
					</div>
					<div class="w-full text-center font-bold text-xl mb-4 text-white">{{ left_player?.status }}</div>
				</div>

				<div v-if="right_player" class="w-[450px] h-6 right">
					<div class="flex justify-center">
						<OtherPan :isDiscard="true" :mjs="right_player.remaining_mj" />
					</div>
					<div class="w-full text-center font-bold text-xl mb-4 text-white">{{ right_player?.status }}</div>
				</div>

				<div class="bottom w-full">
					<div class="flex flex-col items-center justify-center">
						<div class="font-bold text-lg mb-4 text-white">{{ me?.status }}</div>
						<div v-if="pan?.hadPeng" class="w-full mb-5">
							<div class="flex flex-col items-center justify-center">
								<MaJiangs
									:isPeng="true"
									:mj-style="{fontSize:'12px',padding:'6px 13px'}"
									:mjs="pan?.hadPeng"
								/>
							</div>
						</div>
						<MyPan :clear="isClear_readyDiscard" @handle-discard="handleDiscard" :mjs="myMj" />
					</div>
				</div>
			</div>
		</div>

		<div v-show="!pan" class="flex items-center justify-center bg-gray-50 shadow py-7 mb-6">
			<n-space>
				<div class="text-center" v-for="p,index in room?.playersAll">
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

		<!-- 暗杠 ，胡牌， 发牌, 游戏结束，删除房间 -->
		<div class="flex items-center justify-center w-full">
			<div class="flex flex-col justify-center items-center">
				<div v-if="pan" class="text-orange-500 text-2xl font-bold mb-5">出牌倒计时： {{ count }}</div>
				<n-space>
					<n-button round size="large" v-if="!pan" type="primary" @click="handleGameStart">开始</n-button>
					<n-button :disabled="!pan" round size="large" type="info" @click="sendDiscard">出牌</n-button>
					<n-button v-if="roomMaster == uname" round size="large" @click="stopGame()">终止</n-button>
				</n-space>
			</div>
		</div>
	</div>
</template>

<style scoped>
.cube {
	transform-style: preserve-3d;
	transform: rotateX(-20deg) rotateY(10deg);
}

.tx-clip {
	clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
}

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

.bottom {
	@apply absolute bottom-5;
}

.medium {
	@apply absolute top-1/4;
	left: calc(50% - 35px);
}

.top {
	@apply absolute top-3;
}

.left {
	transform: rotateZ(-63deg) translateY(220px) translateX(-150px);
	position: absolute;
	left: 0;
}

.right {
	transform: rotateZ(63deg) translateY(220px) translateX(150px);
	position: absolute;
	right: 0;
}

.back {
	transform: translateZ(-1em);
}
</style>