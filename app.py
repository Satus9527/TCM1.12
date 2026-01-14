from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import time
import logging
import os
from datetime import datetime, timedelta

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('tcm_api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 配置参数
class Config:
    GRADIO_API_URL = "https://liiiii2323-zhongjing-ai-api.hf.space/api/predict"
    REQUEST_TIMEOUT = 30
    MAX_RETRIES = 2
    CACHE_EXPIRY = 300  # 5分钟缓存时间

    API_RATE_LIMIT = 30  # 每分钟请求限制

app.config.from_object(Config)

# 简单的内存缓存（生产环境建议使用Redis）
class TCMCache:
    def __init__(self):
        self.cache = {}
        self.stats = {"hits": 0, "misses": 0, "size": 0}
        
    def get(self, key):
        if key in self.cache:
            item = self.cache[key]
            if time.time() - item["timestamp"] < app.config['CACHE_EXPIRY']:
                self.stats["hits"] += 1
                return item["data"]
        self.stats["misses"] += 1
        return None
    
    def set(self, key, data):
        self.cache[key] = {
            "data": data,
            "timestamp": time.time()
        }
        self.stats["size"] = len(self.cache)
        # 清理过期缓存
        if len(self.cache) > 1000:  # 限制最大缓存条目
            self._cleanup()
    
    def _cleanup(self):
        current_time = time.time()
        expired_keys = [
            key for key, item in self.cache.items()
            if current_time - item["timestamp"] > app.config['CACHE_EXPIRY']
        ]
        for key in expired_keys:
            del self.cache[key]
        self.stats["size"] = len(self.cache)

# 初始化缓存
tcm_cache = TCMCache()

class TCMAIClient:
    """中医AI模型客户端"""
    
    def __init__(self):
        self.api_url = app.config['GRADIO_API_URL']
        self.timeout = app.config['REQUEST_TIMEOUT']
        self.max_retries = app.config['MAX_RETRIES']
    
    def ask_ai(self, question, use_cache=True):
        """调用AI模型API"""
        
        # 1. 检查缓存
        if use_cache:
            cache_key = f"question_{hash(question)}"
            cached_response = tcm_cache.get(cache_key)
            if cached_response:
                logger.info(f"缓存命中: {question[:30]}...")
                return cached_response
        
        # 2. 调用Gradio API
        retry_count = 0
        last_exception = None
        
        while retry_count <= self.max_retries:
            try:
                logger.info(f"调用AI模型 (尝试 {retry_count + 1}): {question[:50]}...")
                
                # 准备请求数据
                payload = {"data": [question]}
                headers = {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "User-Agent": "TCM-API-Client/1.0"
                }
                
                start_time = time.time()
                # 发送请求
                response = requests.post(
                    self.api_url,
                    json=payload,
                    headers=headers,
                    timeout=self.timeout
                )
                
                processing_time = time.time() - start_time
                
                # 检查响应状态
                if response.status_code == 200:
                    data = response.json()
                    
                    # 处理Gradio返回的格式
                    if "data" in data and len(data["data"]) > 0:
                        result = data["data"][0]
                        
                        # 构建标准响应
                        ai_response = {
                            "success": True,
                            "question": question,
                            "answer": result.get("answer", ""),
                            "processing_time_seconds": round(processing_time, 2),
                            "timestamp": datetime.utcnow().isoformat() + "Z",
                            "ai_enabled": result.get("ai_enabled", True),
                            "cache_hit": result.get("cache_hit", 0),
                            "cache_miss": result.get("cache_miss", 0),
                            "source": "huggingface_space"
                        }
                        
                        # 缓存结果
                        if use_cache:
                            cache_key = f"question_{hash(question)}"
                            tcm_cache.set(cache_key, ai_response)
                        
                        logger.info(f"AI调用成功: {processing_time:.2f}秒")

                        return ai_response
                    else:
                        raise ValueError("API返回数据格式错误")
                else:
                    raise Exception(f"HTTP {response.status_code}: {response.text}")
            
            except requests.exceptions.Timeout:
                last_exception = "请求超时"
                logger.warning(f"请求超时, 重试 {retry_count + 1}/{self.max_retries}")
                
            except requests.exceptions.ConnectionError:
                last_exception = "连接错误"
                logger.warning(f"连接错误, 重试 {retry_count + 1}/{self.max_retries}")
                
            except Exception as e:
                last_exception = str(e)
                logger.error(f"API调用失败: {e}")
            
            retry_count += 1
            if retry_count <= self.max_retries:
                time.sleep(1)  # 等待1秒后重试
        
        # 所有重试均失败
        error_response = {
            "success": False,
            "question": question,
            "answer": f"AI服务暂时不可用: {last_exception}",
            "processing_time_seconds": 0.0,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "ai_enabled": False,
            "cache_hit": 0,
            "cache_miss": 0,
            "error": last_exception
        }
        
        return error_response

# 初始化AI客户端
ai_client = TCMAIClient()

@app.route('/')
def home():
    """首页/健康检查"""
    return jsonify({
        "service": "仲景中医AI咨询系统后端",
        "version": "2.0.0",
        "status": "running",
        "model_source": "https://huggingface.co/spaces/liiiii2323/zhongjing-ai-api",
        "endpoints": {
            "/api/consult": "POST - 中医咨询接口 - 单个问题",
            "/api/batch_consult": "POST - 批量咨询",
            "/api/health": "GET - 健康检查",
            "/api/stats": "GET - 系统统计",
            "/api/clear_cache": "POST - 清理缓存"
        },
        "documentation": "查看 /api/docs 获取详细API文档",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

@app.route('/api/consult', methods=['POST'])
def consult():
    """中医咨询接口 - 单个问题"""
    start_time = time.time()
    
    try:
        # 1. 解析请求数据
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "请求体必须为JSON格式",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }), 400
        
        question = data.get('question', '').strip()
        if not question:
            return jsonify({
                "success": False,
                "error": "问题内容不能为空",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }), 400
        
        use_cache = data.get('use_cache', True)
        logger.info(f"接收咨询请求: {question[:50]}...")
        
        # 2. 调用AI服务
        response = ai_client.ask_ai(question, use_cache=use_cache)
        
        # 3. 增加总处理时间

        response["total_processing_time_seconds"] = round(time.time() - start_time, 2)
        response["backend_version"] = "2.0.0"
        
        logger.info(f"咨询完成: {response['total_processing_time_seconds']:.2f}秒")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"咨询接口异常: {e}")
        return jsonify({
            "success": False,
            "error": f"服务器内部错误: {str(e)}",
            "answer": "抱歉，服务暂时不可用，请稍后重试。",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "processing_time_seconds": round(time.time() - start_time, 2)
        }), 500

@app.route('/api/batch_consult', methods=['POST'])
def batch_consult():
    """批量咨询接口"""
    start_time = time.time()
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "请求体必须为JSON格式"
            }), 400
        
        questions = data.get('questions', [])
        if not isinstance(questions, list) or len(questions) == 0:
            return jsonify({
                "success": False,
                "error": "questions 必须是非空数组"
            }), 400
        
        # 限制批量请求数量
        max_batch_size = 5
        if len(questions) > max_batch_size:
            return jsonify({
                "success": False,
                "error": f"批量请求最多支持 {max_batch_size} 个问题"
            }), 400
        
        results = []
        for question in questions:
            if isinstance(question, str) and question.strip():
                result = ai_client.ask_ai(question.strip())
                results.append(result)
        
        batch_response = {
            "success": True,
            "total_questions": len(results),
            "results": results,
            "total_processing_time_seconds": round(time.time() - start_time, 2),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "backend_version": "2.0.0"
        }
        
        logger.info(f"批量咨询完成: {len(results)}个问题, 总耗时: {batch_response['total_processing_time_seconds']:.2f}秒")
        
        return jsonify(batch_response)
        
    except Exception as e:
        logger.error(f"批量咨询接口异常: {e}")
        return jsonify({
            "success": False,
            "error": f"服务器内部错误: {str(e)}",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        "status": "ok",
        "service": "仲景中医AI咨询系统后端",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "cache_stats": tcm_cache.stats
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """获取系统统计信息"""
    return jsonify({
        "service": "仲景中医AI咨询系统后端",
        "version": "2.0.0",
        "cache_stats": tcm_cache.stats,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

@app.route('/api/clear_cache', methods=['POST'])
def clear_cache():
    """清理缓存"""
    global tcm_cache
    tcm_cache = TCMCache()
    logger.info("缓存已清理")
    return jsonify({
        "success": True,
        "message": "缓存已成功清理",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
