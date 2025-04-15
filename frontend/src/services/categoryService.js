import api from './api';

const categoryService = {
  // Lấy tất cả danh mục
  getAllCategories: async () => {
    try {
      const response = await api.graphql(`
        query {
          categories {
            id
            name
            slug
            description
            parentId
            image
            level
            isActive
          }
        }
      `);
      return response.data.data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Lấy danh mục theo ID
  getCategoryById: async (id) => {
    try {
      const response = await api.graphql(`
        query GetCategory($id: ID!) {
          category(id: $id) {
            id
            name
            slug
            description
            parentId
            image
            level
            isActive
          }
        }
      `, { id });
      return response.data.data.category;
    } catch (error) {
      console.error(`Error fetching category with id ${id}:`, error);
      return null;
    }
  },

  // Lấy danh mục theo slug
  getCategoryBySlug: async (slug) => {
    try {
      const response = await api.graphql(`
        query GetCategoryBySlug($slug: String!) {
          categoryBySlug(slug: $slug) {
            id
            name
            slug
            description
            parentId
            level
            isActive
          }
        }
      `, { slug });
      
      return response.data.data.categoryBySlug;
    } catch (error) {
      console.error(`Error fetching category with slug ${slug}:`, error);
      return null;
    }
  },

  // Lấy danh sách danh mục có sẵn
  getAvailableCategories: async () => {
    try {
      const response = await api.graphql(`
        query {
          categories {
            id
            name
            slug
            description
            parentId
            level
            isActive
          }
        }
      `);
      
      // Add defensive check to prevent undefined errors
      if (!response.data || !response.data.data) {
        console.warn('Unexpected GraphQL response format:', response);
        return [];
      }
      
      return response.data.data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },

  // Lấy danh sách danh mục gốc
  getRootCategories: async () => {
    try {
      const response = await api.graphql(`
        query {
          rootCategories {
            id
            name
            slug
            description
            imageUrl
            level
            childrenCount
          }
        }
      `);
      
      // Add defensive check
      if (!response.data || !response.data.data) {
        return [];
      }
      
      return response.data.data.rootCategories || [];
    } catch (error) {
      console.error('Error fetching root categories:', error);
      return [];
    }
  },

  // Lấy danh sách danh mục con
  getSubcategories: async (parentId) => {
    try {
      const response = await api.graphql(`
        query GetSubcategories($parentId: String!) {
          subcategories(parentId: $parentId) {
            id
            name
            slug
            description
            imageUrl
            level
            childrenCount
          }
        }
      `, { parentId });
      
      // Add defensive check
      if (!response.data || !response.data.data) {
        return [];
      }
      
      return response.data.data.subcategories || [];
    } catch (error) {
      console.error(`Error fetching subcategories for parent ${parentId}:`, error);
      return [];
    }
  },

  // Get product counts for each category
  getCategoryProductCounts: async () => {
    try {
      // First try to get the data from GraphQL categoryProductCounts endpoint
      // Explicitly request active products only (not sold or deleted)
      const response = await api.graphql(`
        query {
          categoryProductCounts(excludeStatuses: ["SOLD", "DELETED"]) {
            id
            count
          }
        }
      `);
      
      // Process the response to create a map of category ID to product count
      if (response?.data?.data?.categoryProductCounts) {
        const countMap = {};
        response.data.data.categoryProductCounts.forEach(item => {
          countMap[item.id] = item.count;
        });
        return countMap;
      }
      
      // Fallback: Get counts from category objects directly
      const categoriesResponse = await api.graphql(`
        query {
          categories {
            id
            activeProductCount
          }
        }
      `);
      
      if (categoriesResponse?.data?.data?.categories) {
        const countMap = {};
        categoriesResponse.data.data.categories.forEach(category => {
          countMap[category.id] = category.activeProductCount || 0;
        });
        return countMap;
      }
      
      // If both GraphQL methods fail, try REST API with query parameter to exclude sold products
      try {
        const restResponse = await api.get('/api/categories/product-counts?excludeSold=true');
        if (restResponse?.data) {
          return restResponse.data;
        }
      } catch (restError) {
        console.error('Error fetching category product counts via REST:', restError);
      }
      
      // If all methods fail, return empty object
      console.warn('All methods to fetch category counts failed, returning empty object');
      return {};
    } catch (error) {
      console.error('Error fetching category product counts:', error);
      return {};
    }
  }
};

export default categoryService;
