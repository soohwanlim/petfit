package com.petfit.config;

import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.Rider;
import com.petfit.repository.mongo.InsuranceProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MongoDataLoader implements CommandLineRunner {

    // Disease name constants matching MySQL seed data
    private static final String HCM  = "Hypertrophic Cardiomyopathy";
    private static final String PKD  = "Polycystic Kidney Disease";
    private static final String PRA  = "Progressive Retinal Atrophy";
    private static final String HIP  = "Hip Dysplasia";
    private static final String PKD2 = "Pyruvate Kinase Deficiency";
    private static final String SMA  = "Spinal Muscular Atrophy";
    private static final String OCD  = "Osteochondrodysplasia";
    private static final List<String> ALL_DISEASES = List.of(HCM, PKD, PRA, HIP, PKD2, SMA, OCD);

    private final InsuranceProductRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() > 0) return;
        repository.saveAll(buildProducts());
    }

    private List<InsuranceProduct> buildProducts() {
        return List.of(
            product("meritz", "메리츠 펫퍼민트", "메리츠화재",
                    "https://store.meritzfire.com/pet/product-cat.do", 0.70, 35000.0, List.of(
                rider("펫퍼민트 반려묘 통원의료비Ⅲ",    ALL_DISEASES, 5000.0, 1,  List.of("피부/외이도", "호흡기", "소화기")),
                rider("펫퍼민트 반려묘 입원의료비Ⅲ",    ALL_DISEASES, 5000.0, 1,  List.of("피부/외이도", "호흡기", "소화기")),
                rider("일반상해 후유장해(80% 이상)",     List.of(),    null,   0,  null)
            )),
            product("kb", "KB손보 KB펫보험", "KB손해보험",
                    "https://direct.kbinsure.co.kr/home/#/GL/LPC/LT_CM0101M/", 0.70, 48000.0, List.of(
                rider("반려동물의료비",                   ALL_DISEASES,           4000.0, 1,  List.of("피부/외이도", "호흡기", "소화기")),
                rider("반려동물의료비확장보장Ⅱ",          List.of(HCM, PKD, OCD), 3000.0, 3,  null),
                rider("MRI/CT",                          List.of(HCM, HIP, SMA), 2000.0, 1,  null),
                rider("특정약물치료 Ⅱ",                  List.of(PKD2),          2000.0, 3,  null),
                rider("항암약물치료",                     List.of(),              1000.0, 3,  List.of("소화기")),
                rider("특정처치 (이물제거)",              List.of(),              500.0,  1,  List.of("소화기")),
                rider("무지개다리 위로금",               List.of(),              null,   0,  null),
                rider("반려동물 장례비용지원금",          List.of(),              null,   0,  null),
                rider("일반상해 후유장해(80% 이상)",     List.of(),              null,   0,  null)
            )),
            product("hyundai", "현대해상 굿앤굿우리펫보험", "현대해상",
                    "https://direct.hi.co.kr/service.do?m=108256981a&petType=C", 0.70, 38000.0, List.of(
                rider("반려묘 의료비 (만 20세까지)",     ALL_DISEASES,           5000.0, 1,  List.of("피부/외이도", "호흡기", "소화기")),
                rider("치과·방광염·복막염 의료비",       List.of(PKD),           2000.0, 6,  List.of("비뇨기", "치과/구강")),
                rider("MRI/CT 추가 보장",               List.of(HCM, HIP, SMA), 2000.0, 1,  null),
                rider("무지개다리 위로금",               List.of(),              null,   0,  null),
                rider("반려동물돌봄비·응급실내원진료비", List.of(),              null,   0,  null)
            )),
            product("samsung", "삼성화재 반려묘보험", "삼성화재",
                    "https://direct.samsungfire.com/mall/PP030705_001.html", 0.70, 42000.0, List.of(
                rider("반려묘 의료비 (기본)",             ALL_DISEASES,           5000.0, 1,  List.of("피부/외이도", "호흡기", "소화기")),
                rider("비뇨기질환",                       List.of(PKD),           2000.0, 3,  List.of("비뇨기")),
                rider("범백혈구감소증",                   List.of(),              1000.0, 1,  List.of("소화기")),
                rider("허피스·칼리시",                   List.of(),              1000.0, 1,  List.of("호흡기")),
                rider("치과 및 구강질환 치료비",          List.of(),              1500.0, 6,  List.of("치과/구강"))
            ))
        );
    }

    private InsuranceProduct product(String id, String name, String provider,
                                      String url, double coverageRatio, double premium,
                                      List<Rider> riders) {
        InsuranceProduct p = new InsuranceProduct();
        p.setId(id);
        p.setProductName(name);
        p.setProvider(provider);
        p.setUrl(url);
        p.setCoverageRatio(coverageRatio);
        p.setMonthlyPremium(premium);
        p.setRiders(riders);
        return p;
    }

    private Rider rider(String name, List<String> diseases, Double limit,
                         int waitingMonths, List<String> illnessCategories) {
        Rider r = new Rider();
        r.setRiderName(name);
        r.setCoveredDiseases(diseases);
        r.setCoverageLimit(limit);
        r.setWaitingMonths(waitingMonths);
        r.setIllnessCategories(illnessCategories);
        return r;
    }
}
