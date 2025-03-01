package com.example.demo.resolvers;

import com.example.demo.dtos.ItemShoppingCartDTO;
import com.example.demo.models.ProductForShoppingCart;
import com.example.demo.services.ShoppingCartService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.stream.Collectors;

@Controller
public class ShoppingCartResolver {
    @Autowired
    ShoppingCartService shoppingCartService;
    @Autowired
    ModelMapper modelMapper;

    @QueryMapping
    public Long countProductsInCart(@Argument String username) {
        return shoppingCartService.getCountOfProducts(username);
    }

    @QueryMapping
    public List<ItemShoppingCartDTO> getProductsByUser(@Argument String username, @Argument int page, @Argument int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<ProductForShoppingCart> productList = shoppingCartService.getProducts(username, pageable);

        return productList.stream()
                .map(product -> modelMapper.map(product, ItemShoppingCartDTO.class))
                .collect(Collectors.toList());
    }

    @MutationMapping
    public Boolean addProducts(@Argument String username, @Argument List<ItemShoppingCartDTO> products) {
        List<ProductForShoppingCart> productsForService = products.stream()
                .map(product -> modelMapper.map(product, ProductForShoppingCart.class))
                .toList();
        shoppingCartService.saveProducts(username, productsForService);
        return true;
    }

    @MutationMapping
    public Boolean deleteProducts(@Argument String username, @Argument List<String> idProducts) {
        if (idProducts == null || idProducts.isEmpty()) {
            return false;
        }
        return shoppingCartService.removeProducts(username, idProducts);
    }
}
