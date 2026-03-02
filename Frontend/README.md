<br />
<div align="center">
    <img src="public/favicon-light.svg" style="vertical-align: middle;" width="48" height="48"/>
    <br />
    <br />
    <p>
        Build a Modern Dashboard UI Design using React JS, TailwindCSS.
</p>
<a href="https://youtu.be/uHxZMmvQXHQ">Watch Tutorial</a>

</div>

<br />

![Dashboard UI Design](./public/Dashboard%20UI%20Design.png)

## 🗒️ Table of Contents

1. [💬 Introduction](#introduction)
2. [🛠️ Tools](#tools)
3. [✨ Features](#features)
4. [🚀 Getting Started](#getting-started)
5. [💻 Code Snippets](#code-snippets)
6. [☕ Support Me](#support-me)

## <a name="introduction">💬 Introduction</a>

Welcome to the Dashboard UI Design repository! This project is a comprehensive guide to building a clean, user-friendly, and fully responsive dashboard interface. Whether you're new to UI/UX design or an experienced developer looking to enhance your skills, this repository provides essential resources to help you create an efficient and visually organized dashboard experience. Explore best practices for crafting intuitive layouts, managing data visualization, and ensuring seamless user interaction.

## <a name="tools">🛠️ Tools</a>

-   [React JS](https://react.dev)
-   [TailwindCSS](https://tailwindcss.com/)
-   [Lucide Icons](https://lucide.dev/)
-   [React Router](https://reactrouter.com/en/main)
-   [Recharts](https://recharts.org/en-US/)

## <a name="features">✨ Features</a>

-   **Responsive Design:** Ensures your portfolio looks great on desktops, tablets, and mobile devices.
-   **Clean and Modern Layout:** A professional design that highlights your projects, skills, and experience.

## <a name="getting-started">🚀 Getting Started</a>

To get started follow these steps:

#### Cloning the Repository

Using CLI

```bash
git clone https://github.com/xdcode2/dashboard-ui-design.git
```

**\*\*_Ensure you have installed [Git](https://git-scm.com) on your machine._**

or using GitHub:

-   Go to the project [repository](https://github.com/xdcode2/dashboard-ui-design) on my GitHub page
-   Click on the green button on the top 👆
-   Click Download ZIP

#### Installation

Install the project dependencies using npm:

```bash
npm install
```

**\*\*_Ensure you have installed [NodeJS](https://nodejs.org/en) on your machine._**

#### Running the Project

```bash
npm run dev
```

**\*\*_This project uses [Vite](https://vitejs.dev)._**

## <a name="support-me">☕ Support Me</a>

[![ko-fi](https://img.shields.io/static/v1?message=Support%20me%20on%20ko-fi&logo=kofi&label=&color=ff5e5b&logoColor=white&labelColor=&style=for-the-badge)](https://ko-fi.com/J3J1NMYT7)

[![youtube](https://img.shields.io/static/v1?message=Subscribe&logo=youtube&label=&color=FF0000&logoColor=white&labelColor=&style=for-the-badge)](https://www.youtube.com/@_xdcode_ "XD Code")

## 🖥️ Run this project as an Electron desktop app (with local data)

A lightweight Electron shell is included in `Frontend/electron`.

### 1) Install dependencies

```bash
npm install
```

### 2) Start desktop dev mode

```bash
npm run electron:dev
```

This starts Vite and opens Electron with your React app.

### 3) Build desktop binaries

```bash
npm run electron:build
```

### Local data access from the renderer

Use `src/lib/desktopStore.js` in your React components. It automatically:

- Uses Electron IPC + `electron-store` in desktop mode.
- Falls back to browser `localStorage` when running in web mode.

Example:

```js
import { desktopStore } from './src/lib/desktopStore';

await desktopStore.addRecord({ name: 'Laptop', owner: 'IT' });
const all = await desktopStore.getAllRecords();
```
