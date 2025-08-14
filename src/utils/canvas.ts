export const downloadCanvas = (canvas: HTMLCanvasElement, filename = 'image-composition.png') => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};
export const loadFont = async (customFonts: any[], fontFamily: string): Promise<void> => {
    if (document.fonts.check(`16px "${fontFamily}"`)) {
        return;
    }

    const customFont = customFonts.find((font) => font.name === fontFamily);
    if (customFont) {
        try {
            const fontFace = new FontFace(fontFamily, `url(${customFont.src})`);
            const loadedFont = await fontFace.load();
            document.fonts.add(loadedFont);

            await document.fonts.ready;

            let attempts = 0;
            while (!document.fonts.check(`16px "${fontFamily}"`) && attempts < 10) {
                await new Promise((resolve) => setTimeout(resolve, 50));
                attempts++;
            }

            if (!document.fonts.check(`16px "${fontFamily}"`)) {
                throw new Error(`Font ${fontFamily} failed to load after multiple attempts`);
            }

            console.log(`✅ Custom font loaded successfully: ${fontFamily}`);
            return;
        } catch (error) {
            console.error(`❌ Failed to load custom font ${fontFamily}:`, error);
            throw error;
        }
    }

    try {
        const existingLink = document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, '+')}"]`);
        if (!existingLink) {
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
                /\s+/g,
                '+'
            )}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        await document.fonts.load(`16px "${fontFamily}"`);
        await document.fonts.ready;

        let attempts = 0;
        while (!document.fonts.check(`16px "${fontFamily}"`) && attempts < 20) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
        }

        if (!document.fonts.check(`16px "${fontFamily}"`)) {
            console.warn(`⚠️ Google Font may not have loaded properly: ${fontFamily}`);
        }
    } catch (error) {
        console.error(`❌ Failed to load Google Font ${fontFamily}:`, error);
        throw error;
    }
};
