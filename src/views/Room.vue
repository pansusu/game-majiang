
<script setup lang="ts">
import RoomVo from "@/server/vo/roomVo";
import { inject, ref } from "vue";
import { useRouter } from "vue-router";
import type { Socket } from "socket.io-client";
import Cons from "@/server/entity/constants";
import Pan from "@/server/entity/pan";
import Mj from "@/server/entity/mj";
import { sort_pan } from "@/infra/utils/panUtils";
import { useMessage } from "naive-ui";
import OtherPlayer from "@/server/vo/otherPlayer";
import PlayerVo from "@/server/vo/playerVo";
import MaJiangs from "@/components/MaJiangs.vue";
import MaJiangDiscard from "@/components/MaJiangDiscard.vue";
import MyPan from "@/components/MyPan.vue";
import JoinRooMPlayer from "@/components/JoinRooMPlayer.vue";
import PlayersPan from "@/components/PlayersPan.vue";
import CurrentDiscarded from "@/components/CurrentDiscarded.vue";

// --watch './**/*.ts'
const room = ref<RoomVo>();
const me = ref<PlayerVo>();
const pan = ref<Pan | null>();
const myMj = ref<Mj[]>();
const router = useRouter();
const message = useMessage();
const roomMaster = ref("");

const socket: Socket | undefined = inject("socket");
const uname = sessionStorage.getItem("uname") || "";
const password = sessionStorage.getItem("password") || "";
const readyDiscard = ref<number[]>([]);
const isClear_readyDiscard = ref(false);
const count = ref(0);

const left_player = ref<OtherPlayer>();
const right_player = ref<OtherPlayer>();
const top_player = ref<OtherPlayer>();

socket?.emit(Cons.MSG.ROOM_INFO, uname, password);

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
	pan.value = data?.pan || null;
	myMj.value = sort_pan(data?.pan?.myMj);
});

// 发牌倒计时
socket?.on(Cons.MSG.ROOM_INFO_COUNT_DOWN, (c: number) => {
	count.value = c;
});

/**
 * 启动游戏
 */
const handleGameStart = () => {
	if (!room.value) {
		return;
	}
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
	if (!myMj.value) {
		message.error("房间未开始");
		return;
	}

	const mjs = readyDiscard.value.map((item) => myMj?.value?.[item] as Mj);

	// 打了多只麻将，但多只不一样
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
	if (room.value?.currentPlayer == uname) {
		if (readyDiscard.value.length > 1) {
			message.warning("没有这种打法!");
			return false;
		}

		// 倒计时中，不能打牌
		if (count.value > 0) {
			return false;
		}
		return true;
	} else {
		if (isPengAndGang()) {
			return true;
		}
		message.warning("不允许此操作！");
		return false;
	}
};

// 别人打的牌是否在自己的牌中有两个以上
const isPengAndGang = (): boolean => {
	// 其他人只打了一张牌
	if (room.value?.currentMj?.length == 1) {
		const len =
			myMj.value?.filter(
				(item) => item.name == room.value?.currentMj[0].name
			).length || 0;
		return len >= 2;
	} else {
		return false;
	}
};

const handleDiscard = (rd: number[]) => {
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

//用户重新返回了登录页面 要把用用户踢出，可以把用户列表打出来
</script>
<template>
	<div class="p-4 h-full w-full">
		<div class="flex justify-between text-lg mb-7">
			<div>房间号：{{ room?.roomNumber }}</div>
			<div class="font-bold">{{ uname }}【{{ uname == roomMaster?'房主':"玩家"}}】</div>
			<div class="font-bold">剩余牌：{{ myMj?.length }}</div>
		</div>

		<!-- 桌盘 -->
		<div v-if="pan" class="flex items-center justify-center mb-6 relative">
			<div class="min-w-[1300px] tx-clip h-[600px] bg-gray-700"></div>

			<div class="min-w-[1300px] absolute h-[600px]">
				<!-- 出的牌 -->
				<MaJiangDiscard
					v-if="room?.discardedMj "
					:mj-style="{fontSize:'12px',padding:'6px 13px'}"
					:mjs="room?.discardedMj"
				/>

				<!-- 打的牌 -->
				<CurrentDiscarded v-if="room?.currentMj" :currentMj="room.currentMj" />

				<!-- 北 -->
				<PlayersPan v-if="top_player" :other-player="top_player" direction="top" />

				<!-- 西 -->
				<PlayersPan v-if="left_player" :other-player="left_player" direction="left" />

				<!-- 东 -->
				<PlayersPan v-if="right_player" :other-player="right_player" direction="right" />

				<!-- 南 -->
				<div class="absolute bottom-5 w-full">
					<div class="flex flex-col items-center justify-center">
						<div class="font-bold text-lg mb-2 text-white">
							{{ me?.uname }}
							<span class="text-orange-400" v-if="me?.status">【{{ me?.status }}】</span>
						</div>
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
		<!-- 桌盘 end -->

		<!-- 进入游戏的好友 -->
		<JoinRooMPlayer v-else :roomMaster="roomMaster" :players="room?.playersAll || []" />

		<!-- 暗杠 ，胡牌， 发牌, 游戏结束 -->
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
.tx-clip {
	clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
}
</style>