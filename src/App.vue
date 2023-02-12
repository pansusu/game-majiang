
<template>
	<n-config-provider :locale="zhCN" :date-locale="dateZhCN" class="h-full">
		<naive-provider>
			<router-view />
		</naive-provider>
	</n-config-provider>
</template>

<script setup lang="ts">
import NaiveProvider from "@/components/NaiveProvider.vue";
import { dateZhCN, zhCN } from "naive-ui";
</script>


<style scoped>
</style>
