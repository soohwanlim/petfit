package com.petfit.controller;

import com.petfit.controller.dto.BreedDto;
import com.petfit.service.BreedService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/breeds")
@RequiredArgsConstructor
public class BreedController {

    private final BreedService breedService;

    @GetMapping
    public List<BreedDto> list() {
        return breedService.findAll().stream()
                .map(b -> new BreedDto(b.getId(), b.getName(), b.getDescription()))
                .toList();
    }

    @GetMapping("/{id}")
    public BreedDto get(@PathVariable Long id) {
        var b = breedService.findById(id);
        return new BreedDto(b.getId(), b.getName(), b.getDescription());
    }
}
