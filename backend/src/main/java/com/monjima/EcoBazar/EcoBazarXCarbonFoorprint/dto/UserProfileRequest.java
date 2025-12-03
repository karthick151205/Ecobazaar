package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto;

public class UserProfileRequest {
    private String name;
    private String phone;
    private String storeName;
    private String address;
    private String profileImg;

    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getStoreName() { return storeName; }
    public String getAddress() { return address; }
    public String getProfileImg() { return profileImg; }

    public void setName(String name) { this.name = name; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setStoreName(String storeName) { this.storeName = storeName; }
    public void setAddress(String address) { this.address = address; }
    public void setProfileImg(String profileImg) { this.profileImg = profileImg; }
}
