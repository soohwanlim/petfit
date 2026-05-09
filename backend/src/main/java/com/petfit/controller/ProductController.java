package com.petfit.controller;

import com.petfit.controller.dto.CreateProductRequest;
import com.petfit.controller.dto.ProductDto;
import com.petfit.controller.dto.RiderDto;
import com.petfit.domain.InsuranceProduct;
import com.petfit.domain.Rider;
import com.petfit.service.InsuranceProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final InsuranceProductService productService;

    @GetMapping
    public List<ProductDto> list() {
        return productService.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto create(@Valid @RequestBody CreateProductRequest request) {
        InsuranceProduct product = new InsuranceProduct();
        product.setProductName(request.productName());
        product.setProvider(request.provider());
        product.setMonthlyPremium(request.monthlyPremium());
        if (request.riders() != null) {
            product.setRiders(request.riders().stream()
                    .map(r -> new Rider(r.riderName(), r.coveredDiseases(), r.coverageLimit()))
                    .toList());
        }
        return toDto(productService.save(product));
    }

    private ProductDto toDto(InsuranceProduct p) {
        List<RiderDto> riders = p.getRiders().stream()
                .map(r -> new RiderDto(r.getRiderName(), r.getCoveredDiseases(), r.getCoverageLimit()))
                .toList();
        return new ProductDto(p.getId(), p.getProductName(), p.getProvider(), p.getMonthlyPremium(), riders);
    }
}
