import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PreWarmCard } from '../types';

export const useCardStore = defineStore('card', () => {
    const cards = ref<PreWarmCard[]>([]);

    /** 从本地文件加载 */
    async function loadAll() {
        cards.value = await window.electronAPI.loadCards();
    }

    /** 持久化（剥离响应式 Proxy 再传 IPC） */
    async function saveAll() {
        const raw = JSON.parse(JSON.stringify(cards.value));
        await window.electronAPI.saveCards(raw);
    }

    /** 获取指定课题的最新预热卡片 */
    function getCardForProject(projectId: string): PreWarmCard | undefined {
        return cards.value
            .filter((c) => c.projectId === projectId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    }

    /** 保存/新增预热卡片 */
    async function saveCard(card: Omit<PreWarmCard, 'id' | 'createdAt'>) {
        const newCard: PreWarmCard = {
            id: crypto.randomUUID(),
            ...card,
            createdAt: new Date().toISOString(),
        };
        cards.value.push(newCard);
        await saveAll();
        return newCard;
    }

    return { cards, loadAll, saveAll, getCardForProject, saveCard };
});
