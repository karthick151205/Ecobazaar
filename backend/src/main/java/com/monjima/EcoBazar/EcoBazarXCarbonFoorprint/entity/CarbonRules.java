package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "carbon_rules")
public class CarbonRules {

    @Id
    private String id;

    // =======================
    // ⭐ YOUR EXISTING FIELDS
    // =======================
    private int lowRange;
    private int mediumRange;
    private int highRange;

    private int lowScore;
    private int mediumScore;
    private int highScore;

    // ==================================================
    // ⭐ NEW FIELDS (needed for seller eco-points rules)
    // ==================================================

    private double baseEcoPoints = 10;
    private double plasticMultiplier = 1.5;
    private double clothingMultiplier = 0.7;
    private double electronicsMultiplier = 2.0;
    private double accessoriesMultiplier = 0.9;

    public CarbonRules() {}

    public CarbonRules(int lowRange, int mediumRange, int highRange,
                       int lowScore, int mediumScore, int highScore) {
        this.lowRange = lowRange;
        this.mediumRange = mediumRange;
        this.highRange = highRange;
        this.lowScore = lowScore;
        this.mediumScore = mediumScore;
        this.highScore = highScore;
    }

    // ======================
    // ⭐ GETTERS & SETTERS
    // ======================

    public String getId() { return id; }

    public int getLowRange() { return lowRange; }
    public void setLowRange(int lowRange) { this.lowRange = lowRange; }

    public int getMediumRange() { return mediumRange; }
    public void setMediumRange(int mediumRange) { this.mediumRange = mediumRange; }

    public int getHighRange() { return highRange; }
    public void setHighRange(int highRange) { this.highRange = highRange; }

    public int getLowScore() { return lowScore; }
    public void setLowScore(int lowScore) { this.lowScore = lowScore; }

    public int getMediumScore() { return mediumScore; }
    public void setMediumScore(int mediumScore) { this.mediumScore = mediumScore; }

    public int getHighScore() { return highScore; }
    public void setHighScore(int highScore) { this.highScore = highScore; }


    // ⭐ NEW GETTERS/SETTERS

    public double getBaseEcoPoints() { return baseEcoPoints; }
    public void setBaseEcoPoints(double baseEcoPoints) { this.baseEcoPoints = baseEcoPoints; }

    public double getPlasticMultiplier() { return plasticMultiplier; }
    public void setPlasticMultiplier(double plasticMultiplier) { this.plasticMultiplier = plasticMultiplier; }

    public double getClothingMultiplier() { return clothingMultiplier; }
    public void setClothingMultiplier(double clothingMultiplier) { this.clothingMultiplier = clothingMultiplier; }

    public double getElectronicsMultiplier() { return electronicsMultiplier; }
    public void setElectronicsMultiplier(double electronicsMultiplier) { this.electronicsMultiplier = electronicsMultiplier; }

    public double getAccessoriesMultiplier() { return accessoriesMultiplier; }
    public void setAccessoriesMultiplier(double accessoriesMultiplier) { this.accessoriesMultiplier = accessoriesMultiplier; }
}
