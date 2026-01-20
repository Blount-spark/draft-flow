<template>
  <div id="app">
    <el-container>
      <el-header class="app-header">
        <div class="header-content">
          <div class="header-left">
            <router-link to="/" class="home-link">
              <el-button 
                class="menu-toggle"
                circle
              >
                <el-icon><HomeFilled /></el-icon>
              </el-button>
            </router-link>
            <h1>图文草稿批量生成器</h1>
          </div>
          <div class="header-info">
            <router-link to="/templates">
              <el-button type="warning" size="small">
                <el-icon><star /></el-icon>
                模板库
              </el-button>
            </router-link>
          </div>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { Star, HomeFilled } from '@element-plus/icons-vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  height: 100vh;
  overflow: hidden;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 60px;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.home-link {
  text-decoration: none;
}

.menu-toggle {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  transition: all 0.3s;
}

.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-content h1 {
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-info a {
  text-decoration: none;
}

.header-info .el-button {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.header-info .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  padding: 0;
  overflow: hidden;
  height: calc(100vh - 60px);
}
</style>
