declare module '*.vue' {
	import { DefineComponent } from 'vue'
	const component: DefineComponent<{}, {}, any>
	export default component
}
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 在这里添加你的环境变量类型定义
  readonly VITE_API_URL: string;
  // 其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
