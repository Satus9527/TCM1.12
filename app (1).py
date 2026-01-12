import gradio as gr
import json
import time
import torch
from typing import Dict, Any, List, Optional
from transformers import AutoTokenizer, AutoModelForCausalLM

print("🚀 仲景中医AI咨询系统启动中...")

class IntelligentZhongJingSystem:
    def __init__(self):
        print("✅ 正在加载中医专用AI模型...")
        
        # 使用0.6B中医专用模型
        try:
            self.model_name = "DigitalIntelligenceCenter-of-ICMM/Baize-Traditional-Chinese-Medicine-Large-Language-Model"
            print(f"🔄 加载中医模型: {self.model_name}")
            
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name, 
                trust_remote_code=True
            )
            
            # 优化：使用CPU优化的加载设置
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float32,  # CPU上使用float32通常更快
                device_map="cpu",  # 明确指定CPU
                low_cpu_mem_usage=True,  # 减少CPU内存使用
                trust_remote_code=True
            )
            
            self.device = torch.device("cpu")
            self.model = self.model.to(self.device)
            print(f"✅ 中医AI模型加载成功! 设备: {self.device}")
            self.ai_enabled = True
            
        except Exception as e:
            print(f"❌ 中医AI模型加载失败: {e}")
            print("⚠️ 使用智能知识库模式")
            self.model = None
            self.tokenizer = None
            self.ai_enabled = False
            self.device = "CPU"
        
        # 初始化中医知识库
        self._init_tcm_knowledge_base()
        
        # 添加响应缓存
        self.response_cache = {}
        self.cache_size = 200
        self.cache_hits = 0
        self.cache_misses = 0
        
        status = "中医AI大模型模式" if self.ai_enabled else "智能知识库模式"
        print(f"🎉 系统初始化完成！运行模式: {status}")

    def _init_tcm_knowledge_base(self):
        """初始化中医知识库"""
        print("📚 正在加载中医知识库...")
        
        # 初始化数据结构
        self.common_formulas = {}
        self.formula_data = []
        self.herbs_data = []
        self.relationship_data = {"relationships": []}
        self.eighteen_contrary = []
        self.nineteen_fear = []
        
        try:
            # 1. 加载方剂数据集
            with open('药方数据集.json', 'r', encoding='utf-8') as f:
                self.formula_data = json.load(f)
                for formula in self.formula_data:
                    herbs = [item["药材"] for item in formula["组成"]]
                    dosage = " ".join([f"{item['药材']}{item['剂量']}" for item in formula["组成"]])
                    self.common_formulas[formula["方名"]] = {
                        "herbs": herbs,
                        "dosage": dosage,
                        "function": formula["功效"],
                        "indication": formula["主治"],
                        "source": formula["出处"],
                        "characteristics": formula.get("配伍特点", ""),
                        "modern_application": formula.get("现代应用", "")
                    }
            print(f"✅ 加载了 {len(self.formula_data)} 个方剂")
            
            # 2. 加载十八反十九畏数据
            with open('18反19畏.json', 'r', encoding='utf-8') as f:
                contraindication_data = json.load(f)
                for item in contraindication_data["data"]:
                    if item["type"] == "十八反":
                        self.eighteen_contrary.append((item["herb_a"], item["herb_b"]))
                    elif item["type"] == "十九畏":
                        self.nineteen_fear.append((item["herb_a"], item["herb_b"]))
            print(f"✅ 加载了 {len(self.eighteen_contrary)} 个十八反和 {len(self.nineteen_fear)} 个十九畏")
            
            # 3. 加载四相关系数据
            with open('四相.json', 'r', encoding='utf-8') as f:
                self.relationship_data = json.load(f)
            print(f"✅ 加载了 {len(self.relationship_data['relationships'])} 个配伍关系")
            
            # 4. 加载中药功效数据
            with open('herbs.json', 'r', encoding='utf-8') as f:
                self.herbs_data = json.load(f)
            print(f"✅ 加载了 {len(self.herbs_data)} 种中药信息")
            
        except Exception as e:
            print(f"❌ 加载知识库数据失败: {e}")
            self._init_basic_fallback()
        
        print("🎉 中医知识库加载完成！")

    def _init_basic_fallback(self):
        """初始化基础数据（备用）"""
        print("⚠️ 使用备用基础数据...")
        
        # 基础方剂
        self.common_formulas = {
            "麻黄汤": {
                "herbs": ["麻黄", "桂枝", "杏仁", "甘草"], 
                "dosage": "麻黄9g 桂枝6g 杏仁9g 甘草3g", 
                "function": "发汗解表，宣肺平喘",
                "indication": "外感风寒表实证。恶寒发热，头身疼痛，无汗而喘，舌苔薄白，脉浮紧。",
                "source": "《伤寒论》"
            },
            "桂枝汤": {
                "herbs": ["桂枝", "白芍", "生姜", "大枣", "甘草"], 
                "dosage": "桂枝9g 白芍9g 生姜9g 大枣3枚 甘草6g", 
                "function": "解肌发表，调和营卫",
                "indication": "外感风寒表虚证。头痛发热，汗出恶风，鼻鸣干呕，苔白不渴，脉浮缓或浮弱。",
                "source": "《伤寒论》"
            },
            "银翘散": {
                "herbs": ["金银花", "连翘", "薄荷", "荆芥", "淡豆豉", "牛蒡子", "桔梗", "竹叶", "芦根", "甘草"],
                "dosage": "金银花30g 连翘30g 薄荷18g 荆芥12g 淡豆豉15g 牛蒡子18g 桔梗18g 竹叶12g 芦根18g 甘草15g",
                "function": "辛凉透表，清热解毒", 
                "indication": "温病初起。发热，微恶风寒，无汗或有汗不畅，头痛口渴，咳嗽咽痛，舌尖红，脉浮数。",
                "source": "《温病条辨》"
            }
        }
        
        # 基础配伍禁忌
        self.eighteen_contrary = [
            ("甘草", "甘遂"), ("甘草", "大戟"), ("甘草", "芫花"), ("甘草", "海藻"),
            ("乌头", "半夏"), ("乌头", "瓜蒌"), ("乌头", "贝母"), ("乌头", "白蔹"), ("乌头", "白及"),
            ("藜芦", "人参"), ("藜芦", "沙参"), ("藜芦", "丹参"), ("藜芦", "玄参"), ("藜芦", "细辛"), ("藜芦", "芍药")
        ]
        
        self.nineteen_fear = [
            ("硫黄", "朴硝"), ("水银", "砒霜"), ("狼毒", "密陀僧"), ("巴豆", "牵牛"),
            ("丁香", "郁金"), ("牙硝", "三棱"), ("川乌", "犀角"), ("人参", "五灵脂"), ("官桂", "石脂")
        ]

    def find_herb_info(self, herb_name: str) -> Optional[Dict[str, Any]]:
        """查找中药信息 - 从知识库"""
        for herb in self.herbs_data:
            if herb["name"] == herb_name:
                return {
                    "name": herb["name"],
                    "category": herb["category"],
                    "property": herb["property"],
                    "flavor": herb["flavor"],
                    "meridian": herb["meridian"],
                    "efficacy": herb["efficacy"],
                    "dosage": herb["dosage"],
                    "contraindications": herb.get("contraindications", []),
                    "usage_notes": herb.get("usage_notes", "")
                }
        return None

    def find_formula_info(self, formula_name: str) -> Optional[Dict[str, Any]]:
        """查找方剂信息 - 从知识库"""
        return self.common_formulas.get(formula_name)

    def check_contraindications(self, herbs: List[str]) -> Dict[str, Any]:
        """检查十八反十九畏"""
        warnings = []
        
        # 检查十八反
        for herb1, herb2 in self.eighteen_contrary:
            if herb1 in herbs and herb2 in herbs:
                warnings.append(f"🚨 **十八反警告**: {herb1} 与 {herb2} 相反，不宜同用！")
        
        # 检查十九畏
        for herb1, herb2 in self.nineteen_fear:
            if herb1 in herbs and herb2 in herbs:
                warnings.append(f"⚠️ **十九畏警告**: {herb1} 与 {herb2} 相畏，不宜同用！")
        
        return {
            "has_warnings": len(warnings) > 0,
            "warnings": warnings
        }

    def _extract_herbs_from_text(self, text: str) -> List[str]:
        """从文本中提取药材名称"""
        found_herbs = []
        
        # 从herbs数据中获取所有药材名称
        all_herbs = [herb["name"] for herb in self.herbs_data]
        
        for herb in all_herbs:
            if herb in text:
                found_herbs.append(herb)
        
        return found_herbs

    def _get_knowledge_base_response(self, question: str) -> str:
        """基于知识库的回答 - 智能路由"""
        
        question_lower = question.lower().strip()
        
        # 1. 定义性问题处理（如"什么是风寒感冒？"）
        if "什么是" in question_lower or "什么是" in question or "定义" in question_lower:
            return self._handle_definition_query(question)
        
        # 2. 药材功效查询
        if any(keyword in question_lower for keyword in ["功效", "性味", "归经", "用量", "禁忌", "作用", "什么药"]):
            for herb in self.herbs_data:
                if herb["name"] in question:
                    return self._format_herb_response(herb)
        
        # 3. 方剂组成查询
        if any(keyword in question_lower for keyword in ["成分", "组成", "方剂", "汤", "散", "丸", "什么方"]):
            for formula_name in self.common_formulas.keys():
                if formula_name in question:
                    formula_info = self.common_formulas[formula_name]
                    return self._format_formula_response(formula_name, formula_info)
        
        # 4. 配伍禁忌查询
        if any(keyword in question_lower for keyword in ["可以一起用吗", "能配伍吗", "安全吗", "禁忌", "十八反", "十九畏", "能不能", "同用"]):
            # 提取药材
            herbs = self._extract_herbs_from_text(question)
            if len(herbs) >= 2:
                return self._format_contraindication_response(herbs)
            # 特殊处理常见问题
            elif "甘草" in question and "甘遂" in question:
                return self._format_contraindication_response(["甘草", "甘遂"])
            elif "丁香" in question and "郁金" in question:
                return self._format_contraindication_response(["丁香", "郁金"])
            elif "人参" in question and "五灵脂" in question:
                return self._format_contraindication_response(["人参", "五灵脂"])
        
        # 5. 症状咨询 - 放宽条件
        symptom_keywords = ["症状", "头痛", "发热", "咳嗽", "恶寒", "怎么治", "怎么办", "怎么调理", "不舒服", 
                          "难受", "痛", "胀", "酸", "麻", "痒", "晕", "吐", "泻", "便秘", "失眠", "多梦"]
        if any(keyword in question_lower for keyword in symptom_keywords):
            # 先尝试知识库的症状分析
            kb_symptom_response = self._handle_symptom_consultation_kb(question)
            if kb_symptom_response and len(kb_symptom_response) > 150:  # 知识库有详细回答
                return kb_symptom_response
            # 知识库回答不足，返回标记让AI处理
            return None
        
        # 6. 配伍分析
        if any(keyword in question_lower for keyword in ["配伍", "分析", "药材", "中药", "组成", "方子"]):
            herbs = self._extract_herbs_from_text(question)
            if herbs:
                return self._handle_compatibility_analysis(question)
        
        # 7. 通用咨询 - 知识库无法处理
        return None

    def _handle_definition_query(self, question: str) -> str:
        """处理定义性问题"""
        question_lower = question.lower()
        
        # 从知识库中提取定义
        if "风寒感冒" in question:
            return """🌬️ **风寒感冒**

**定义**：
风寒感冒是感受风寒邪气引起的外感疾病，多见于冬春季节。

**主要症状**：
- 恶寒重，发热轻
- 无汗，头痛身痛
- 鼻塞流清涕
- 咳嗽痰稀白
- 口不渴或喜热饮
- 舌苔薄白，脉浮紧

**治疗原则**：
辛温解表，宣肺散寒

**常用方剂**：
1. **麻黄汤**（恶寒无汗，头身疼痛明显）
2. **桂枝汤**（发热汗出，恶风脉缓）

**预防建议**：
- 注意保暖，避免受凉
- 适当锻炼，增强体质
- 饮食宜温热，忌生冷"""
        
        elif "风热感冒" in question:
            return """🔥 **风热感冒**

**定义**：
风热感冒是感受风热邪气引起的外感疾病，多见于春夏季节。

**主要症状**：
- 发热重，恶寒轻
- 有汗或汗出不畅
- 头痛，咽喉红肿疼痛
- 咳嗽，痰粘或黄
- 口渴喜饮
- 舌边尖红，苔薄黄，脉浮数

**治疗原则**：
辛凉解表，清热解毒

**常用方剂**：
1. **银翘散**（风热犯表证）
2. **桑菊饮**（风热咳嗽明显）

**预防建议**：
- 避免过热环境
- 多饮水，保持室内通风
- 饮食清淡，忌辛辣油腻"""
        
        elif "气虚" in question:
            return """💨 **气虚**

**定义**：
气虚是指元气不足，脏腑功能减退的病理状态。

**主要症状**：
- 神疲乏力，少气懒言
- 头晕目眩，自汗
- 活动后诸症加剧
- 舌淡苔白，脉虚无力

**治疗原则**：
补气益气

**常用方剂**：
1. **四君子汤**（脾胃气虚证）
2. **补中益气汤**（中气下陷证）

**调理建议**：
- 适当休息，避免过劳
- 饮食宜补气食物（如山药、大枣）
- 适当运动，如太极拳、散步"""
        
        elif "阴虚" in question:
            return """💧 **阴虚**

**定义**：
阴虚是指阴液不足，不能制阳，导致虚热内生的病理状态。

**主要症状**：
- 五心烦热，午后潮热
- 盗汗，颧红
- 口燥咽干，大便干结
- 舌红少苔，脉细数

**治疗原则**：
滋阴清热

**常用方剂**：
1. **六味地黄丸**（肾阴虚证）
2. **沙参麦冬汤**（肺阴虚证）

**调理建议**：
- 避免熬夜，保证充足睡眠
- 饮食宜滋阴食物（如银耳、百合）
- 忌辛辣燥热之品"""
        
        elif "肝郁" in question:
            return """🌪️ **肝郁**

**定义**：
肝郁是指肝失疏泄，气机郁滞的病理状态。

**主要症状**：
- 情绪抑郁，烦躁易怒
- 胸胁胀痛，善太息
- 月经不调，乳房胀痛
- 脘腹胀满，嗳气
- 舌淡红，苔薄白，脉弦

**治疗原则**：
疏肝解郁，理气和中

**常用方剂**：
1. **逍遥散**（肝郁血虚脾弱证）
2. **柴胡疏肝散**（肝气郁结证）

**调理建议**：
- 保持心情舒畅，避免情绪波动
- 适当运动，如散步、瑜伽
- 饮食宜清淡，忌油腻"""
        
        # 默认回答
        return None

    def _format_herb_response(self, herb: Dict[str, Any]) -> str:
        """格式化药材回答"""
        response = f"""🌿 **{herb['name']}**

**性味归经**
- 性味：{herb['property']}，{''.join(herb['flavor'])}
- 归经：{''.join(herb['meridian'])}

**功效主治**
{herb['efficacy']}

**用法用量**
{herb['dosage'][0]}-{herb['dosage'][1]}g"""

        if herb.get('usage_notes'):
            response += f"\n**使用注意**：{herb['usage_notes']}"
        
        if herb.get('contraindications'):
            contraindications = "、".join(herb['contraindications'])
            response += f"\n**禁忌**：{contraindications}"
        
        response += "\n\n💡 **提示**：请在专业医师指导下使用。"
        return response

    def _format_formula_response(self, formula_name: str, formula_info: Dict[str, Any]) -> str:
        """格式化方剂回答"""
        response = f"""💊 **{formula_name}**

**出处**：{formula_info['source']}

**组成**：
{formula_info['dosage']}

**功效**：
{formula_info['function']}

**主治**：
{formula_info['indication']}"""

        if formula_info.get('characteristics'):
            response += f"\n\n**配伍特点**：{formula_info['characteristics']}"
        
        if formula_info.get('modern_application'):
            response += f"\n\n**现代应用**：{formula_info['modern_application']}"
        
        response += "\n\n💡 **提示**：请在专业中医师指导下使用。"
        return response

    def _format_contraindication_response(self, herbs: List[str]) -> str:
        """格式化配伍禁忌回答"""
        herb_list = "、".join(herbs)
        contra_result = self.check_contraindications(herbs)
        
        if contra_result["has_warnings"]:
            warnings_text = "\n".join(contra_result["warnings"])
            return f"""🔬 **配伍禁忌分析**

**分析药材**：{herb_list}

{warnings_text}

🚫 **结论**：**不建议配伍使用！**

💡 **安全建议**：
1. ❌ 绝对禁止在同一方剂中使用
2. ⚠️ 避免同时服用含有这些药材的中成药
3. 📝 处方时必须特别注意
4. 🩺 必须在专业医师指导下使用"""
        else:
            return f"""🔬 **配伍分析**

**分析药材**：{herb_list}

✅ **安全性评估**：未发现明确的配伍禁忌。

💡 **使用建议**：
1. 可以在专业医师指导下配伍使用
2. 根据具体证候确定剂量比例
3. 注意观察服药后的反应
4. 如有不适及时停用"""

    def _handle_symptom_consultation_kb(self, question: str) -> Optional[str]:
        """知识库症状咨询处理 - 返回None表示需要AI处理"""
        # 症状关键词匹配 - 更详细的匹配
        symptom_patterns = {
            "风寒感冒": {
                "keywords": ["恶寒", "怕冷", "畏寒", "发冷", "无汗", "不出汗", "清涕", "流清涕", "身痛", "全身痛", "头痛", "头项强痛", "鼻塞", "舌苔薄白", "脉浮紧"],
                "formula": "麻黄汤",
                "reason": "风寒表实证"
            },
            "风热感冒": {
                "keywords": ["发热", "发烧", "体温高", "咽痛", "喉咙痛", "咽喉痛", "黄痰", "痰黄", "浓痰", "口渴", "口干", "舌红", "咽干", "黄涕", "鼻塞黄涕", "舌尖红"],
                "formula": "银翘散",
                "reason": "风热犯表证"
            },
            "气虚证": {
                "keywords": ["乏力", "没力气", "疲劳", "疲倦", "气短", "懒言", "食欲不振", "不想吃饭", "食少", "腹胀", "便溏", "大便稀", "面色萎白", "面色萎黄", "舌淡苔白", "脉虚弱"],
                "formula": "四君子汤",
                "reason": "脾胃气虚证"
            },
            "肝郁证": {
                "keywords": ["胁痛", "两胁痛", "胸闷", "烦躁", "易怒", "情绪不好", "心情抑郁", "月经不调", "乳房胀痛", "头痛目眩", "口苦", "咽干", "脉弦"],
                "formula": "逍遥散",
                "reason": "肝郁血虚脾弱证"
            },
            "阴虚证": {
                "keywords": ["盗汗", "夜间出汗", "五心烦热", "手足心热", "口干", "咽燥", "舌红少苔", "失眠", "心悸", "腰膝酸软", "头晕耳鸣", "午后潮热", "脉细数"],
                "formula": "六味地黄丸",
                "reason": "肾阴虚证"
            }
        }
        
        # 检测匹配的症状类型
        detected_patterns = {}
        question_lower = question.lower()
        
        for pattern_name, pattern_info in symptom_patterns.items():
            matched_keywords = []
            for keyword in pattern_info["keywords"]:
                if keyword in question_lower:
                    matched_keywords.append(keyword)
            
            if matched_keywords:
                detected_patterns[pattern_name] = {
                    "matched_keywords": matched_keywords,
                    "formula": pattern_info["formula"],
                    "reason": pattern_info["reason"]
                }
        
        # 如果检测到症状模式
        if detected_patterns:
            # 选择匹配最多的模式
            best_pattern_name = max(detected_patterns.keys(), 
                                   key=lambda x: len(detected_patterns[x]["matched_keywords"]))
            best_pattern = detected_patterns[best_pattern_name]
            
            # 获取方剂信息
            formula_name = best_pattern["formula"]
            formula_info = self.common_formulas.get(formula_name)
            
            if formula_info:
                response = f"""🎯 **症状分析结果**

📋 **症状识别**
{self._format_symptom_analysis(detected_patterns)}

🩺 **辨证结论**
{best_pattern['reason']}

💊 **推荐方剂**
**{formula_name}** ({formula_info['source']})

🌿 **方剂组成**
{formula_info['dosage']}

✨ **主要功效**
{formula_info['function']}

🎯 **适应症候**
{formula_info['indication']}"""
                
                if formula_info.get('characteristics'):
                    response += f"\n\n📝 **配伍特点**：{formula_info['characteristics']}"
                
                if formula_info.get('modern_application'):
                    response += f"\n\n🏥 **现代应用**：{formula_info['modern_application']}"
                
                response += "\n\n⚠️ **重要提示**：以上仅为初步分析，不能替代专业医疗诊断，请咨询执业中医师。"
                return response
        
        # 知识库无法处理，返回None让AI处理
        return None

    def _format_symptom_analysis(self, detected_patterns: Dict) -> str:
        """格式化症状分析"""
        result = []
        for pattern_name, pattern_info in detected_patterns.items():
            keywords = pattern_info["matched_keywords"][:3]  # 只显示前3个关键词
            result.append(f"  • **{pattern_name}**：{', '.join(keywords)}")
        return "\n".join(result) if result else "  症状识别不够明确"

    def _handle_compatibility_analysis(self, question: str) -> str:
        """处理配伍分析"""
        herbs = self._extract_herbs_from_text(question)
        
        if not herbs:
            return """🔬 **配伍分析提示**

请提供具体的药材信息进行配伍分析。

📝 **格式示例**：
"麻黄10克，桂枝10克，杏仁10克，甘草5克"
"金银花15克，连翘15克，薄荷6克" """

        # 检查禁忌
        contra_result = self.check_contraindications(herbs)
        
        # 查找药材信息
        herb_info_list = []
        for herb in herbs[:6]:  # 最多显示6种药材
            info = self.find_herb_info(herb)
            if info:
                herb_info_list.append(info)
        
        # 查找四相关系
        relationships = []
        for rel in self.relationship_data["relationships"]:
            if rel["herb_a"] in herbs and rel["herb_b"] in herbs:
                relationships.append(rel)
        
        # 构建回答
        herb_list = "、".join(herbs)
        response = f"""🔬 **中药配伍分析报告**

**分析对象**：{herb_list}

🌿 **配伍概述**
此配伍体现了中医"君臣佐使"的组方原则，不同药材的性味归经相互配合，产生协同作用。"""
        
        # 添加禁忌警告
        if contra_result["has_warnings"]:
            warning_text = "\n".join(contra_result["warnings"])
            response = f"{warning_text}\n\n{response}"
        
        # 添加药材详情
        if herb_info_list:
            response += "\n\n📋 **药材详情**"
            for herb_info in herb_info_list:
                response += f"\n\n**{herb_info['name']}**"
                response += f"\n- 分类：{herb_info['category']}"
                response += f"\n- 性味：{herb_info['property']}，{''.join(herb_info['flavor'])}"
                response += f"\n- 归经：{''.join(herb_info['meridian'])}"
                response += f"\n- 功效：{herb_info['efficacy']}"
        
        # 添加四相分析
        if relationships:
            response += "\n\n🔄 **配伍关系分析**"
            for rel in relationships[:3]:  # 最多显示3个关系
                response += f"\n\n**{rel['herb_a']} + {rel['herb_b']}** ({rel['type']})"
                response += f"\n- 描述：{rel['description']}"
                response += f"\n- 效果：{rel['effect']}"
        
        response += "\n\n💡 **使用建议**"
        response += "\n- 请在专业中医师指导下使用"
        response += "\n- 根据具体证候调整剂量"
        response += "\n- 注意药材的煎煮方法"
        response += "\n- 观察服药后的身体反应"
        
        return response

    def generate_ai_response(self, question: str) -> str:
        """智能响应生成 - 知识库优先，AI补充"""
        
        # 检查缓存
        cache_key = hash(question)
        if cache_key in self.response_cache:
            self.cache_hits += 1
            print(f"📦 缓存命中 ({self.cache_hits}): {question[:30]}...")
            return self.response_cache[cache_key]
        
        self.cache_misses += 1
        
        # Step 1: 先尝试知识库回答
        kb_response = self._get_knowledge_base_response(question)
        
        # 如果知识库能给出详细回答，直接返回
        if kb_response is not None:
            # 存入缓存
            if len(self.response_cache) >= self.cache_size:
                # 删除最早的一个
                first_key = next(iter(self.response_cache))
                del self.response_cache[first_key]
            
            self.response_cache[cache_key] = kb_response
            return kb_response
        
        # Step 2: 知识库无法回答，使用AI（如果可用）
        if self.ai_enabled:
            print(f"🤖 知识库无法回答，使用AI生成: {question[:50]}...")
            ai_response = self._generate_ai_response(question)
            
            # 存入缓存
            if len(self.response_cache) >= self.cache_size:
                # 删除最早的一个
                first_key = next(iter(self.response_cache))
                del self.response_cache[first_key]
            
            self.response_cache[cache_key] = ai_response
            return ai_response
        else:
            # AI不可用，返回通用建议
            return """🧠 **中医智能咨询**

**您的问题**：由于知识库中暂无此问题的详细解答，建议您：

📝 **提供更具体的信息**：
- 详细描述症状表现
- 提供相关药材或方剂名称
- 咨询专业中医师获取权威建议

💡 **中医强调"辨证论治"**，个体差异大，需要全面了解病情才能给出精准建议。"""

    def _generate_ai_response(self, question: str) -> str:
        """AI生成回答 - 优化版本"""
        try:
            # 创建优化提示词
            prompt = f"""你是一位资深中医专家，请基于中医经典理论回答以下问题。
            
问题：{question}

要求：
1. 回答要专业、准确、实用
2. 如果是症状咨询，请进行辨证分析并给出治疗建议
3. 如果是药材或方剂问题，请给出详细说明
4. 回答要完整，不少于100字

回答："""
            
            # 编码输入
            inputs = self.tokenizer(
                prompt, 
                return_tensors="pt", 
                max_length=256,
                truncation=True,
                padding=True
            ).to(self.device)
            
            # 生成回答 - 优化参数
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=300,
                    temperature=0.7,
                    do_sample=True,
                    top_p=0.9,
                    repetition_penalty=1.1,
                    pad_token_id=self.tokenizer.eos_token_id,
                    no_repeat_ngram_size=3,
                    early_stopping=True,
                    num_beams=1,
                    max_time=10.0
                )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # 提取答案部分
            if "回答：" in response:
                response = response.split("回答：")[-1].strip()
            elif "答案：" in response:
                response = response.split("答案：")[-1].strip()
            elif "答：" in response:
                response = response.split("答：")[-1].strip()
            
            # 清理和格式化
            response = response.replace(prompt.split("回答：")[0] if "回答：" in prompt else "", "").strip()
            
            # 如果回答太短，补充建议
            if len(response) < 80:
                response += "\n\n💡 **建议**：如需更详细的个性化建议，请咨询专业中医师进行辨证论治。"
            
            return response
            
        except Exception as e:
            print(f"❌ AI生成失败: {e}")
            return f"""🤖 **AI分析**

很抱歉，AI模型在处理此问题时遇到技术问题。

**您的问题**：{question}

📝 **建议**：
1. 请尝试提供更具体的信息
2. 咨询专业中医师获取权威建议
3. 中医强调"望闻问切"，全面了解病情才能精准辨证"""

# 初始化智能系统
print("🔄 正在初始化中医AI系统...")
system = IntelligentZhongJingSystem()

def api_consult(question: str):
    """统一的API接口"""
    try:
        if not question or not question.strip():
            return {
                "success": False,
                "error": "问题内容不能为空",
                "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            }
        
        print(f"📥 收到咨询请求: {question}")
        start_time = time.time()
        
        # 使用智能系统生成回答
        answer = system.generate_ai_response(question)
        
        processing_time = time.time() - start_time
        
        return {
            "success": True,
            "question": question,
            "answer": answer,
            "processing_time_seconds": round(processing_time, 2),
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            "ai_enabled": system.ai_enabled,
            "cache_hit": system.cache_hits,
            "cache_miss": system.cache_misses
        }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"处理错误: {str(e)}",
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        }

# 创建 Gradio 界面
def create_interface():
    with gr.Blocks(
            title="仲景中医AI咨询系统-智能混合版",
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
        .response-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #28a745;
        }
        .warning-box {
            background: #fff3cd;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #ffc107;
            margin: 10px 0;
        }
        .info-box {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #1890ff;
            margin-bottom: 20px;
        }
        .success-box {
            background: #d1e7dd;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #198754;
            margin: 10px 0;
        }
        .ai-status-enabled {
            background: #d1e7dd;
            color: #0f5132;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: bold;
        }
        .ai-status-disabled {
            background: #f8d7da;
            color: #721c24;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: bold;
        }
        .optimization-info {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 8px;
            border-left: 4px solid #6f42c1;
            margin: 10px 0;
            font-size: 14px;
        }
        .cache-stats {
            background: #e7f3ff;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
            margin: 5px 0;
        }
        .ai-generated {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 8px;
            border-left: 4px solid #ff6b6b;
            margin: 10px 0;
        }
        """
    ) as demo:
        gr.Markdown("""
        <div class="header">
        <h1>🎯 仲景中医AI咨询系统-智能混合版</h1>
        <h3>知识库优先，AI补充的智能中医咨询平台</h3>
        <div class="optimization-info">
        <strong>🚀 智能混合模式已启用</strong><br>
        - 📚 知识库优先（100%准确的结构化数据）<br>
        - 🤖 AI补充（当知识库无法回答时使用）<br>
        - ⚡ 响应速度优化（知识库<0.1秒，AI 5-10秒）<br>
        - 🗃️ 智能缓存机制（200条缓存）<br>
        - 🔍 全功能覆盖：药材、方剂、配伍、症状
        </div>
        <hr>
        </div>
        """)

        with gr.Row():
            with gr.Column(scale=1):
                gr.Markdown("""
                ### 📋 核心功能

                - **🌿 药材查询**：性味归经、功效主治、用法用量
                - **💊 方剂查询**：组成、功效、主治、配伍特点
                - **🔬 配伍分析**：自动检测十八反十九畏
                - **🩺 症状辨证**：智能症状识别与方剂推荐
                - **🔄 四相分析**：药材间配伍关系分析
                - **🚨 安全检测**：实时配伍禁忌警告

                ### 🚀 系统状态
                """)
                
                # AI状态显示
                status_text = "✅ 知识库+AI混合模式" if system.ai_enabled else "📚 纯知识库模式"
                status_class = "ai-status-enabled" if system.ai_enabled else "ai-status-disabled"
                
                gr.Markdown(f"""
                <div class="{status_class}">
                {status_text}
                </div>
                """)
                
                # 缓存统计
                gr.Markdown(f"""
                <div class="cache-stats">
                📊 **缓存统计**
                - 命中: {system.cache_hits}
                - 未命中: {system.cache_misses}
                - 条目: {len(system.response_cache)}/{system.cache_size}
                </div>
                """)
                
                gr.Markdown(f"""
                <div class="success-box">
                🎯 **混合模式优势**
                - ✅ 知识库：100%准确的结构化数据
                - 🤖 AI模型：处理复杂和未知问题
                - ⚡ 性能：知识库<0.1秒，AI补充5-10秒
                - 📚 规模：{len(system.herbs_data)}药材 / {len(system.formula_data)}方剂
                - 🔬 安全：完整的配伍禁忌检测
                </div>
                """)
                
                gr.Markdown("""
                ### 💡 使用技巧
                1. **药材查询**："甘草的功效是什么？"
                2. **方剂查询**："桂枝汤的成分有哪些？"
                3. **配伍检查**："甘草和甘遂可以一起用吗？"
                4. **症状咨询**："头痛发热怎么办？"
                5. **复杂问题**："气虚有哪些症状？如何调理？"

                ### ⚠️ 重要声明
                - 本系统仅供参考，不能替代专业医疗建议
                - 实际用药请咨询执业中医师
                - AI生成内容需要专业判断
                """)

            with gr.Column(scale=2):
                with gr.Tab("💬 智能咨询接口"):
                    gr.Markdown("### 统一智能咨询接口")
                    
                    gr.Markdown(f"""
                    <div class="info-box">
                    💡 <strong>当前模式</strong>: 知识库优先，AI补充
                    <br><small>🎯 <strong>工作流程</strong>: 知识库 → 缓存 → AI模型</small>
                    <br><small>📊 <strong>数据规模</strong>: {len(system.herbs_data)}药材 / {len(system.formula_data)}方剂</small>
                    </div>
                    """)
                    
                    api_input = gr.Textbox(
                        label="咨询问题",
                        placeholder='例如: 甘草的功效是什么？ 或 头痛发热怎么办？ 或 气虚有哪些症状？',
                        lines=4
                    )

                    api_btn = gr.Button("发送智能咨询", variant="primary")
                    api_output = gr.JSON(label="AI响应")

                    api_btn.click(
                        fn=api_consult,
                        inputs=[api_input],
                        outputs=[api_output]
                    )

                with gr.Tab("🌿 药材查询"):
                    gr.Markdown("### 中药信息查询")

                    herb_input = gr.Textbox(
                        label="药材名称",
                        placeholder="请输入药材名称，例如：甘草、人参、桂枝...",
                        lines=2
                    )

                    herb_btn = gr.Button("查询药材信息", variant="primary")
                    herb_output = gr.Textbox(label="药材信息", lines=12)

                    def handle_herb_query(herb_name):
                        if not herb_name.strip():
                            return "请输入药材名称"
                        
                        for herb in system.herbs_data:
                            if herb["name"] == herb_name.strip():
                                return system._format_herb_response(herb)
                        
                        return f"❌ 未找到药材 '{herb_name}' 的信息"

                    herb_btn.click(
                        fn=handle_herb_query,
                        inputs=[herb_input],
                        outputs=[herb_output]
                    )

                with gr.Tab("💊 方剂查询"):
                    gr.Markdown("### 经典方剂查询")

                    formula_input = gr.Dropdown(
                        label="选择方剂",
                        choices=list(system.common_formulas.keys()),
                        value="桂枝汤"
                    )

                    formula_btn = gr.Button("查询方剂信息", variant="primary")
                    formula_output = gr.Textbox(label="方剂信息", lines=12)

                    def handle_formula_query(formula_name):
                        formula_info = system.find_formula_info(formula_name)
                        if formula_info:
                            return system._format_formula_response(formula_name, formula_info)
                        return f"❌ 未找到方剂 '{formula_name}' 的信息"

                    formula_btn.click(
                        fn=handle_formula_query,
                        inputs=[formula_input],
                        outputs=[formula_output]
                    )

                with gr.Tab("🔬 配伍检查"):
                    gr.Markdown("### 中药配伍禁忌检查")

                    compatibility_input = gr.Textbox(
                        label="药材配伍",
                        placeholder="请输入药材名称，用逗号或空格分隔，例如：甘草,甘遂 或 丁香 郁金",
                        lines=2
                    )

                    compatibility_btn = gr.Button("检查配伍禁忌", variant="primary")
                    compatibility_output = gr.Textbox(label="检查结果", lines=10)

                    def handle_compatibility_check(herbs_text):
                        if not herbs_text.strip():
                            return "请输入药材名称"
                        
                        # 提取药材名称
                        herbs = []
                        for herb in system.herbs_data:
                            if herb["name"] in herbs_text:
                                herbs.append(herb["name"])
                        
                        if len(herbs) < 2:
                            return "请至少输入两种药材进行配伍检查"
                        
                        return system._format_contraindication_response(herbs)

                    compatibility_btn.click(
                        fn=handle_compatibility_check,
                        inputs=[compatibility_input],
                        outputs=[compatibility_output]
                    )

        # 系统信息部分
        with gr.Accordion("📊 系统信息", open=False):
            gr.Markdown(f"""
            ### 🖥️ 系统状态
            - **运行模式**: {'✅ 知识库+AI混合模式' if system.ai_enabled else '📚 纯知识库模式'}
            - **AI模型**: {system.model_name if system.ai_enabled else '未加载'}
            - **运行设备**: {system.device}
            - **优化模式**: ✅ 智能混合模式
            - **缓存状态**: ✅ 已启用 ({len(system.response_cache)}/{system.cache_size})
            - **知识库状态**: ✅ 已加载
            
            ### 📚 数据统计
            - **药材数据库**: {len(system.herbs_data)} 种中药信息
            - **方剂数据库**: {len(system.formula_data)} 个经典方剂
            - **配伍关系**: {len(system.relationship_data['relationships'])} 种四相关系
            - **禁忌检测**: {len(system.eighteen_contrary)} 个十八反 + {len(system.nineteen_fear)} 个十九畏
            
            ### ⚡ 性能优化
            - **响应策略**: 知识库优先 → 缓存 → AI补充
            - **知识库响应**: < 0.1秒
            - **AI响应**: 5-10秒（仅当知识库不足时）
            - **缓存机制**: 200条智能缓存
            - **AI生成**: 300 tokens，10秒超时
            
            ### 🎯 核心功能
            - **智能路由**: 自动判断问题类型
            - **知识库匹配**: 100%准确的结构化数据
            - **AI补充**: 处理复杂和未知问题
            - **安全检测**: 实时配伍禁忌检查
            - **专业输出**: 格式化中医专业回答
            """)

    return demo

# 创建并启动应用
demo = create_interface()

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        debug=True
    )