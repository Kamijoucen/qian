import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PreWarmCard } from '../types';

export const useCardStore = defineStore('card', () => {
    const cards = ref<PreWarmCard[]>([]);

    /** 从 Forma 加载所有预热卡片 */
    async function loadAll() {
        cards.value = await window.electronAPI.loadCards();
    }

    /** 获取指定课题的最新预热卡片 */
    function getCardForProject(projectId: string): PreWarmCard | undefined {
        return cards.value
            .filter((c) => c.projectId === projectId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    }

    /** 保存/新增预热卡片 */
    async function saveCard(card: Omit<PreWarmCard, 'id' | 'createdAt'>) {
        const newCard = await window.electronAPI.createCard({
            projectId: card.projectId,
            nextAction: card.nextAction,
            target: card.target,
            checkpoint: card.checkpoint,
        });
        cards.value.push(newCard);
        return newCard;
    }

    return { cards, loadAll, getCardForProject, saveCard };
});
