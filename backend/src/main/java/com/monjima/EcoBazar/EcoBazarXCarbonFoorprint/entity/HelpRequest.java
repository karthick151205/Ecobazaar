package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "help_requests")
public class HelpRequest {

    @Id
    private String id;

    private String email;
    private String message;
    private String reply;

    // ⭐ getters & setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) { this.reply = reply; }
}
