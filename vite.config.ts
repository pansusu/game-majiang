import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'


// https://vitejs.dev/config/
export default defineConfig(configEnv => {
  console.log(configEnv.mode);
  const viteEnv = loadEnv(configEnv.mode, process.cwd())
  console.log(viteEnv);

  return {
    server: {
      host: true,
      proxy: {
        '/socket.io': {
          target: 'http://localhost:3008/'
        },
      }
    },
    viteEnv,
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        '@': '/src',
      }
    },
  }

})

