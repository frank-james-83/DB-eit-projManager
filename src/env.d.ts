

interface ImportMetaEnv {
  // 在这里添加你的环境变量类型定义
  readonly VITE_API_URL: string;
  readonly BASE_URL: string;
  // 其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
