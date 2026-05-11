package com.navette.backend.service;

import com.navette.backend.dto.ShuttleRequest;
import com.navette.backend.dto.ShuttleResponse;
import com.navette.backend.entity.Shuttle;
import com.navette.backend.entity.TransportCompany;
import com.navette.backend.repository.ShuttleRepository;
import com.navette.backend.repository.TransportCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShuttleService {

    private final ShuttleRepository shuttleRepository;
    private final TransportCompanyRepository transportCompanyRepository;

    public ShuttleResponse createShuttle(ShuttleRequest request) {
        TransportCompany company = transportCompanyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Transport company not found"));

        Shuttle shuttle = Shuttle.builder()
                .company(company)
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .description(request.getDescription())
                .build();

        Shuttle savedShuttle = shuttleRepository.save(shuttle);

        return mapToResponse(savedShuttle);
    }

    public List<ShuttleResponse> getCompanyShuttles(Long companyId) {
        return shuttleRepository.findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ShuttleResponse getShuttleById(Long id) {
        Shuttle shuttle = shuttleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shuttle not found"));

        return mapToResponse(shuttle);
    }

    public ShuttleResponse updateShuttle(Long id, ShuttleRequest request) {
        Shuttle shuttle = shuttleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shuttle not found"));

        TransportCompany company = transportCompanyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Transport company not found"));

        shuttle.setCompany(company);
        shuttle.setName(request.getName());
        shuttle.setType(request.getType());
        shuttle.setCapacity(request.getCapacity());
        shuttle.setDescription(request.getDescription());

        Shuttle updatedShuttle = shuttleRepository.save(shuttle);

        return mapToResponse(updatedShuttle);
    }

    public void deleteShuttle(Long id) {
        if (!shuttleRepository.existsById(id)) {
            throw new RuntimeException("Shuttle not found");
        }

        shuttleRepository.deleteById(id);
    }

    private ShuttleResponse mapToResponse(Shuttle shuttle) {
        return ShuttleResponse.builder()
                .id(shuttle.getId())
                .companyId(shuttle.getCompany().getId())
                .companyName(shuttle.getCompany().getCompanyName())
                .name(shuttle.getName())
                .type(shuttle.getType())
                .capacity(shuttle.getCapacity())
                .description(shuttle.getDescription())
                .status(shuttle.getStatus())
                .build();
    }
}