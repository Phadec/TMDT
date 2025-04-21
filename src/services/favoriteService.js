import api from './api';

const favoriteService = {
  getUserFavorites: async () => {
    try {
      const query = `
        query {
          userFavorites {
            id
            username
            productId
            product {
              id
              title
              description
              price
              condition
              images
              location
              sellerUsername
              negotiable
              status
              createdAt
              updatedAt
              views
              favorites
              seller {
                id
                username
                firstName
                lastName
              }
              category {
                id
                name
              }
              isFavorited
            }
          }
        }
      `;

      const response = await api.graphql(query);
      
      if (response.data && response.data.data && response.data.data.userFavorites) {
        const favoriteProducts = response.data.data.userFavorites.map(fav => ({
          ...fav.product,
          favoriteId: fav.id
        }));
        return favoriteProducts;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  toggleFavorite: async (productId) => {
    try {
      const mutation = `
        mutation {
          toggleProductFavorite(id: "${productId}") {
            id
            isFavorited
          }
        }
      `;

      const response = await api.graphql(mutation);
      return response.data?.data?.toggleProductFavorite;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }
};

export default favoriteService;
