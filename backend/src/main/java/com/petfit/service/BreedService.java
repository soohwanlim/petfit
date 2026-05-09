package com.petfit.service;

import com.petfit.domain.Breed;
import com.petfit.exception.NotFoundException;
import com.petfit.repository.mysql.BreedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BreedService {

    private final BreedRepository repository;

    @Transactional(readOnly = true)
    public List<Breed> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Breed findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Breed not found: " + id));
    }
}
