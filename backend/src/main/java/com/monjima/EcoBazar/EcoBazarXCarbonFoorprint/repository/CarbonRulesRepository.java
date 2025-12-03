package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.CarbonRules;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarbonRulesRepository extends MongoRepository<CarbonRules, String> {

    CarbonRules findFirstByOrderByIdAsc();

}
