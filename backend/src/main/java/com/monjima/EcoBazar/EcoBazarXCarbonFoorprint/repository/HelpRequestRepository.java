package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.HelpRequest;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface HelpRequestRepository extends MongoRepository<HelpRequest, String> {
 List<HelpRequest> findByEmail(String email);
}
