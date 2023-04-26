export const calculateFontSize = (charactersCount: number, screenWidth: number, minFontSize = 50): number => {
    const MAX_FONT_SIZE = 140;
    const MIN_FONT_SIZE = minFontSize;
    const MAX_CHARACTERS = 10;
    const MIN_CHARACTERS = 4;

    const range = MAX_FONT_SIZE - MIN_FONT_SIZE;
    const charactersRatio = (charactersCount - MIN_CHARACTERS) / (MAX_CHARACTERS - MIN_CHARACTERS);
    const fontSize = screenWidth / (charactersCount + 1);
    const clampedFontSize = Math.min(Math.max(fontSize, MIN_FONT_SIZE), MAX_FONT_SIZE);

    if (charactersCount > MIN_CHARACTERS) {
        const scaledFontSize = clampedFontSize - range * charactersRatio;
        return Math.max(scaledFontSize, MIN_FONT_SIZE);
    }

    return clampedFontSize;
};
