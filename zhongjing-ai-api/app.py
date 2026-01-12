import gradio as gr
import json
import time
from typing import Dict, Any
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading

print("🚀 仲景中医AI咨询系统启动中...")

# 创建 Flask 应用用于 REST API
flask_app = Flask(__name__)
CORS(flask_app)  # 允许跨域请求

class ZhongJingAISystem:
    def __init__(self):
        print("✅ 咨询系统初始化完成")
        # 这里可以加载您的微调模型
        pass

    def recommend_formula(self, question: str) -> Dict[str, Any]:
        """推荐服务 - 返回符合后端格式的推荐"""
        try:
            # 这里应该调用您的微调模型进行实际推理
            # 目前使用示例逻辑

            if "发热" in question and "恶寒" in question:
                syndrome = "风寒束表证"
                formula_id = "麻黄汤"
            elif "口干" in question and "口苦" in question:
                syndrome = "湿热蕴结证"
                formula_id = "龙胆泻肝汤"
            elif "食欲不振" in question and "乏力" in question:
                syndrome = "脾气虚证"
                formula_id = "四君子汤"
            else:
                syndrome = "气滞血瘀证"
                formula_id = "血府逐瘀汤"

            return {
                "success": True,
                "answer": f"根据您的症状，辨证为：[{syndrome}]。方剂ID：[{formula_id}]。此方剂适合当前症状。",
                "syndrome": syndrome,
                "formula_id": formula_id
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"推荐服务错误: {str(e)}"
            }

    def analyze_compatibility(self, question: str) -> Dict[str, Any]:
        """分析服务 - 返回带JSON标记的分析"""
        try:
            # 这里应该调用您的微调模型进行实际推理
            # 目前使用示例逻辑

            if "麻黄" in question and "桂枝" in question:
                analysis_data = {
                    "overall_properties": {
                        "nature": "温",
                        "flavor": ["辛", "甘"],
                        "meridian": ["肺", "膀胱"]
                    },
                    "functions_analysis": {
                        "解表": 8,
                        "散寒": 7,
                        "宣肺": 6
                    },
                    "suggestions": [
                        "适用于风寒表证",
                        "体虚者慎用",
                        "服药后宜避风寒"
                    ]
                }
            elif "人参" in question and "白术" in question:
                analysis_data = {
                    "overall_properties": {
                        "nature": "温",
                        "flavor": ["甘", "微苦"],
                        "meridian": ["脾", "肺"]
                    },
                    "functions_analysis": {
                        "补气": 9,
                        "健脾": 8,
                        "益肺": 7
                    },
                    "suggestions": [
                        "适用于气虚证",
                        "实证、热证慎用",
                        "不宜与藜芦同用"
                    ]
                }
            else:
                analysis_data = {
                    "overall_properties": {
                        "nature": "平",
                        "flavor": ["甘"],
                        "meridian": ["脾", "胃"]
                    },
                    "functions_analysis": {
                        "调和": 6,
                        "补益": 5
                    },
                    "suggestions": [
                        "请咨询医师具体用法",
                        "根据具体症状调整用量"
                    ]
                }

            return {
                "success": True,
                "answer": f"配伍分析完成。<JSON_START>{json.dumps(analysis_data, ensure_ascii=False)}<JSON_END>"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"分析服务错误: {str(e)}"
            }


# 初始化系统
system = ZhongJingAISystem()


def api_consult(question: str):
    """统一的API接口 - 完全符合后端和前端要求"""
    try:
        if not question or not question.strip():
            return {
                "success": False,
                "error": "问题内容不能为空",
                "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            }

        start_time = time.time()
        
        # 判断请求类型
        if "方剂ID" in question and "辨证为" in question:
            result = system.recommend_formula(question)
        elif "JSON格式" in question or "<JSON_START>" in question or "配伍" in question:
            result = system.analyze_compatibility(question)
        else:
            # 默认处理 - 根据内容自动判断
            if "症状" in question or "辨证" in question or "发热" in question or "头痛" in question:
                result = system.recommend_formula(question)
            else:
                result = system.analyze_compatibility(question)

        processing_time = time.time() - start_time
        
        if result["success"]:
            return {
                "success": True,
                "question": question,
                "answer": result["answer"],
                "processing_time_seconds": round(processing_time, 2),
                "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                "ai_enabled": True,
                "cache_hit": 0,
                "cache_miss": 0
            }
        else:
            return {
                "success": False,
                "error": result.get("error", "处理失败"),
                "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            }

    except Exception as e:
        return {
            "success": False,
            "error": f"服务器内部错误: {str(e)}",
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        }


# ============ Flask REST API 端点 ============

@flask_app.route('/', methods=['GET'])
def index():
    """根路径 - 返回服务信息和API文档"""
    return jsonify({
        "service": "仲景中医AI咨询系统",
        "version": "2.0",
        "status": "running",
        "endpoints": {
            "/": "服务信息（当前页面）",
            "/health": "健康检查",
            "/consult": "统一咨询接口（POST）"
        },
        "usage": {
            "health_check": "GET http://localhost:5000/health",
            "consult": "POST http://localhost:5000/consult",
            "example_request": {
                "url": "POST http://localhost:5000/consult",
                "body": {
                    "question": "我的症状是：发热，恶寒。请辨证并推荐合适的方剂。"
                }
            }
        },
        "web_interface": "http://localhost:7860",
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    }), 200


@flask_app.route('/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        "status": "ok",
        "message": "仲景中医AI咨询系统",
        "version": "2.0",
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        "endpoints": {
            "/health": "健康检查",
            "/consult": "统一咨询接口"
        }
    }), 200


@flask_app.route('/consult', methods=['POST'])
def consult():
    """统一咨询接口 - 符合后端要求"""
    try:
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "请求体不能为空",
                "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            }), 400

        question = data.get('question', '')
        
        if not question or not question.strip():
            return jsonify({
                "success": False,
                "error": "问题内容不能为空",
                "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            }), 400

        # 调用统一的咨询接口
        result = api_consult(question)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"服务器内部错误: {str(e)}",
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        }), 500

# 前端API接口
@flask_app.route('/api/consult', methods=['POST'])
def api_consult_frontend():
    """前端API接口 - 符合前端要求的/api/consult路径"""
    return consult()


# ============ Gradio 界面（用于测试） ============

def create_interface():
    with gr.Blocks(
            title="仲景中医AI咨询系统",
            theme=gr.themes.Soft(),
            css="""
        .custom-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        """
    ) as demo:
        gr.Markdown("""
        <div class="header">
        <h1>🎯 仲景中医AI咨询系统</h1>
        <h3>基于微调AI模型的中医智能咨询平台</h3>
        <hr>
        </div>
        """)

        with gr.Row():
            with gr.Column(scale=1):
                gr.Markdown("""
                ### 📋 功能说明

                - **🩺 症状咨询**: 输入症状，获得辨证和方剂推荐
                - **🔬 配伍分析**: 分析中药配伍的药性和功效  
                - **🔗 API接口**: 提供符合后端要求的标准化API

                ### 📝 使用提示

                推荐使用后端要求的标准化格式提问，以确保最佳效果。

                ### 🎯 格式要求
                - **推荐服务**: `辨证为：[证型]。方剂ID：[方剂名称]。`
                - **分析服务**: `<JSON_START>...<JSON_END>`
                
                ### 🔌 REST API
                - **健康检查**: `GET http://localhost:5000/health`
                - **咨询接口**: `POST http://localhost:5000/consult`
                """)

            with gr.Column(scale=2):
                with gr.Tab("💬 统一咨询接口"):
                    gr.Markdown("### 统一咨询接口（推荐后端使用）")

                    api_input = gr.Textbox(
                        label="咨询问题",
                        placeholder='例如: 我的症状是：发热，恶寒，头痛。舌象是：舌淡红苔薄白。请根据这些信息，辨证并推荐合适的经典方剂（格式：辨证为：[证型]。方剂ID：[uuid]。）。',
                        lines=4
                    )

                    api_btn = gr.Button("发送咨询请求", variant="primary")
                    api_output = gr.JSON(label="API响应")

                    def handle_api_request(question):
                        return api_consult(question)

                    api_btn.click(
                        fn=handle_api_request,
                        inputs=[api_input],
                        outputs=[api_output]
                    )

                with gr.Tab("🩺 症状咨询"):
                    gr.Markdown("### 症状咨询与方剂推荐")

                    symptoms_input = gr.Textbox(
                        label="症状描述",
                        placeholder="请详细描述您的症状，例如：发热，恶寒，头痛，无汗，脉浮紧...",
                        lines=3
                    )

                    tongue_input = gr.Textbox(
                        label="舌象（可选）",
                        placeholder="例如：舌淡红，苔薄白...",
                        lines=2
                    )

                    recommend_btn = gr.Button("开始辨证推荐", variant="primary")
                    recommend_output = gr.Textbox(label="推荐结果", lines=5)

                    def handle_recommend(symptoms, tongue):
                        question = f"我的症状是：{symptoms}"
                        if tongue.strip():
                            question += f"。舌象是：{tongue}"
                        question += "。请根据这些信息，辨证并推荐合适的经典方剂（格式：辨证为：[证型]。方剂ID：[uuid]。）。"

                        result = api_consult(question)
                        return result["answer"] if result["success"] else f"错误: {result['error']}"

                    recommend_btn.click(
                        fn=handle_recommend,
                        inputs=[symptoms_input, tongue_input],
                        outputs=[recommend_output]
                    )

                with gr.Tab("🔬 配伍分析"):
                    gr.Markdown("### 中药配伍分析")

                    herbs_input = gr.Textbox(
                        label="药材配伍",
                        placeholder="请输入药材和用量，例如：麻黄 10g，桂枝 10g，甘草 5g...",
                        lines=3
                    )

                    analyze_btn = gr.Button("开始分析", variant="primary")
                    analyze_output = gr.Textbox(label="分析结果", lines=5)

                    def handle_analyze(herbs):
                        question = f"请分析这个配伍：{herbs}。请提供以下信息的JSON格式（用<JSON_START>...</JSON_END>包裹）：整体药性、功效分析和使用建议。"
                        result = api_consult(question)
                        return result["answer"] if result["success"] else f"错误: {result['error']}"

                    analyze_btn.click(
                        fn=handle_analyze,
                        inputs=[herbs_input],
                        outputs=[analyze_output]
                    )

        # API 文档部分
        with gr.Accordion("📚 API 文档", open=False):
            gr.Markdown("""
            ### REST API 使用说明

            **基础URL**: `http://localhost:5000`

            **健康检查**: 
            ```bash
            curl http://localhost:5000/health
            ```

            **咨询接口**: 
            ```bash
            curl -X POST http://localhost:5000/consult \\
              -H "Content-Type: application/json" \\
              -d '{"question": "我的症状是：发热，恶寒。请辨证并推荐合适的方剂。"}'
            ```

            **响应格式**:
            ```json
            {
              "success": true,
              "question": "原问题",
              "answer": "包含标记的回答",
              "processing_time_seconds": 1.5,
              "timestamp": "2025-11-02T12:00:00Z"
            }
            ```

            ### 🎯 格式规范

            严格按照后端要求实现：
            - **推荐服务**: 必须包含 `辨证为：[证型]。方剂ID：[方剂名称]。`
            - **分析服务**: 必须包含 `<JSON_START>...<JSON_END>`
            """)

    return demo


# 创建 Gradio 界面
demo = create_interface()


def run_flask():
    """在单独线程中运行 Flask 服务器"""
    flask_app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)


def run_gradio():
    """运行 Gradio 界面"""
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        debug=True
    )


if __name__ == "__main__":
    # 在后台线程中启动 Flask API 服务器
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    print("✅ Flask REST API 服务器已启动: http://localhost:5000")
    print("   - 健康检查: GET http://localhost:5000/health")
    print("   - 咨询接口: POST http://localhost:5000/consult")
    print("")
    
    # 在前台运行 Gradio 界面
    print("✅ Gradio 界面启动中: http://localhost:7860")
    run_gradio()