// Disease IDs: 1=HCM, 2=PKD(Kidney), 3=PRA(Retinal), 4=HipDysplasia, 5=PKDeficiency, 6=SMA, 7=Osteochondrodysplasia
// coveredDiseases: disease IDs this rider is relevant for breed-risk scoring
// illnessCategories: body-system illness history categories this rider explicitly covers
// waitingMonths: coverage waiting period in months

export const insuranceProducts = [
  {
    id: 'meritz',
    productName: '메리츠 펫퍼민트',
    provider: '메리츠화재',
    url: 'https://store.meritzfire.com/pet/product-cat.do',
    coverageRatio: 0.70,
    monthlyPremium: 35000,
    riders: [
      {
        riderName: '펫퍼민트 반려묘 통원의료비Ⅲ',
        coveredDiseases: [1, 2, 3, 4, 5, 6, 7],
        illnessCategories: ['피부/외이도', '호흡기', '소화기'],
        waitingMonths: 1,
      },
      {
        riderName: '펫퍼민트 반려묘 입원의료비Ⅲ',
        coveredDiseases: [1, 2, 3, 4, 5, 6, 7],
        illnessCategories: ['피부/외이도', '호흡기', '소화기'],
        waitingMonths: 1,
      },
      {
        riderName: '일반상해 후유장해(80% 이상)',
        coveredDiseases: [],
        waitingMonths: 0,
      },
    ],
  },
  {
    id: 'kb',
    productName: 'KB손보 KB펫보험',
    provider: 'KB손해보험',
    url: 'https://direct.kbinsure.co.kr/home/#/GL/LPC/LT_CM0101M/',
    coverageRatio: 0.70,
    monthlyPremium: 48000,
    riders: [
      {
        riderName: '반려동물의료비',
        coveredDiseases: [1, 2, 3, 4, 5, 6, 7],
        illnessCategories: ['피부/외이도', '호흡기', '소화기'],
        waitingMonths: 1,
      },
      {
        riderName: '반려동물의료비확장보장Ⅱ (주요치료, 고양이)',
        coveredDiseases: [1, 2, 7],
        waitingMonths: 3,
      },
      {
        riderName: 'MRI/CT',
        coveredDiseases: [1, 4, 6],
        waitingMonths: 1,
      },
      {
        riderName: '특정약물치료 Ⅱ',
        coveredDiseases: [5],
        waitingMonths: 3,
      },
      {
        riderName: '항암약물치료',
        coveredDiseases: [],
        illnessCategories: ['소화기'],
        waitingMonths: 3,
      },
      {
        riderName: '특정처치 (이물제거)',
        coveredDiseases: [],
        illnessCategories: ['소화기'],
        waitingMonths: 1,
      },
      {
        riderName: '반려동물위탁비용',
        coveredDiseases: [],
        waitingMonths: 0,
      },
      {
        riderName: '무지개다리 위로금',
        coveredDiseases: [],
        waitingMonths: 0,
      },
      {
        riderName: '반려동물 장례비용지원금',
        coveredDiseases: [],
        waitingMonths: 0,
      },
      {
        riderName: '일반상해 후유장해(80% 이상)',
        coveredDiseases: [],
        waitingMonths: 0,
      },
    ],
  },
  {
    id: 'hyundai',
    productName: '현대해상 굿앤굿우리펫보험',
    provider: '현대해상',
    url: 'https://direct.hi.co.kr/service.do?m=108256981a&petType=C',
    coverageRatio: 0.70,
    monthlyPremium: 38000,
    riders: [
      {
        riderName: '반려묘 의료비 (만 20세까지)',
        coveredDiseases: [1, 2, 3, 4, 5, 6, 7],
        illnessCategories: ['피부/외이도', '호흡기', '소화기'],
        waitingMonths: 1,
      },
      {
        riderName: '치과·방광염·복막염 의료비',
        coveredDiseases: [2],
        illnessCategories: ['비뇨기', '치과/구강'],
        waitingMonths: 6,
      },
      {
        riderName: 'MRI/CT 추가 보장',
        coveredDiseases: [1, 4, 6],
        waitingMonths: 1,
      },
      {
        riderName: '무지개다리 위로금',
        coveredDiseases: [],
        waitingMonths: 0,
      },
      {
        riderName: '반려동물돌봄비·응급실내원진료비',
        coveredDiseases: [],
        waitingMonths: 0,
      },
    ],
  },
  {
    id: 'samsung',
    productName: '삼성화재 반려묘보험',
    provider: '삼성화재',
    url: 'https://direct.samsungfire.com/mall/PP030705_001.html',
    coverageRatio: 0.70,
    monthlyPremium: 42000,
    riders: [
      {
        riderName: '반려묘 의료비 (기본)',
        coveredDiseases: [1, 2, 3, 4, 5, 6, 7],
        illnessCategories: ['피부/외이도', '호흡기', '소화기'],
        waitingMonths: 1,
      },
      {
        riderName: '비뇨기질환',
        coveredDiseases: [2],
        illnessCategories: ['비뇨기'],
        waitingMonths: 3,
      },
      {
        riderName: '범백혈구감소증',
        coveredDiseases: [],
        illnessCategories: ['소화기'],
        waitingMonths: 1,
      },
      {
        riderName: '허피스·칼리시',
        coveredDiseases: [],
        illnessCategories: ['호흡기'],
        waitingMonths: 1,
      },
      {
        riderName: '치과 및 구강질환 치료비',
        coveredDiseases: [],
        illnessCategories: ['치과/구강'],
        waitingMonths: 6,
      },
    ],
  },
]
