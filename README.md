# DB-eit-projManager

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### 清除登录状态的命令（浏览器控制台）
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('user');


## 更改计划
### 1. 人员工时周的统计，放在甘特图顶部。
### 2. 周数（w+number)没有跟着走
### 3. 甘特图的竖线
### 4. 把tag改为flag
### 5. 把项目详细信息里的开始结束时间改为KO和CAV
### 6. 字段从User改为engineer
### 7. 向后台请求数据后保存在前台，只有当刷新网页的时候再次清空重新请求。
### 8. 每次以最小化请求。
