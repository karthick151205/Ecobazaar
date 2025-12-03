package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;
    private String email;
    private String password;
    private String role;

    private boolean approved;

    private String phone;
    private String storeName;
    private String address;
    private String profileImg;

    // ⭐ NEW FIELD — Eco Points
    private Double ecoPoints = 0.0;

    public User() {}

    // -----------------------------------------
    // GETTERS & SETTERS
    // -----------------------------------------

    public String getId() { 
        return id; 
    }
    public void setId(String id) { 
        this.id = id; 
    }

    public String getName() { 
        return name; 
    }
    public void setName(String name) { 
        this.name = name; 
    }

    public String getEmail() { 
        return email; 
    }
    public void setEmail(String email) { 
        this.email = email; 
    }

    public String getPassword() { 
        return password; 
    }
    public void setPassword(String password) { 
        this.password = password; 
    }

    public String getRole() { 
        return role; 
    }
    public void setRole(String role) { 
        this.role = role; 
    }

    public boolean isApproved() { 
        return approved; 
    }
    public void setApproved(boolean approved) { 
        this.approved = approved; 
    }

    public String getPhone() { 
        return phone; 
    }
    public void setPhone(String phone) { 
        this.phone = phone; 
    }

    public String getStoreName() { 
        return storeName; 
    }
    public void setStoreName(String storeName) { 
        this.storeName = storeName; 
    }

    public String getAddress() { 
        return address; 
    }
    public void setAddress(String address) { 
        this.address = address; 
    }

    public String getProfileImg() { 
        return profileImg; 
    }
    public void setProfileImg(String profileImg) { 
        this.profileImg = profileImg; 
    }

    // ⭐ NEW — Eco Points Getter/Setter
    public Double getEcoPoints() {
        return ecoPoints == null ? 0.0 : ecoPoints;
    }

    public void setEcoPoints(Double ecoPoints) {
        this.ecoPoints = ecoPoints == null ? 0.0 : ecoPoints;
    }
}
