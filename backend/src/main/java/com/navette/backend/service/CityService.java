package com.navette.backend.service;

import com.navette.backend.dto.CityRequest;
import com.navette.backend.dto.CityResponse;
import com.navette.backend.entity.City;
import com.navette.backend.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CityService {

    private final CityRepository cityRepository;

    public List<CityResponse> getAllCities() {
        return cityRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CityResponse getCityById(Long id) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("City not found"));

        return mapToResponse(city);
    }

    public List<CityResponse> searchCities(String name) {
        return cityRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CityResponse createCity(CityRequest request) {
        City city = City.builder()
                .name(request.getName())
                .country(request.getCountry())
                .build();

        City savedCity = cityRepository.save(city);

        return mapToResponse(savedCity);
    }

    public CityResponse updateCity(Long id, CityRequest request) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("City not found"));

        city.setName(request.getName());
        city.setCountry(request.getCountry());

        City updatedCity = cityRepository.save(city);

        return mapToResponse(updatedCity);
    }

    public void deleteCity(Long id) {
        if (!cityRepository.existsById(id)) {
            throw new RuntimeException("City not found");
        }

        cityRepository.deleteById(id);
    }

    private CityResponse mapToResponse(City city) {
        return CityResponse.builder()
                .id(city.getId())
                .name(city.getName())
                .country(city.getCountry())
                .build();
    }
}