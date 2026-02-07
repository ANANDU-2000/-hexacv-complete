/// <reference types="vite/client" />

interface ImportedMetaEnv {
    readonly VITE_GROQ_API_KEY: string;
    readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportedMetaEnv;
}
declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
}
