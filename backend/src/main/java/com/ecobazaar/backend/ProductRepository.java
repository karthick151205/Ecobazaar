package com.ecobazaar.backend;

import org.springframework.data.jpa.repository.JpaRepository;

// We tell it to manage 'Product' entities, and the ID type is 'Integer'
public interface ProductRepository extends JpaRepository<Product, Integer> {
    // That's it! Spring Data JPA does the rest.
}