export const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "https://ml-h6qf.onrender.com";
  console.log("DEBUG: Current API URL is:", url);
  return url;
};
