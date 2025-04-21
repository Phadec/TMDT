// Default image paths
const DEFAULT_IMAGES = {
  heroBackground: "",
  placeholder: "",
  defaultAvatar: "",
  categoryPlaceholder: "",
};

function getImageFromAssets(imageName, folder = "") {
  return folder ? `/assets/${folder}/${imageName}` : `/assets/${imageName}`;
}

export default DEFAULT_IMAGES;
export { getImageFromAssets };
