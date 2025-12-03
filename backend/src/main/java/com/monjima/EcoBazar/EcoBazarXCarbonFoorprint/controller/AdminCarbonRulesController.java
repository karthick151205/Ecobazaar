package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.CarbonRules;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.service.CarbonRulesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/carbon-rules")
@CrossOrigin(origins = "*")
public class AdminCarbonRulesController {

    @Autowired
    private CarbonRulesService service;

    // GET Rules
    @GetMapping
    public CarbonRules getRules() {
        return service.getRules();
    }

    // UPDATE Rules
    @PutMapping
    public CarbonRules updateRules(@RequestBody CarbonRules rules) {
        return service.updateRules(rules);
    }
}
