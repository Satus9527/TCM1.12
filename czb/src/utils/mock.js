// 临时mock数据
export const mockData = {
    medicines: [
        {
            id: 1,
            name: '人参',
            latinName: 'Panax ginseng C. A. Mey.',
            category: 'tonifying', // 改为英文标识，便于前端分类
            property: '甘、微苦，微温',
            meridian: '脾、肺、心、肾经',
            efficacy: '大补元气，复脉固脱，补脾益肺，生津养血，安神益智',
            toxicity: '无毒',
            suggestedDosage: '3-9',
            maxDosage: '15',
            dosage: 6, // 默认剂量
            favorite: false,
            // 新增字段适配前端
            flavor: ['甘', '微苦'],
            usage_notes: '挽救虚脱可用15-30g；研末吞服，每次1-2g',
            contraindications: ['实证', '热证', '正气不虚者', '不宜与藜芦、五灵脂同用'],
            modernResearch: '增强免疫功能，抗疲劳，改善心脑血管功能'
        },
        {
            id: 2,
            name: '黄芪',
            latinName: 'Astragalus membranaceus (Fisch.) Bge.',
            category: 'tonifying',
            property: '甘，微温',
            meridian: '脾、肺经',
            efficacy: '补气升阳，固表止汗，利水消肿，行滞通痹，托毒排脓，生肌',
            toxicity: '无毒',
            suggestedDosage: '9-30',
            maxDosage: '60',
            dosage: 15,
            favorite: false,
            flavor: ['甘'],
            contraindications: ['表实邪盛', '气滞湿阻', '食积内停', '阴虚阳亢', '疮疡初起'],
            modernResearch: '增强免疫力，保护心脑血管，抗衰老'
        },
        {
            id: 3,
            name: '当归',
            latinName: 'Angelica sinensis (Oliv.) Diels',
            category: 'blood-tonifying',
            property: '甘、辛，温',
            meridian: '肝、心、脾经',
            efficacy: '补血活血，调经止痛，润肠通便',
            toxicity: '无毒',
            suggestedDosage: '6-12',
            maxDosage: '20',
            dosage: 9,
            favorite: false,
            flavor: ['甘', '辛'],
            contraindications: ['湿盛中满', '大便泄泻者'],
            modernResearch: '促进造血，调节子宫功能，抗炎镇痛'
        },
        {
            id: 4,
            name: '黄连',
            latinName: 'Coptis chinensis Franch.',
            category: 'heat-clearing',
            property: '苦，寒',
            meridian: '心、脾、胃、肝、胆、大肠经',
            efficacy: '清热燥湿，泻火解毒',
            toxicity: '无毒',
            suggestedDosage: '2-5',
            maxDosage: '10',
            dosage: 3,
            favorite: false,
            flavor: ['苦'],
            contraindications: ['脾胃虚寒', '阴虚津伤者'],
            modernResearch: '抗菌消炎，降血糖，抗心律失常'
        },
        {
            id: 5,
            name: '桂枝',
            latinName: 'Cinnamomum cassia Presl',
            category: 'exterior',
            property: '辛、甘，温',
            meridian: '心、肺、膀胱经',
            efficacy: '发汗解肌，温通经脉，助阳化气，平冲降逆',
            toxicity: '无毒',
            suggestedDosage: '3-9',
            maxDosage: '15',
            dosage: 6,
            favorite: false,
            flavor: ['辛', '甘'],
            contraindications: ['温热病', '阴虚火旺者'],
            modernResearch: '解热镇痛，抗菌抗病毒，改善微循环'
        },
        {
            id: 6,
            name: '茯苓',
            latinName: 'Poria cocos (Schw.) Wolf',
            category: 'dampness-removing',
            property: '甘、淡，平',
            meridian: '心、肺、脾、肾经',
            efficacy: '利水渗湿，健脾宁心',
            toxicity: '无毒',
            suggestedDosage: '10-15',
            maxDosage: '30',
            dosage: 12,
            favorite: false,
            flavor: ['甘', '淡'],
            contraindications: ['虚寒精滑', '气虚下陷者'],
            modernResearch: '利尿，增强免疫力，抗肿瘤'
        },
        {
            id: 7,
            name: '陈皮',
            latinName: 'Citrus reticulata Blanco',
            category: 'qi-regulating',
            property: '辛、苦，温',
            meridian: '肺、脾经',
            efficacy: '理气健脾，燥湿化痰',
            toxicity: '无毒',
            suggestedDosage: '3-10',
            maxDosage: '15',
            dosage: 6,
            favorite: false,
            flavor: ['辛', '苦'],
            contraindications: ['气虚证', '阴虚燥咳者'],
            modernResearch: '促进消化，祛痰平喘，抗炎'
        },
        {
            id: 8,
            name: '川芎',
            latinName: 'Ligusticum chuanxiong Hort.',
            category: 'blood-activating',
            property: '辛，温',
            meridian: '肝、胆、心包经',
            efficacy: '活血行气，祛风止痛',
            toxicity: '无毒',
            suggestedDosage: '3-9',
            maxDosage: '15',
            dosage: 6,
            favorite: false,
            flavor: ['辛'],
            contraindications: ['阴虚火旺', '多汗', '月经过多者'],
            modernResearch: '扩张血管，抗血小板聚集，改善脑循环'
        }
    ],

    prescriptions: [
        {
            id: 1,
            name: '四君子汤',
            source: '《太平惠民和剂局方》',
            efficacy: '益气健脾',
            mainDisease: '脾胃气虚证。面色萎白，语声低微，气短乏力，食少便溏，舌淡苔白，脉虚弱。',
            description: '四君子汤是治疗脾胃气虚证的基础方，后世众多补脾益气方剂多从此方衍化而来。',
            compatibilityScore: 95,
            medicines: [
                { id: 1, name: '人参', dosage: 9, role: 'monarch', efficacy: '大补元气，健脾养胃' },
                { id: 3, name: '白术', dosage: 9, role: 'minister', efficacy: '健脾燥湿' },
                { id: 6, name: '茯苓', dosage: 9, role: 'assistant', efficacy: '渗湿健脾' },
                { id: 4, name: '甘草', dosage: 6, role: 'envoy', efficacy: '中和调药' }
            ],
            compatibilityFeatures: '温而不燥，补而不峻',
            modernApplication: '慢性胃炎、胃溃疡、消化不良属脾胃气虚者',
            createdAt: '2024-01-15'
        },
        {
            id: 2,
            name: '六味地黄丸',
            source: '《小儿药证直诀》',
            efficacy: '滋阴补肾',
            mainDisease: '肾阴虚证。腰膝酸软，头晕目眩，耳鸣耳聋，盗汗，遗精，消渴，骨蒸潮热，手足心热，口燥咽干，牙齿动摇，小儿囟门不合，舌红少苔，脉沉细数。',
            description: '六味地黄丸是滋补肾阴的代表方剂，三补三泻，以补为主，肝脾肾三阴并补。',
            compatibilityScore: 92,
            medicines: [
                { id: 9, name: '熟地黄', dosage: 24, role: 'monarch', efficacy: '滋阴补肾，填精益髓' },
                { id: 10, name: '山茱萸', dosage: 12, role: 'minister', efficacy: '补养肝肾，涩精' },
                { id: 11, name: '山药', dosage: 12, role: 'minister', efficacy: '补益脾阴，固精' },
                { id: 12, name: '泽泻', dosage: 9, role: 'assistant', efficacy: '利湿泄浊，防熟地滋腻' },
                { id: 13, name: '牡丹皮', dosage: 9, role: 'assistant', efficacy: '清泄相火，制山茱萸温涩' },
                { id: 6, name: '茯苓', dosage: 9, role: 'assistant', efficacy: '淡渗脾湿，助山药健运' }
            ],
            compatibilityFeatures: '三补三泻，以补为主；肝脾肾三阴并补，以补肾阴为主',
            modernApplication: '慢性肾炎、高血压、糖尿病、更年期综合征等属肾阴虚者',
            createdAt: '2024-01-20'
        },
        {
            id: 3,
            name: '逍遥散',
            source: '《太平惠民和剂局方》',
            efficacy: '疏肝解郁，养血健脾',
            mainDisease: '肝郁血虚脾弱证。两胁作痛，头痛目眩，口燥咽干，神疲食少，或月经不调，乳房胀痛，脉弦而虚。',
            description: '逍遥散是疏肝解郁的代表方剂，肝脾同调，气血兼顾，疏养并施。',
            compatibilityScore: 88,
            medicines: [
                { id: 14, name: '柴胡', dosage: 9, role: 'monarch', efficacy: '疏肝解郁' },
                { id: 3, name: '当归', dosage: 9, role: 'minister', efficacy: '养血和血' },
                { id: 15, name: '白芍', dosage: 9, role: 'minister', efficacy: '养血敛阴，柔肝缓急' },
                { id: 2, name: '白术', dosage: 9, role: 'assistant', efficacy: '健脾祛湿' },
                { id: 6, name: '茯苓', dosage: 9, role: 'assistant', efficacy: '健脾渗湿' },
                { id: 16, name: '生姜', dosage: 6, role: 'assistant', efficacy: '温中和胃' },
                { id: 17, name: '薄荷', dosage: 6, role: 'assistant', efficacy: '疏散郁遏之气，透达肝经郁热' },
                { id: 18, name: '炙甘草', dosage: 6, role: 'envoy', efficacy: '益气补中，调和诸药' }
            ],
            compatibilityFeatures: '肝脾同调，气血兼顾，疏养并施',
            modernApplication: '慢性肝炎、肝硬化、更年期综合征、月经不调等属肝郁血虚脾弱者',
            createdAt: '2024-01-18'
        }
    ],

    // 分类数据
    categories: [
        { id: 'all', name: '全部药材', icon: 'el-icon-menu', count: 56 },
        { id: 'tonifying', name: '补虚药', icon: 'el-icon-orange', count: 12 },
        { id: 'heat-clearing', name: '清热药', icon: 'el-icon-fire', count: 8 },
        { id: 'exterior', name: '解表药', icon: 'el-icon-sunny', count: 9 },
        { id: 'dampness-removing', name: '祛湿药', icon: 'el-icon-cloudy', count: 6 },
        { id: 'qi-regulating', name: '理气药', icon: 'el-icon-wind-power', count: 7 },
        { id: 'blood-activating', name: '活血药', icon: 'el-icon-refresh', count: 6 },
        { id: 'blood-tonifying', name: '补血药', icon: 'el-icon-goblet-square-full', count: 5 }
    ],

    // 性味选项
    properties: [
        { label: '甘', value: 'sweet' },
        { label: '苦', value: 'bitter' },
        { label: '辛', value: 'pungent' },
        { label: '咸', value: 'salty' },
        { label: '酸', value: 'sour' },
        { label: '淡', value: 'bland' }
    ],

    // 功效选项
    efficacies: [
        { label: '补气', value: 'qi-tonifying' },
        { label: '补血', value: 'blood-tonifying' },
        { label: '补阴', value: 'yin-tonifying' },
        { label: '补阳', value: 'yang-tonifying' },
        { label: '清热', value: 'heat-clearing' },
        { label: '解毒', value: 'detoxifying' },
        { label: '活血', value: 'blood-activating' },
        { label: '理气', value: 'qi-regulating' },
        { label: '祛湿', value: 'dampness-removing' },
        { label: '解表', value: 'exterior-releasing' }
    ]
}

// Mock API 函数
export const mockAPI = {
    // 药材搜索
    searchMedicines: (params = {}) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filteredMedicines = [...mockData.medicines]

                // 关键词搜索
                if (params.keyword) {
                    filteredMedicines = filteredMedicines.filter(medicine =>
                        medicine.name.includes(params.keyword) ||
                        medicine.latinName.includes(params.keyword) ||
                        medicine.efficacy.includes(params.keyword)
                    )
                }

                // 分类筛选
                if (params.category && params.category !== 'all') {
                    filteredMedicines = filteredMedicines.filter(medicine =>
                        medicine.category === params.category
                    )
                }

                // 分页
                const page = params.page || 1
                const pageSize = params.pageSize || 12
                const start = (page - 1) * pageSize
                const end = start + pageSize
                const paginatedMedicines = filteredMedicines.slice(start, end)

                resolve({
                    code: 200,
                    data: {
                        list: paginatedMedicines,
                        total: filteredMedicines.length,
                        page,
                        pageSize,
                        totalPages: Math.ceil(filteredMedicines.length / pageSize)
                    }
                })
            }, 500)
        })
    },

    // 获取药材详情
    getMedicineDetail: (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const medicine = mockData.medicines.find(m => m.id === parseInt(id))
                if (medicine) {
                    resolve({
                        code: 200,
                        data: medicine
                    })
                } else {
                    resolve({
                        code: 404,
                        message: '药材未找到'
                    })
                }
            }, 300)
        })
    },

    // 获取分类
    getCategories: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    data: mockData.categories
                })
            }, 200)
        })
    },

    // 获取方剂列表
    getPrescriptions: (params = {}) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const page = params.page || 1
                const pageSize = params.pageSize || 10
                const start = (page - 1) * pageSize
                const end = start + pageSize

                resolve({
                    code: 200,
                    data: {
                        list: mockData.prescriptions.slice(start, end),
                        total: mockData.prescriptions.length,
                        page,
                        pageSize
                    }
                })
            }, 400)
        })
    },

    // 配伍分析
    analyzeCompatibility: (medicines) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 简单的配伍分析逻辑
                const tasteAnalysis = [
                    { name: '甘', percentage: 42, color: '#e6a23c' },
                    { name: '辛', percentage: 23, color: '#f56c6c' },
                    { name: '苦', percentage: 18, color: '#909399' }
                ]

                const meridianAnalysis = [
                    { name: '脾经', intensity: 85 },
                    { name: '肺经', intensity: 70 },
                    { name: '肝经', intensity: 60 }
                ]

                const synergyEffects = [
                    {
                        type: '补气效果',
                        effect: 15,
                        description: '黄芪与人参协同增强补气效果'
                    }
                ]

                const tabooList = medicines.some(m => m.name === '甘草') &&
                medicines.some(m => m.name === '甘遂') ? [
                    {
                        combination: '甘草+甘遂',
                        reason: '十八反禁忌，可能产生毒性反应',
                        severity: 'high'
                    }
                ] : []

                const safetySuggestions = [
                    '当前配伍整体偏温，适合虚寒体质人群',
                    '阴虚火旺者慎用，建议减少温性药材'
                ]

                resolve({
                    code: 200,
                    data: {
                        tasteAnalysis,
                        meridianAnalysis,
                        synergyEffects,
                        tabooList,
                        safetySuggestions,
                        compatibilityScore: tabooList.length > 0 ? 60 : 85
                    }
                })
            }, 800)
        })
    },

    // 保存处方
    savePrescription: (prescription) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newPrescription = {
                    ...prescription,
                    id: Date.now(),
                    createdAt: new Date().toISOString().split('T')[0]
                }
                mockData.prescriptions.unshift(newPrescription)

                resolve({
                    code: 200,
                    data: newPrescription,
                    message: '处方保存成功'
                })
            }, 500)
        })
    }
}

// 兼容旧的mockRequest
export const mockRequest = (data, delay = 500) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                data
            })
        }, delay)
    })
}