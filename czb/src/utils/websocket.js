class WebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
    }

    async connect() {
        try {
            // 获取ticket
            const response = await this.$api.get('/auth/ws-ticket');
            const ticket = response.data.ticket;

            const wsUrl = `${import.meta.env.VUE_APP_WS_URL}?ticket=${ticket}`;
            this.socket = new WebSocket(wsUrl);

            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.handleReconnection();
        }
    }

    setupEventHandlers() {
        this.socket.onopen = () => {
            console.log('WebSocket连接已建立');
            this.reconnectAttempts = 0;
        };

        this.socket.onmessage = (event) => {
            this.handleMessage(JSON.parse(event.data));
        };

        this.socket.onclose = () => {
            console.log('WebSocket连接已关闭');
            this.handleReconnection();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket错误:', error);
        };
    }

    handleMessage(message) {
        const { type, payload } = message;

        switch (type) {
            case 'ANALYSIS_UPDATE':
                this.$store.commit('UPDATE_ANALYSIS', payload);
                break;
            case 'SAFETY_WARNING':
                this.$store.commit('UPDATE_SAFETY_WARNING', payload);
                break;
            case 'AI_ANALYSIS_ERROR':
                this.$notify.error({
                    title: 'AI分析错误',
                    message: payload.message
                });
                break;
            default:
                console.warn('未知消息类型:', type);
        }
    }

    sendMessage(type, payload) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type, payload }));
        }
    }

    handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`尝试重新连接... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connect();
            }, this.reconnectInterval);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

export default new WebSocketService();