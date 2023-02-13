import { createApp } from 'vue'
import App from './App.vue'
import { setupRouter } from './router';
import SocketIO from './infra/io'
import './style.css'
import naive from 'naive-ui'

const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

async function setupApp() {
    const app = createApp(App);
    app.use(SocketIO, {
        connection: 'http://localhost',
    });

    await setupRouter(app);

    app.use(naive)
    app.mount('#app');
}

setupApp();