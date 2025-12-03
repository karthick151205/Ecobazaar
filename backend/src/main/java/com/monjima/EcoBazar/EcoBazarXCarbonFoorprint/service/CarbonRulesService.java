package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.service;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.CarbonRules;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.CarbonRulesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarbonRulesService {

    @Autowired
    private CarbonRulesRepository repo;

    // Get Rules
    public CarbonRules getRules() {
        List<CarbonRules> all = repo.findAll();
        if (all.isEmpty()) {
            // Default Values
            CarbonRules defaults = new CarbonRules(
                    10, 50, 100,
                    5, 10, 20
            );
            return repo.save(defaults);
        }
        return all.get(0);
    }

    // Update Rules
    public CarbonRules updateRules(CarbonRules newRules) {
        CarbonRules existing = getRules();

        existing.setLowRange(newRules.getLowRange());
        existing.setMediumRange(newRules.getMediumRange());
        existing.setHighRange(newRules.getHighRange());

        existing.setLowScore(newRules.getLowScore());
        existing.setMediumScore(newRules.getMediumScore());
        existing.setHighScore(newRules.getHighScore());

        return repo.save(existing);
    }
}
