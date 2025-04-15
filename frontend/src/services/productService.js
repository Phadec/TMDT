import api from './api';

const productService = {
  getProducts: async (page = 0, size = 12) => {
    try {
      console.log(`Fetching products with page=${page}, size=${size}`);
      
      const response = await api.graphql(`
        query GetProducts($page: Int!, $size: Int!) {
          products(page: $page, size: $size) {
            id
            title
            price
            images
            location
            createdAt
            condition
            negotiable
            views
            favorites
            sellerUsername
            status
            categoryId
            category {
              id
              name
            }
          }
        }
      `, { page, size });
      
      // Log response details for debugging
      console.log('GraphQL response:', response);
      
      // Add defensive check
      if (!response.data || !response.data.data) {
        console.warn('Unexpected response format:', response);
        return [];
      }
      
      // Check if there are GraphQL errors
      if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        return [];
      }
      
      // Filter out sold products
      const products = response.data.data.products || [];
      console.log('Products received from API:', products);
      
      const activeProducts = products.filter(product => product.status !== 'SOLD');
      console.log('Active products after filtering:', activeProducts);
      
      // Ensure each product has a valid category object
      return activeProducts.map(product => {
        if (!product.category && product.categoryId) {
          // If category object is missing but we have categoryId, create a placeholder
          product.category = { id: product.categoryId, name: "Loading..." };
        }
        return product;
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      return []; // Return empty array instead of throwing
    }
  },

  getProductById: async (id) => {
    try {
      const response = await api.graphql(`
        query GetProduct($id: ID!) {
          product(id: $id) {
            id
            title
            description
            price
            images
            location
            condition
            negotiable
            status
            views
            favorites
            createdAt
            updatedAt
            sellerUsername
            quantity
            category {
              id
              name
              slug
            }
            seller {
              username
              firstName
              lastName
              avatar
              phoneNumber
            }
          }
        }
      `, { id });
      
      // Add defensive check
      if (!response.data || !response.data.data) {
        return null;
      }
      
      const product = response.data.data.product;
      
      // Return null if product is sold, unless viewing your own product
      if (product && product.status === 'SOLD') {
        // The current user's username would be checked here if we need to show their own sold items
        // For now, we're simply not showing any sold products
        return null;
      }
      
      return product;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      return null;
    }
  },

  getProductsByCategory: async (categoryId, page = 0, size = 12) => {
    try {
      const response = await api.graphql(`
        query GetProductsByCategory($categoryId: ID!, $page: Int!, $size: Int!) {
          productsByCategory(categoryId: $categoryId, page: $page, size: $size) {
            id
            title
            price
            images
            location
            createdAt
            condition
            negotiable
            views
            favorites
            sellerUsername
            status
            category {
              id
              name
            }
          }
        }
      `, { categoryId, page, size });
      
      // Add defensive check
      if (!response.data || !response.data.data) {
        return [];
      }
      
      // Filter out sold products
      const products = response.data.data.productsByCategory || [];
      return products.filter(product => product.status !== 'SOLD');
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      return [];
    }
  },

  // New method for filtered products
  getFilteredProductsByCategory: async (params) => {
    try {
      // For now, this uses the regular getProductsByCategory and filters client-side
      // In a real implementation, this would make a specialized GraphQL query with filter params
      const products = await productService.getProductsByCategory(
        params.categoryId, 
        params.page || 0, 
        params.size || 12
      );
      
      // Client-side filtering
      let filteredProducts = [...products];
      
      // Products are already filtered for "SOLD" status in getProductsByCategory
      
      // Filter by price range if specified
      if (params.minPrice !== undefined && params.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => 
          p.price >= params.minPrice && p.price <= params.maxPrice
        );
      } else if (params.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price >= params.minPrice);
      } else if (params.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price <= params.maxPrice);
      }
      
      // Filter by condition if specified
      if (params.condition && params.condition !== 'all') {
        filteredProducts = filteredProducts.filter(p => 
          p.condition === params.condition
        );
      }
      
      // Apply sorting
      if (params.sortBy) {
        switch(params.sortBy) {
          case 'price_asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case 'popular':
            filteredProducts.sort((a, b) => b.views - a.views);
            break;
          case 'newest':
          default:
            // Default is newest first, which should already be the case
            filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        }
      }
      
      // Mock the total count (in a real implementation, this would come from the server)
      const totalCount = filteredProducts.length;
      
      return { 
        products: filteredProducts.slice(0, params.size || 12), 
        totalCount 
      };
    } catch (error) {
      console.error('Error fetching filtered products:', error);
      return { products: [], totalCount: 0 };
    }
  },

  getSellerProducts: async (username, status = 'ACTIVE') => {
    try {
      const response = await api.graphql(`
        query GetSellerProducts($username: String!, $status: String!) {
          sellerProducts(username: $username, status: $status) {
            id
            title
            price
            images
            location
            createdAt
            condition
            negotiable
            views
            favorites
            status
            category {
              id
              name
            }
          }
        }
      `, { username, status });
      
      // Add defensive check
      if (!response.data || !response.data.data) {
        return [];
      }
      
      return response.data.data.sellerProducts || [];
    } catch (error) {
      console.error(`Error fetching products for seller ${username}:`, error);
      return [];
    }
  },

  toggleProductStatus: async (productId, status) => {
    try {
      const response = await api.graphql(`
        mutation ToggleProductStatus($id: ID!, $status: String!) {
          toggleProductStatus(id: $id, status: $status) {
            id
            status
          }
        }
      `, { id: productId, status });
      
      // Add defensive check
      if (!response.data || !response.data.data) {
        return null;
      }
      
      return response.data.data.toggleProductStatus;
    } catch (error) {
      console.error(`Error updating product status:`, error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      const response = await api.graphql(`
        mutation DeleteProduct($id: ID!) {
          deleteProduct(id: $id)
        }
      `, { id: productId });
      
      // Add defensive check
      if (!response.data || !response.data.data) {
        return false;
      }
      
      return response.data.data.deleteProduct;
    } catch (error) {
      console.error(`Error deleting product:`, error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      // Log the request for debugging
      console.log(`Updating product ${id} with data:`, productData);
      
      const response = await api.graphql(`
        mutation UpdateProduct($id: ID!, $input: ProductInput!) {
          updateProduct(id: $id, input: $input) {
            id
            title
            status
            updatedAt
          }
        }
      `, {
        id,
        input: {
          title: productData.title,
          description: productData.description,
          price: parseFloat(productData.price),
          categoryId: productData.categoryId,
          condition: productData.condition,
          images: productData.images,
          location: productData.location,
          negotiable: productData.negotiable
        }
      });
      
      // Add defensive check
      if (!response.data || !response.data.data) {
        console.error('Unexpected response format:', response);
        throw new Error('Invalid server response');
      }
      
      if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        throw new Error(response.data.errors[0]?.message || 'Unknown GraphQL error');
      }
      
      return response.data.data.updateProduct;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }
};

export default productService;
