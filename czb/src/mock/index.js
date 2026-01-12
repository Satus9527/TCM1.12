// 临时mock数据
export const mockData = {
    medicines: [
        {
            id: 1,
            name: '人参',
            latinName: 'Panax ginseng C. A. Mey.',
            category: 'tonifying',
            property: '甘、微苦，微温',
            meridian: '脾、肺、心、肾经',
            efficacy: '大补元气，复脉固脱，补脾益肺，生津养血，安神益智',
            toxicity: '无毒',
            suggestedDosage: '3-9',
            maxDosage: '15',
            dosage: 6,
            favorite: false,
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
            name: '白术',
            latinName: 'Atractylodes macrocephala Koidz.',
            category: 'tonifying',
            property: '苦、甘，温',
            meridian: '脾、胃经',
            efficacy: '健脾益气，燥湿利水，止汗，安胎',
            toxicity: '无毒',
            suggestedDosage: '6-12',
            maxDosage: '15',
            dosage: 9,
            favorite: false,
            flavor: ['苦', '甘'],
            contraindications: ['阴虚内热', '津液亏耗者'],
            modernResearch: '增强免疫功能，调节胃肠运动'
        },
        {
            id: 4,
            name: '甘草',
            latinName: 'Glycyrrhiza uralensis Fisch.',
            category: 'tonifying',
            property: '甘，平',
            meridian: '心、肺、脾、胃经',
            efficacy: '补脾益气，清热解毒，祛痰止咳，缓急止痛，调和诸药',
            toxicity: '无毒',
            suggestedDosage: '2-10',
            maxDosage: '15',
            dosage: 6,
            favorite: false,
            flavor: ['甘'],
            usage_notes: '清热解毒宜生用；补中缓急宜炙用',
            contraindications: ['湿盛中满', '呕恶及水肿者', '不宜与海藻、京大戟、红大戟、甘遂、芫花同用'],
            modernResearch: '抗炎，抗溃疡，镇咳祛痰'
        },
        {
            id: 5,
            name: '山药',
            latinName: 'Dioscorea opposita Thunb.',
            category: 'tonifying',
            property: '甘，平',
            meridian: '脾、肺、肾经',
            efficacy: '补脾养胃，生津益肺，补肾涩精',
            toxicity: '无毒',
            suggestedDosage: '15-30',
            maxDosage: '60',
            dosage: 20,
            favorite: false,
            flavor: ['甘'],
            contraindications: ['湿盛中满', '有积滞者'],
            modernResearch: '降血糖，增强免疫功能'
        },
        {
            id: 6,
            name: '大枣',
            latinName: 'Ziziphus jujuba Mill.',
            category: 'tonifying',
            property: '甘，温',
            meridian: '脾、胃、心经',
            efficacy: '补中益气，养血安神',
            toxicity: '无毒',
            suggestedDosage: '6-15',
            maxDosage: '30',
            dosage: 10,
            favorite: false,
            flavor: ['甘'],
            contraindications: ['湿盛脘腹胀满', '食积', '虫积', '齿病'],
            modernResearch: '增强免疫力，保护肝脏'
        },
        {
            id: 7,
            name: '炙甘草',
            latinName: 'Glycyrrhiza uralensis Fisch. (prepared)',
            category: 'tonifying',
            property: '甘，平',
            meridian: '心、肺、脾、胃经',
            efficacy: '补脾和胃，益气复脉',
            toxicity: '无毒',
            suggestedDosage: '2-10',
            maxDosage: '15',
            dosage: 6,
            favorite: false,
            flavor: ['甘'],
            usage_notes: '蜜炙，长于补中益气',
            contraindications: ['湿盛中满者'],
            modernResearch: '增强免疫功能，抗心律失常'
        },
        {
            id: 8,
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
            id: 9,
            name: '熟地黄',
            latinName: 'Rehmannia glutinosa Libosch. (prepared)',
            category: 'blood-tonifying',
            property: '甘，微温',
            meridian: '肝、肾经',
            efficacy: '滋阴补血，益精填髓',
            toxicity: '无毒',
            suggestedDosage: '9-15',
            maxDosage: '30',
            dosage: 12,
            favorite: false,
            flavor: ['甘'],
            contraindications: ['气滞痰多', '脘腹胀痛', '食少便溏者'],
            modernResearch: '促进造血，增强免疫功能'
        },
        {
            id: 10,
            name: '白芍',
            latinName: 'Paeonia lactiflora Pall.',
            category: 'blood-tonifying',
            property: '苦、酸，微寒',
            meridian: '肝、脾经',
            efficacy: '养血调经，敛阴止汗，柔肝止痛，平抑肝阳',
            toxicity: '无毒',
            suggestedDosage: '6-15',
            maxDosage: '30',
            dosage: 10,
            favorite: false,
            flavor: ['苦', '酸'],
            contraindications: ['阳衰虚寒之证', '不宜与藜芦同用'],
            modernResearch: '解痉，镇痛，抗炎'
        },
        // 继续添加剩余药材...
        {
            id: 11,
            name: '阿胶',
            latinName: 'Colla Corii Asini',
            category: 'blood-tonifying',
            property: '甘，平',
            meridian: '肺、肝、肾经',
            efficacy: '补血滋阴，润燥止血',
            toxicity: '无毒',
            suggestedDosage: '3-9',
            maxDosage: '15',
            dosage: 6,
            favorite: false,
            flavor: ['甘'],
            usage_notes: '烊化兑服',
            contraindications: ['脾胃虚弱', '消化不良者'],
            modernResearch: '促进造血，增强免疫力'
        },
        {
            id: 12,
            name: '麦冬',
            latinName: 'Ophiopogon japonicus (L.f) Ker-Gawl.',
            category: 'tonifying',
            property: '甘、微苦，微寒',
            meridian: '心、肺、胃经',
            efficacy: '养阴生津，润肺清心',
            toxicity: '无毒',
            suggestedDosage: '6-12',
            maxDosage: '30',
            dosage: 9,
            favorite: false,
            flavor: ['甘', '微苦'],
            contraindications: ['感冒风寒', '痰湿咳嗽者'],
            modernResearch: '降血糖，抗心肌缺血'
        },
        {
            id: 13,
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
            id: 14,
            name: '黄芩',
            latinName: 'Scutellaria baicalensis Georgi',
            category: 'heat-clearing',
            property: '苦，寒',
            meridian: '肺、胆、脾、大肠、小肠经',
            efficacy: '清热燥湿，泻火解毒，止血，安胎',
            toxicity: '无毒',
            suggestedDosage: '3-10',
            maxDosage: '15',
            dosage: 6,
            favorite: false,
            flavor: ['苦'],
            contraindications: ['脾胃虚寒', '食少便溏者'],
            modernResearch: '抗菌，抗炎，降血压'
        },
        {
            id: 15,
            name: '金银花',
            latinName: 'Lonicera japonica Thunb.',
            category: 'heat-clearing',
            property: '甘，寒',
            meridian: '肺、心、胃经',
            efficacy: '清热解毒，疏散风热',
            toxicity: '无毒',
            suggestedDosage: '6-15',
            maxDosage: '30',
            dosage: 10,
            favorite: false,
            flavor: ['甘'],
            contraindications: ['脾胃虚寒', '气虚疮疡脓清者'],
            modernResearch: '抗菌，抗病毒，抗炎'
        },
        // ... 继续添加剩余41味药材
        {
            id: 56,
            name: '枳壳',
            latinName: 'Citrus aurantium L.',
            category: 'qi-regulating',
            property: '苦、辛、酸，微寒',
            meridian: '脾、胃、大肠经',
            efficacy: '理气宽中，行滞消胀，化痰',
            toxicity: '无毒',
            suggestedDosage: '3-9',
            maxDosage: '15',
            dosage: 6,
            favorite: false,
            flavor: ['苦', '辛', '酸'],
            contraindications: ['孕妇慎用'],
            modernResearch: '调节胃肠运动，利胆'
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
                { id: 33, name: '茯苓', dosage: 9, role: 'assistant', efficacy: '渗湿健脾' },
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
                { id: 41, name: '山茱萸', dosage: 12, role: 'minister', efficacy: '补养肝肾，涩精' },
                { id: 5, name: '山药', dosage: 12, role: 'minister', efficacy: '补益脾阴，固精' },
                { id: 34, name: '泽泻', dosage: 9, role: 'assistant', efficacy: '利湿泄浊，防熟地滋腻' },
                { id: 18, name: '牡丹皮', dosage: 9, role: 'assistant', efficacy: '清泄相火，制山茱萸温涩' },
                { id: 33, name: '茯苓', dosage: 9, role: 'assistant', efficacy: '淡渗脾湿，助山药健运' }
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
                { id: 43, name: '柴胡', dosage: 9, role: 'monarch', efficacy: '疏肝解郁' },
                { id: 8, name: '当归', dosage: 9, role: 'minister', efficacy: '养血和血' },
                { id: 10, name: '白芍', dosage: 9, role: 'minister', efficacy: '养血敛阴，柔肝缓急' },
                { id: 3, name: '白术', dosage: 9, role: 'assistant', efficacy: '健脾祛湿' },
                { id: 33, name: '茯苓', dosage: 9, role: 'assistant', efficacy: '健脾渗湿' },
                { id: 44, name: '生姜', dosage: 6, role: 'assistant', efficacy: '温中和胃' },
                { id: 45, name: '薄荷', dosage: 6, role: 'assistant', efficacy: '疏散郁遏之气，透达肝经郁热' },
                { id: 7, name: '炙甘草', dosage: 6, role: 'envoy', efficacy: '益气补中，调和诸药' }
            ],
            compatibilityFeatures: '肝脾同调，气血兼顾，疏养并施',
            modernApplication: '慢性肝炎、肝硬化、更年期综合征、月经不调等属肝郁血虚脾弱者',
            createdAt: '2024-01-18'
        },
        {
            id: 4,
            name: '桂枝汤',
            source: '《伤寒论》',
            efficacy: '解肌发表，调和营卫',
            mainDisease: '外感风寒表虚证。头痛发热，汗出恶风，鼻鸣干呕，苔白不渴，脉浮缓或浮弱。',
            description: '桂枝汤是治疗外感风寒表虚证的代表方剂，被誉为"群方之冠"。',
            compatibilityScore: 90,
            medicines: [
                { id: 46, name: '桂枝', dosage: 9, role: 'monarch', efficacy: '解肌发表，散外感风寒' },
                { id: 10, name: '白芍', dosage: 9, role: 'minister', efficacy: '益阴敛营，敛固外泄之营阴' },
                { id: 44, name: '生姜', dosage: 9, role: 'assistant', efficacy: '辛温散寒，助桂枝解表' },
                { id: 6, name: '大枣', dosage: 3, role: 'assistant', efficacy: '滋阴益阳，补益脾胃' },
                { id: 4, name: '甘草', dosage: 6, role: 'envoy', efficacy: '调和诸药' }
            ],
            compatibilityFeatures: '发散与酸收相配，使散中有收，汗中寓补',
            modernApplication: '感冒、流行性感冒、原因不明的低热、产后发热等属营卫不和者',
            createdAt: '2024-01-22'
        },
        {
            id: 5,
            name: '麻黄汤',
            source: '《伤寒论》',
            efficacy: '发汗解表，宣肺平喘',
            mainDisease: '外感风寒表实证。恶寒发热，头身疼痛，无汗而喘，舌苔薄白，脉浮紧。',
            description: '麻黄汤是治疗外感风寒表实证的代表方剂，发汗力强。',
            compatibilityScore: 85,
            medicines: [
                { id: 47, name: '麻黄', dosage: 9, role: 'monarch', efficacy: '发汗解表，宣肺平喘' },
                { id: 46, name: '桂枝', dosage: 6, role: 'minister', efficacy: '解肌发表，温经散寒' },
                { id: 39, name: '杏仁', dosage: 6, role: 'assistant', efficacy: '降利肺气，与麻黄相配，宣降肺气以增平喘之功' },
                { id: 4, name: '甘草', dosage: 3, role: 'envoy', efficacy: '缓和麻、桂峻烈之性，调和诸药' }
            ],
            compatibilityFeatures: '麻桂相须，发卫气之闭以开腠理，透营分之郁以畅营阴',
            modernApplication: '感冒、流行性感冒、急性支气管炎、支气管哮喘等属风寒表实证者',
            createdAt: '2024-01-25'
        },
        // 继续添加剩余10个方剂...
        {
            id: 15,
            name: '银翘散',
            source: '《温病条辨》',
            efficacy: '辛凉透表，清热解毒',
            mainDisease: '温病初起。发热，微恶风寒，无汗或有汗不畅，头痛口渴，咳嗽咽痛，舌尖红，苔薄白或薄黄，脉浮数。',
            description: '银翘散是治疗温病初起的代表方剂，辛凉平剂。',
            compatibilityScore: 87,
            medicines: [
                { id: 16, name: '连翘', dosage: 15, role: 'monarch', efficacy: '清热解毒，透邪外出' },
                { id: 15, name: '金银花', dosage: 15, role: 'monarch', efficacy: '清热解毒，透邪外出' },
                { id: 38, name: '桔梗', dosage: 6, role: 'minister', efficacy: '宣肺利咽' },
                { id: 45, name: '薄荷', dosage: 6, role: 'minister', efficacy: '辛凉解表，助君药透邪' },
                { id: 19, name: '竹叶', dosage: 4, role: 'assistant', efficacy: '清热生津' },
                { id: 4, name: '甘草', dosage: 5, role: 'envoy', efficacy: '调和诸药' },
                { id: 49, name: '荆芥穗', dosage: 4, role: 'assistant', efficacy: '辛散表邪' },
                { id: 50, name: '淡豆豉', dosage: 5, role: 'assistant', efficacy: '辛散表邪' },
                { id: 51, name: '牛蒡子', dosage: 6, role: 'assistant', efficacy: '解毒利咽' }
            ],
            compatibilityFeatures: '辛凉之中少佐辛温之品，既利透邪，又不悖辛凉之旨',
            modernApplication: '流行性感冒、急性扁桃体炎、麻疹初起属风热表证者',
            createdAt: '2024-02-10'
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