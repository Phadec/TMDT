function getImageFromAssets(imageName, folder = "") {
  return folder ? `/assets/${folder}/${imageName}` : `/assets/${imageName}`;
}

export { getImageFromAssets };
