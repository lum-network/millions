export const calculateFontSize = (charactersCount: number, screenWidth: number, minFontSize = 50): number => {
    const MAX_FONT_SIZE = 140;
    const MIN_FONT_SIZE = minFontSize;
    const MAX_CHARACTERS = 10;
    const MIN_CHARACTERS = 3;
    const SCREEN_WEIGHT = 0.5;

    const charactersCountWithSpace = charactersCount + Math.floor((charactersCount + 1) / 4);

    const range = MAX_FONT_SIZE - MIN_FONT_SIZE;
    const charactersRatio = (charactersCountWithSpace - MIN_CHARACTERS) / (MAX_CHARACTERS - MIN_CHARACTERS);
    const fontSize = screenWidth / (charactersCountWithSpace + 1);
    const clampedFontSize = Math.min(Math.max(fontSize, MIN_FONT_SIZE), MAX_FONT_SIZE);

    if (charactersCountWithSpace > MIN_CHARACTERS) {
        const scaledFontSize = clampedFontSize - range * charactersRatio;
        const weightedFontSize = scaledFontSize + range * SCREEN_WEIGHT * (1 - charactersRatio);
        return Math.max(weightedFontSize, MIN_FONT_SIZE);
    }

    return clampedFontSize;
};
