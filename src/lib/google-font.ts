export interface IFont {
    name: string;
    value: string;
}

export const GOOGLE_FONTS: IFont[] = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Comic Sans MS', value: "'Comic Sans MS', cursive" },
    { name: 'Cormorant Garamond', value: "'Cormorant Garamond', serif" },
    { name: 'Crimson Text', value: "'Crimson Text', serif" },
    { name: 'EB Garamond', value: "'EB Garamond', serif" },
    { name: 'Fira Sans', value: "'Fira Sans', sans-serif" },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Impact', value: 'Impact, fantasy' },
    { name: 'Lato', value: "'Lato', sans-serif" },
    { name: 'Libre Baskerville', value: "'Libre Baskerville', serif" },
    { name: 'Lora', value: "'Lora', serif" },
    { name: 'Merriweather', value: "'Merriweather', serif" },
    { name: 'Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Nunito', value: "'Nunito', sans-serif" },
    { name: 'Open Sans', value: "'Open Sans', sans-serif" },
    { name: 'Oswald', value: "'Oswald', sans-serif" },
    { name: 'Playfair Display', value: "'Playfair Display', serif" },
    { name: 'Poppins', value: "'Poppins', sans-serif" },
    { name: 'PT Sans', value: "'PT Sans', sans-serif" },
    { name: 'PT Serif', value: "'PT Serif', serif" },
    { name: 'Raleway', value: "'Raleway', sans-serif" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Source Sans Pro', value: "'Source Sans Pro', sans-serif" },
    { name: 'Source Serif Pro', value: "'Source Serif Pro', serif" },
    { name: 'Times New Roman', value: "'Times New Roman', serif" },
    { name: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
    { name: 'Ubuntu', value: "'Ubuntu', sans-serif" },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Work Sans', value: "'Work Sans', sans-serif" }
].sort((a, b) => a.name.localeCompare(b.name));
