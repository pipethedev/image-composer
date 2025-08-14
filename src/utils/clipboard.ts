export const copyToClipboard = async (text: string): Promise<boolean> => {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);

            return true;
        } catch (error) {
            console.error('Clipboard API failed:', error);

            return false;
        }
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');

            return true;
        } catch (error) {
            console.error('Fallback copy method failed:', error);

            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    }
};
