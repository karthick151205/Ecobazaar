package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmailAndRole(String email, String role);

    List<User> findAllByEmail(String email);

    List<User> findAllByRole(String role);

    List<User> findAllByRoleAndApproved(String role, boolean approved);
}
